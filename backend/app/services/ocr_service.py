import json
import anthropic
from app.config import get_settings

settings = get_settings()
_claude = None


def get_claude_client():
    global _claude
    if _claude is None:
        _claude = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    return _claude


async def extract_ingredients_from_image(image_bytes: bytes) -> dict:
    try:
        from google.cloud import vision
        client_vision = vision.ImageAnnotatorClient()
        image = vision.Image(content=image_bytes)
        context = vision.ImageContext(language_hints=["hi", "te", "kn", "en"])
        response = client_vision.text_detection(image=image, image_context=context)
        raw_text = response.text_annotations[0].description if response.text_annotations else ""
    except Exception:
        # Fallback: pass image directly to Claude with vision
        import base64
        image_b64 = base64.standard_b64encode(image_bytes).decode()
        claude = get_claude_client()
        ocr_result = claude.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=500,
            messages=[{
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {"type": "base64", "media_type": "image/jpeg", "data": image_b64}
                    },
                    {"type": "text", "text": "Extract all text visible on this product label. Return only the raw text, nothing else."}
                ]
            }]
        )
        raw_text = ocr_result.content[0].text

    claude = get_claude_client()
    extraction = claude.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1000,
        messages=[{
            "role": "user",
            "content": f"""Extract the ingredients/composition list from this product label text.
Return ONLY a JSON object. Clean and normalize ingredient names to English.
Raw label text:
{raw_text}

Return format: {{"ingredients": ["ingredient1", "ingredient2"], "product_name": "...", "brand": "..."}}
If no ingredients found, return {{"ingredients": [], "product_name": null, "brand": null}}"""
        }]
    )

    try:
        text = extraction.content[0].text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text.strip())
    except json.JSONDecodeError:
        return {"ingredients": [], "product_name": None, "brand": None}
