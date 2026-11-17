"""Standalone, synchronous POC inference API.

Detection uses a general-purpose YOLO26 nano model until a product dataset is labeled
and fine-tuned. Visual SKU matching comes from OpenCLIP embeddings, not YOLO classes.
Models download their weights on first inference if not already cached.
"""

import base64
import binascii
import io
import os

from fastapi import FastAPI, HTTPException
from PIL import Image, UnidentifiedImageError
from pydantic import BaseModel, Field

from app.pipeline import run_detection

MAX_BYTES = 10 * 1024 * 1024
Image.MAX_IMAGE_PIXELS = 20_000_000
app = FastAPI(title="Lensistry AI", version="0.1.0")


class ImagePayload(BaseModel):
    imageBase64: str = Field(min_length=1, max_length=14_000_000)


def decode_image(value: str) -> Image.Image:
    try:
        data = base64.b64decode(value, validate=True)
        if not 0 < len(data) <= MAX_BYTES:
            raise ValueError("Invalid image size")
        image = Image.open(io.BytesIO(data))
        if image.format not in {"JPEG", "PNG", "WEBP"}:
            raise ValueError("Unsupported image format")
        image.load()
        return image.convert("RGB")
    except (binascii.Error, ValueError, UnidentifiedImageError, OSError) as exc:
        raise HTTPException(status_code=422, detail="Invalid image") from exc


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/embed")
def embed(body: ImagePayload) -> dict:
    image = decode_image(body.imageBase64)
    return {"embedding": embed_image(image), "model": "openclip-ViT-B-32-openai"}


@app.post("/detect")
def detect(body: ImagePayload) -> dict:
    image = decode_image(body.imageBase64)
    return run_detection(image)
