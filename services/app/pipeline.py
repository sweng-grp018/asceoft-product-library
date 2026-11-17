from PIL import Image

from app.config import YOLO_CONFIDENCE, YOLO_MAX_DETECTIONS, YOLO_WEIGHTS
from app.detection.detector import yolo_model
from app.detection.cropping import bounded_box, crop_image
from app.embeddings.encoder import embed_image


def run_detection(image: Image.Image) -> dict:
    width, height = image.size

    result = yolo_model().predict(
        image,
        conf=YOLO_CONFIDENCE,
        max_det=YOLO_MAX_DETECTIONS,
        verbose=False
    )[0]

    detections = []

    for box in result.boxes:
        bounds = bounded_box(
            box.xyxy[0].tolist(),
            width,
            height
        )

        if bounds[2] <= bounds[0] or bounds[3] <= bounds[1]:
            continue

        crop = crop_image(image, bounds)

        detections.append({
            "boundingBox": list(bounds),
            "detectorScore": float(box.conf[0]),
            "embedding": embed_image(crop),
        })

    return {
        "width": width,
        "height": height,
        "detectorModel": YOLO_WEIGHTS,
        "detections": detections,
    }