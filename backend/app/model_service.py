
import io
import json
import threading

import numpy as np
import tensorflow as tf

from PIL import Image, ImageOps, UnidentifiedImageError

from .config import (
    MODEL_PATH,
    CLASS_NAMES_PATH,
    MAX_FILE_SIZE,
    TOP_K,
)


class InvalidImageError(Exception):
    pass


class PlantDiseaseModel:
    def __init__(self):
        self.model = None
        self.class_names = []
        self.image_size = (128, 128)
        self._lock = threading.Lock()

    def load(self):
        if not MODEL_PATH.is_file():
            raise FileNotFoundError(
                f"Model not found: {MODEL_PATH}"
            )

        if not CLASS_NAMES_PATH.is_file():
            raise FileNotFoundError(
                f"Class names not found: {CLASS_NAMES_PATH}"
            )

        # Load only our trusted Colab-trained model.
        self.model = tf.keras.models.load_model(
            MODEL_PATH,
            compile=False,
            safe_mode=True,
        )

        with open(
            CLASS_NAMES_PATH,
            "r",
            encoding="utf-8"
        ) as file:
            self.class_names = json.load(file)

        if (
            not isinstance(self.class_names, list)
            or not self.class_names
            or not all(
                isinstance(name, str)
                for name in self.class_names
            )
            or len(set(self.class_names))
            != len(self.class_names)
        ):
            raise ValueError("Invalid class_names.json")

        input_shape = self.model.input_shape
        output_shape = self.model.output_shape

        if (
            len(input_shape) != 4
            or input_shape[-1] != 3
            or input_shape[1] is None
            or input_shape[2] is None
        ):
            raise ValueError(
                f"Unsupported model input: {input_shape}"
            )

        if (
            len(output_shape) != 2
            or output_shape[-1] != len(self.class_names)
        ):
            raise ValueError(
                "Model output classes do not match "
                "class_names.json"
            )

        self.image_size = (
            int(input_shape[2]),
            int(input_shape[1]),
        )

        print("PlantCare AI model loaded")
        print("Classes:", len(self.class_names))
        print("Image size:", self.image_size)

    def preprocess(self, image_bytes: bytes):
        if not image_bytes:
            raise InvalidImageError("Image is empty")

        if len(image_bytes) > MAX_FILE_SIZE:
            raise InvalidImageError(
                "Image exceeds 5 MB limit"
            )

        try:
            # Guard against excessive decompressed
            # image dimensions.
            Image.MAX_IMAGE_PIXELS = 20_000_000

            with Image.open(
                io.BytesIO(image_bytes)
            ) as image:
                image.verify()

            with Image.open(
                io.BytesIO(image_bytes)
            ) as image:
                image = ImageOps.exif_transpose(image)
                image = image.convert("RGB")
                image = image.resize(
                    self.image_size,
                    Image.Resampling.BILINEAR
                )

                image_array = np.asarray(
                    image, dtype=np.float32
                )

        except (
            UnidentifiedImageError,
            OSError,
            ValueError,
            Image.DecompressionBombError,
            Image.DecompressionBombWarning,
        ) as error:
            raise InvalidImageError(
                "Invalid or unsupported image"
            ) from error

        # Our CNN already contains Rescaling(1./255)
        # so we keep pixels in the 0-255 range.
        return np.expand_dims(
            image_array, axis=0
        )

    def predict(self, image_bytes: bytes):
        if self.model is None:
            raise RuntimeError("Model is not loaded")

        image_array = self.preprocess(image_bytes)

        with self._lock:
            scores = self.model(
                image_array,
                training=False,
            ).numpy()[0]

        if (
            len(scores) != len(self.class_names)
            or not np.all(np.isfinite(scores))
        ):
            raise RuntimeError(
                "Invalid model prediction output"
            )

        top_indices = np.argsort(
            scores
        )[-TOP_K:][::-1]

        predictions = []

        for index in top_indices:
            raw_name = self.class_names[int(index)]
            score = float(scores[index])

            predictions.append({
                "class_name": raw_name,
                "label": self.format_label(raw_name),
                "score": score,
                "percentage": round(score * 100, 2),
            })

        best = predictions[0]

        return {
            "predicted_class": best["class_name"],
            "predicted_label": best["label"],
            "confidence": best["score"],
            "confidence_percentage": best["percentage"],
            "predictions": predictions,
        }

    @staticmethod
    def format_label(raw_name: str):
        return raw_name.replace(
            "___", " - "
        ).replace("_", " ").strip()


plant_model = PlantDiseaseModel()
