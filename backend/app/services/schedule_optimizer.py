import json
import anthropic
from app.config import get_settings

settings = get_settings()


async def generate_dosing_schedule(
    stack_names: list[str],
    interactions: list[dict],
    language: str = "en",
) -> str | None:
    """Generate an optimized timing schedule to minimize interaction risks."""
    if not interactions:
        return None

    from app.services.claude_service import LANG_MAP, get_claude_client
    lang = LANG_MAP.get(language, "English")
    claude = get_claude_client()

    prompt = f"""You are a clinical pharmacist. This patient takes: {json.dumps(stack_names)}
Known interactions: {json.dumps(interactions)}

Create a simple daily timing schedule to minimize interaction risks.
Example: "Take medicine A with breakfast, medicine B 2 hours before medicine A, herb C at night."

Keep it practical and simple. Respond in {lang}.
Return only the schedule as plain text, no JSON."""

    response = claude.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=400,
        messages=[{"role": "user", "content": prompt}]
    )
    return response.content[0].text.strip()
