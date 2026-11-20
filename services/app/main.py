"""Standalone, synchronous POC inference API.

Detection uses a general-purpose YOLO11 nano model until a product dataset is labeled
and fine-tuned. Visual SKU matching comes from OpenCLIP embeddings, not YOLO classes.
Models download their weights on first inference if not already cached.
"""

import base64
import binascii
import io
import os
from functools import lru_cache

from fastapi import FastAPI, HTTPException
from PIL import Image, UnidentifiedImageError
from pydantic import BaseModel, Field

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


@lru_cache(maxsize=1)
def clip_model():
    import open_clip

    model, _, transform = open_clip.create_model_and_transforms(
        "ViT-B-32", pretrained="openai", device="cpu"
    )
    model.eval()
    return model, transform


@lru_cache(maxsize=1)
def yolo_model():
    from ultralytics import YOLO

    return YOLO(os.getenv("YOLO_WEIGHTS", "yolo11n.pt"))


def embed_image(image: Image.Image) -> list[float]:
    import torch

    model, transform = clip_model()
    with torch.inference_mode():
        vector = model.encode_image(transform(image).unsqueeze(0))
        vector = vector / vector.norm(dim=-1, keepdim=True).clamp_min(1e-12)
    return vector[0].cpu().tolist()


def bounded_box(xyxy: list[float], width: int, height: int) -> tuple[int, int, int, int]:
    x1, y1, x2, y2 = xyxy
    return (
        max(0, min(int(x1), width - 1)),
        max(0, min(int(y1), height - 1)),
        max(1, min(int(x2), width)),
        max(1, min(int(y2), height)),
    )


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
    width, height = image.size
    result = yolo_model().predict(image, conf=0.25, max_det=100, verbose=False)[0]
    detections = []
    for box in result.boxes:
        bounds = bounded_box(box.xyxy[0].tolist(), width, height)
        if bounds[2] <= bounds[0] or bounds[3] <= bounds[1]:
            continue
        crop = image.crop(bounds)
        detections.append({
            "boundingBox": list(bounds),
            "detectorScore": float(box.conf[0]),
            "embedding": embed_image(crop),
        })
    return {
        "width": width,
        "height": height,
        "detectorModel": os.getenv("YOLO_WEIGHTS", "yolo11n.pt"),
        "detections": detections,
    }
