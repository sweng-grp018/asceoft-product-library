from PIL import Image

def bounded_box(xyxy: list[float], width: int, height: int) -> tuple[int, int, int, int]:
    x1, y1, x2, y2 = xyxy
    return (
        max(0, min(int(x1), width - 1)),
        max(0, min(int(y1), height - 1)),
        max(1, min(int(x2), width)),
        max(1, min(int(y2), height)),
    )

def crop_image(
    image: Image.Image,
    bounds: tuple[int, int, int, int]
) -> Image.Image:
    return image.crop(bounds)