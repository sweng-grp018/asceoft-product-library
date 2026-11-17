from PIL import Image

from app.detection.detector import yolo_model, get_yolo_weights
from app.detection.cropping import bounded_box, crop_image
from app.embeddings.encoder import embed_image


def run_detection(image: Image.Image) -> dict:
    width, height = image.size

    result = yolo_model().predict(
        image,
        conf=0.25,
        max_det=100,
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
        "detectorModel": get_yolo_weights(),
        "detections": detections,
    }