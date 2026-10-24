
from pydantic import BaseModel, Field


class PredictionItem(BaseModel):
    class_name: str
    label: str
    score: float
    percentage: float


class PredictionResponse(BaseModel):
    filename: str
    predicted_class: str
    predicted_label: str

    confidence: float = Field(ge=0, le=1)
    confidence_percentage: float = Field(ge=0, le=100)

    predictions: list[PredictionItem]

    disclaimer: str = (
        "AI-generated classification only. "
        "This is not a confirmed plant disease diagnosis."
    )


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    total_classes: int
