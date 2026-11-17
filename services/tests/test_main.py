import io

import pytest

from fastapi import HTTPException
from fastapi.testclient import TestClient
from PIL import Image

from app.detection.cropping import bounded_box
from app.main import decode_image
import app.main as main


def test_bounds_clamp_to_image():
    assert bounded_box([-4, -3, 200, 400], 100, 50) == (0, 0, 100, 50)


def test_decode_rejects_invalid_image():
    with pytest.raises(HTTPException) as exc:
        decode_image(b"not an image")

    assert exc.value.status_code == 422


def test_decode_valid_png():
    buff = io.BytesIO()
    Image.new("RGB", (10, 10)).save(buff, format="PNG")

    image = decode_image(buff.getvalue())

    assert image.size == (10, 10)
    assert image.mode == "RGB"


def test_decode_rejects_empty_image():
    with pytest.raises(HTTPException) as exc:
        decode_image(b"")

    assert exc.value.status_code == 422


def test_decode_rejects_corrupted_image():
    with pytest.raises(HTTPException) as exc:
        decode_image(b"this is not a valid image file")

    assert exc.value.status_code == 422


def test_decode_rejects_unsupported_format():
    buff = io.BytesIO()
    Image.new("RGB", (10, 10)).save(buff, format="GIF")

    with pytest.raises(HTTPException) as exc:
        decode_image(buff.getvalue())

    assert exc.value.status_code == 422


def test_decode_rejects_image_exceeding_pixel_limit(monkeypatch):
    # Temporarily lower the limit so we don't need a huge test image.
    monkeypatch.setattr(main, "MAX_IMAGE_PIXELS", 100)

    buff = io.BytesIO()
    Image.new("RGB", (11, 10)).save(buff, format="PNG")

    with pytest.raises(HTTPException) as exc:
        decode_image(buff.getvalue())

    assert exc.value.status_code == 422


client = TestClient(main.app)


def create_test_image():
    buff = io.BytesIO()
    Image.new("RGB", (10, 10)).save(buff, format="PNG")
    return buff.getvalue()


def test_health_endpoint():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_embed_endpoint(monkeypatch):
    monkeypatch.setattr(main, "embed_image", lambda image: [0.1] * 512)

    response = client.post(
        "/embed",
        files={"file": ("test.png", create_test_image(), "image/png")}
    )

    assert response.status_code == 200
    assert len(response.json()["embedding"]) == 512
    assert response.json()["model"] == "openclip-ViT-B-32-openai"


def test_detect_endpoint(monkeypatch):
    mock_result = {
        "width": 10,
        "height": 10,
        "detectorModel": "yolo26n.pt",
        "detections": []
    }

    monkeypatch.setattr(main, "run_detection", lambda image: mock_result)

    response = client.post(
        "/detect",
        files={"file": ("test.png", create_test_image(), "image/png")}
    )

    assert response.status_code == 200
    assert response.json() == mock_result


def test_upload_rejects_oversized_file(monkeypatch):
    monkeypatch.setattr(main, "MAX_IMAGE_BYTES", 10)

    response = client.post(
        "/embed",
        files={"file": ("test.png", b"x" * 11, "image/png")}
    )

    assert response.status_code == 413


def test_embed_handles_inference_failure(monkeypatch):
    def fail_embedding(image):
        raise RuntimeError("Internal model error")

    monkeypatch.setattr(main, "embed_image", fail_embedding)

    response = client.post(
        "/embed",
        files={"file": ("test.png", create_test_image(), "image/png")}
    )

    assert response.status_code == 500
    assert response.json()["detail"] == "Image embedding failed"


def test_detect_handles_inference_failure(monkeypatch):
    def fail_detection(image):
        raise RuntimeError("Internal model error")

    monkeypatch.setattr(main, "run_detection", fail_detection)

    response = client.post(
        "/detect",
        files={"file": ("test.png", create_test_image(), "image/png")}
    )

    assert response.status_code == 500
    assert response.json()["detail"] == "Image detection failed"