import base64
from app.services.claude_service import identify_pill_from_image


async def identify_pill(image_bytes: bytes, language: str = "en") -> dict:
    image_b64 = base64.standard_b64encode(image_bytes).decode()
    return await identify_pill_from_image(image_b64, language)
