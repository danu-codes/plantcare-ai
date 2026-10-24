
from contextlib import asynccontextmanager

from fastapi import (
    FastAPI,
    UploadFile,
    File,
    HTTPException,
)
from fastapi.middleware.cors import CORSMiddleware
from starlette.concurrency import run_in_threadpool

from .config import (
    ALLOWED_ORIGINS,
    ALLOWED_IMAGE_TYPES,
    MAX_FILE_SIZE,
)

from .schemas import (
    PredictionResponse,
    HealthResponse,
)

from .model_service import (
    plant_model,
    InvalidImageError,
)


# Load our trained CNN model when FastAPI starts
@asynccontextmanager
async def lifespan(app: FastAPI):
    await run_in_threadpool(plant_model.load)
    yield


app = FastAPI(
    title="PlantCare AI API",
    description="AI-powered plant disease detection",
    version="1.0.0",
    lifespan=lifespan,
)


# Allow React frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.get("/")
def home():
    return {
        "application": "PlantCare AI",
        "message": "Backend running successfully",
        "version": "1.0.0",
    }


@app.get("/health", response_model=HealthResponse)
def health():
    loaded = plant_model.model is not None

    return {
        "status": "healthy" if loaded else "unavailable",
        "model_loaded": loaded,
        "total_classes": len(plant_model.class_names),
    }


@app.get("/classes")
def get_classes():
    return {
        "total": len(plant_model.class_names),
        "classes": [
            {
                "id": index,
                "name": name,
                "label": plant_model.format_label(name),
            }
            for index, name in enumerate(
                plant_model.class_names
            )
        ],
    }


@app.post(
    "/predict",
    response_model=PredictionResponse,
)
async def predict(file: UploadFile = File(...)):

    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=415,
            detail="Only JPG, PNG and WebP images are supported",
        )

    try:
        content = await file.read(MAX_FILE_SIZE + 1)

        if not content:
            raise HTTPException(
                status_code=400,
                detail="Uploaded image is empty",
            )

        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail="Image must not exceed 5 MB",
            )

        try:
            result = await run_in_threadpool(
                plant_model.predict,
                content,
            )

        except InvalidImageError as error:
            raise HTTPException(
                status_code=400,
                detail=str(error),
            )

        return {
            "filename": file.filename or "uploaded-image",
            **result,
        }

    finally:
        await file.close()
