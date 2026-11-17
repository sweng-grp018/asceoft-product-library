import os
from functools import lru_cache

def get_yolo_weights() -> str:
    return os.getenv("YOLO_WEIGHTS", "yolo26n.pt")

@lru_cache(maxsize=1)
def yolo_model():
    from ultralytics import YOLO

    return YOLO(get_yolo_weights())