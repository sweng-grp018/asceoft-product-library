import base64
import io

from fastapi import HTTPException
from PIL import Image

from app.main import bounded_box, decode_image


def test_bounds_clamp_to_image():
    assert bounded_box([-4, -3, 200, 400], 100, 50) == (0, 0, 100, 50)


def test_decode_rejects_invalid_image():
    try:
        decode_image("not base64")
        assert False
    except HTTPException as exc:
        assert exc.status_code == 422


def test_decode_valid_png():
    buff = io.BytesIO()
    Image.new("RGB", (10, 10)).save(buff, format="PNG")
    image = decode_image(base64.b64encode(buff.getvalue()).decode())
    assert image.size == (10, 10)
