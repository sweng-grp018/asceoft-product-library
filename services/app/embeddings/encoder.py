from functools import lru_cache

from PIL import Image

@lru_cache(maxsize=1)
def clip_model():
    import open_clip

    model, _, transform = open_clip.create_model_and_transforms(
        "ViT-B-32", pretrained="openai", device="cpu"
    )
    model.eval()
    return model, transform

def embed_image(image: Image.Image) -> list[float]:
    import torch

    model, transform = clip_model()
    with torch.inference_mode():
        vector = model.encode_image(transform(image).unsqueeze(0))
        vector = vector / vector.norm(dim=-1, keepdim=True).clamp_min(1e-12)
    return vector[0].cpu().tolist()