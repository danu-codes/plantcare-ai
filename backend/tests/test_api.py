
import io

from fastapi.testclient import TestClient
from PIL import Image

from app.main import app


def make_test_image():
    image = Image.new(
        "RGB",
        (128, 128),
        color=(30, 150, 60),
    )

    buffer = io.BytesIO()
    image.save(buffer, format="PNG")

    return buffer.getvalue()


def test_home():
    with TestClient(app) as client:
        response = client.get("/")

        assert response.status_code == 200
        assert response.json()["application"] == "PlantCare AI"


def test_health():
    with TestClient(app) as client:
        response = client.get("/health")

        assert response.status_code == 200
        assert response.json()["model_loaded"] is True


def test_classes():
    with TestClient(app) as client:
        response = client.get("/classes")

        assert response.status_code == 200
        data = response.json()

        assert data["total"] > 0
        assert len(data["classes"]) == data["total"]


def test_valid_image():
    image_bytes = make_test_image()

    with TestClient(app) as client:
        response = client.post(
            "/predict",
            files={
                "file": (
                    "leaf.png",
                    image_bytes,
                    "image/png",
                )
            },
        )

        assert response.status_code == 200

        data = response.json()

        assert "predicted_class" in data
        assert 0 <= data["confidence"] <= 1
        assert len(data["predictions"]) > 0
        assert len(data["predictions"]) <= 5


def test_invalid_file_type():
    with TestClient(app) as client:
        response = client.post(
            "/predict",
            files={
                "file": (
                    "notes.txt",
                    b"Hello world",
                    "text/plain",
                )
            },
        )

        assert response.status_code == 415


def test_corrupted_image():
    with TestClient(app) as client:
        response = client.post(
            "/predict",
            files={
                "file": (
                    "broken.png",
                    b"not a real image",
                    "image/png",
                )
            },
        )

        assert response.status_code == 400


def test_oversized_file():
    with TestClient(app) as client:
        response = client.post(
            "/predict",
            files={
                "file": (
                    "large.png",
                    b"x" * (5 * 1024 * 1024 + 1),
                    "image/png",
                )
            },
        )

        assert response.status_code == 413


def test_missing_file():
    with TestClient(app) as client:
        response = client.post("/predict")

        assert response.status_code == 422
