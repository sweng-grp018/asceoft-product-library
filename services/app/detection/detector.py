from functools import lru_cache

from app.config import YOLO_WEIGHTS

@lru_cache(maxsize=1)
def yolo_model():
    from ultralytics import YOLO

    return YOLO(YOLO_WEIGHTS)