import json
import anthropic
from app.config import get_settings

settings = get_settings()
_claude = None

LANG_MAP = {
    "en": "English",
    "hi": "Hindi",
    "kn": "Kannada",
    "te": "Telugu",
}


def get_claude_client() -> anthropic.Anthropic:
    global _claude
    if _claude is None:
        _claude = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    return _claude


def _parse_json_response(text: str) -> dict:
    text = text.strip()
    if text.startswith("```"):
        parts = text.split("```")
        text = parts[1] if len(parts) > 1 else text
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text.strip())


async def generate_toxicology_report(
    ingredients: list[str],
    pubchem_data: list[dict],
    language: str = "en",
) -> dict:
    lang = LANG_MAP.get(language, "English")
    claude = get_claude_client()

    # Summarize pubchem data to keep prompt concise
    safety_summary = []
    for item in pubchem_data:
        if item.get("found"):
            safety_summary.append({
                "name": item["name"],
                "cid": item.get("cid"),
                "has_safety_data": bool(item.get("safety_raw")),
                "has_toxicology_data": bool(item.get("toxicology_raw")),
            })
        else:
            safety_summary.append({"name": item["name"], "found_in_pubchem": False})

    prompt = f"""You are a toxicologist and pharmacist specializing in consumer product safety for Indian consumers.

Analyze these product ingredients for safety. Use your knowledge of toxicology, regulatory status (FDA, EFSA, FSSAI India), and the PubChem availability data provided.

Ingredients to analyze: {json.dumps(ingredients)}
PubChem database availability: {json.dumps(safety_summary)}

For each ingredient:
1. Is it safe at typical consumer exposure levels?
2. Known hazards (carcinogen, endocrine disruptor, allergen, neurotoxin, reproductive toxin)?
3. Regulatory status: FDA approved? EU restricted/banned? India FSSAI status?
4. Plain simple explanation of any concern

Rules:
- Be factual, not alarmist. If safe, say clearly it is safe.
- Use simple words, no medical jargon
- Respond entirely in {lang}
- overall_score must be one of: safe, caution, warning, danger

Return ONLY valid JSON, no markdown:
{{
  "overall_score": "safe|caution|warning|danger",
  "summary": "one paragraph summary in {lang}",
  "ingredients": [
    {{
      "name": "ingredient name",
      "status": "safe|caution|warning|danger",
      "concern": null or "plain explanation in {lang}",
      "regulatory": "regulatory status note in {lang}"
    }}
  ]
}}"""

    response = claude.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2500,
        messages=[{"role": "user", "content": prompt}]
    )
    return _parse_json_response(response.content[0].text)


async def generate_interaction_report(
    interactions: list[dict],
    stack_names: list[str],
    language: str = "en",
) -> dict:
    lang = LANG_MAP.get(language, "English")
    claude = get_claude_client()

    prompt = f"""You are a clinical pharmacist in India. A patient is taking or using these items together:
{json.dumps(stack_names)}

Known interactions found in database:
{json.dumps(interactions)}

Write a clear safety report in {lang}:
1. List each dangerous combination clearly
2. Explain what could happen in very simple words (assume patient has no medical knowledge)
3. Say exactly what they should do (tell doctor, space timing, avoid combining, monitor symptoms)
4. Give an overall assessment

If no interactions found, confirm it appears safe but recommend consulting a doctor.

Return ONLY valid JSON, no markdown:
{{
  "risk_level": "safe|moderate_risk|high_risk",
  "summary": "overall summary in {lang}",
  "alerts": [
    {{
      "severity": "major|moderate|minor",
      "items_involved": ["item1", "item2"],
      "what_happens": "plain explanation in {lang}",
      "what_to_do": "action in {lang}"
    }}
  ],
  "schedule": "optional timing/schedule advice in {lang} or null"
}}"""

    response = claude.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2500,
        messages=[{"role": "user", "content": prompt}]
    )
    return _parse_json_response(response.content[0].text)


async def identify_pill_from_image(image_b64: str, language: str = "en") -> dict:
    lang = LANG_MAP.get(language, "English")
    claude = get_claude_client()

    response = claude.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1000,
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/jpeg",
                        "data": image_b64,
                    }
                },
                {
                    "type": "text",
                    "text": f"""This is a photo of a tablet or capsule. Carefully examine and extract:
1. Any imprint or marking text on the pill
2. Color(s) of the pill
3. Shape (round, oval, capsule, oblong, diamond, etc.)
4. Any score lines visible

Based on these physical characteristics, suggest what this medication might be, focusing on commonly available Indian medications.

IMPORTANT: Note that pill identification from photos has limitations. Always advise consulting a pharmacist.

Respond fully in {lang}.
Return ONLY valid JSON, no markdown:
{{
  "imprint": "text visible on pill or null",
  "color": "color description",
  "shape": "shape description",
  "possible_medications": ["medication 1", "medication 2"],
  "confidence": "low|medium|high",
  "note": "explanation and safety disclaimer in {lang}"
}}"""
                }
            ]
        }]
    )
    return _parse_json_response(response.content[0].text)


async def explain_ingredient(ingredient_name: str, language: str = "en") -> dict:
    lang = LANG_MAP.get(language, "English")
    claude = get_claude_client()

    prompt = f"""Explain this ingredient/substance to a regular person in India: "{ingredient_name}"

Cover:
1. What it is and what it's used for
2. Is it safe?
3. Any concerns or side effects
4. Common products it's found in

Keep it simple, friendly, and factual. Respond in {lang}.

Return ONLY valid JSON:
{{
  "name": "{ingredient_name}",
  "what_it_is": "simple explanation in {lang}",
  "safety_verdict": "safe|caution|warning|danger",
  "safety_explanation": "plain text in {lang}",
  "found_in": ["product type 1", "product type 2"],
  "tip": "practical tip in {lang}"
}}"""

    response = claude.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=800,
        messages=[{"role": "user", "content": prompt}]
    )
    return _parse_json_response(response.content[0].text)
