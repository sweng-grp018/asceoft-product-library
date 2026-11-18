"""Standalone POC inference API.

Detection uses a general-purpose YOLO26 nano model until a product dataset is labeled
and fine-tuned. Visual SKU matching comes from OpenCLIP embeddings, not YOLO classes.
Models download their weights on first inference if not already cached.
"""

import logging # Added to log errors in endpoints
import io

from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from PIL import Image, UnidentifiedImageError
from starlette.concurrency import run_in_threadpool

from app.config import (MAX_IMAGE_BYTES, MAX_IMAGE_PIXELS, CLIP_MODEL_NAME, CLIP_PRETRAINED)
from app.pipeline import run_detection
from app.embeddings.encoder import embed_image

logger = logging.getLogger(__name__)

Image.MAX_IMAGE_PIXELS = MAX_IMAGE_PIXELS
app = FastAPI(title="Lensistry AI", version="0.1.0")


class EmbedResponse(BaseModel):
    embedding: list[float]
    model: str


# Describes one detected object
class DetectionResponse(BaseModel):
    boundingBox: list[int]
    detectorScore: float
    embedding: list[float]


# Describes the image-processing result
class DetectResponse(BaseModel):
    width: int
    height: int
    detectorModel: str
    detections: list[DetectionResponse]


def decode_image(data: bytes) -> Image.Image:
    try:
        if not 0 < len(data) <= MAX_IMAGE_BYTES:
            raise ValueError("Invalid image size")
        
        image = Image.open(io.BytesIO(data))
        if image.format not in {"JPEG", "PNG", "WEBP"}:
            raise ValueError("Unsupported image format")
        width, height = image.size
        if width * height > MAX_IMAGE_PIXELS:
            raise ValueError("Image exceeds pixel limit")
        
        image.load()
        return image.convert("RGB")
    except (ValueError, UnidentifiedImageError, Image.DecompressionBombError, OSError) as exc:
        raise HTTPException(status_code=422, detail="Invalid image") from exc


async def read_image(file: UploadFile) -> Image.Image:
    try:
        image_bytes = await file.read(MAX_IMAGE_BYTES + 1)

        if len(image_bytes) > MAX_IMAGE_BYTES:
            raise HTTPException(status_code=413, detail="Image too large")

        return decode_image(image_bytes)

    finally:
        await file.close()


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/embed", response_model=EmbedResponse)
async def embed(file: UploadFile = File(...)) -> EmbedResponse:
    image = await read_image(file)

    try:
        embedding = await run_in_threadpool(embed_image, image)

        return {
                "embedding": embedding, 
                "model": f"openclip-{CLIP_MODEL_NAME}-{CLIP_PRETRAINED}"
        }
    except Exception as exc:
        logger.exception("Image embedding failed")
        raise HTTPException(status_code=500, detail="Image embedding failed") from exc


@app.post("/detect", response_model=DetectResponse)
async def detect(file: UploadFile = File(...)) -> DetectResponse:
    image = await read_image(file)

    try: 
        return run_in_threadpool(run_detection, image)
    except Exception as exc:
        logger.exception("Image detection failed")
        raise HTTPException(status_code=500, detail="Image detection failed") from exc
