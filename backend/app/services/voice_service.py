"""F1 — the one-call voice pipeline, server side.

audio (WAV 16 kHz mono) + language  →  listing JSON

Fallback chain (automatic, invisible to the frontend):
  1. Gemini  — ONE call: audio (or transcript) → structured JSON
  2. Groq    — TWO calls: Whisper transcribe → Llama structure
  3. fixture — hardcoded sample listing (zero network, demo never breaks)

Every engine returns the IDENTICAL shape frozen in ../API-CONTRACT.md.
Controlled by VOICE_ENGINE in backend/.env: auto | gemini | groq | fixture.
"""

import json
import logging

from .. import config
from ..fixtures import SAMPLE_LISTING

log = logging.getLogger("voice")

CATEGORIES = ["food", "craft", "heritage", "nature", "other"]

STRUCTURING_PROMPT = """You are a listing assistant for a village tourism platform. A host described their experience out loud. Extract a structured listing from it.

Return ONLY JSON (no markdown, no commentary) with exactly these fields:
- "host_name": the host's name as they introduced themselves ("" if not mentioned)
- "village_name": the village, town or place the host lives / the experience happens ("" if not mentioned)
- "title": a short, catchy title in the original spoken language
- "description": 2-3 sentences in the original spoken language
- "description_en": an English translation of the description
- "category": one of "food", "craft", "heritage", "nature", "other"
- "price": price in INR as an integer (0 if not mentioned — never invent one)
- "duration_minutes": duration as an integer (default 60 if unclear)
- "capacity": max group size as an integer (default 4 if unclear)
- "availability": {"days": [weekday names], "slots": ["HH:MM"], "max_per_slot": integer}
- "languages": ISO-639-1 codes the host speaks (e.g. ["hi", "gu"])

Use the exact values the host states — every price, duration, group size and day
mentioned MUST appear in the output. Do not invent specific details that were
not spoken. If something was not mentioned, use the documented default.

Spoken language: {language}"""


# ---------------------------------------------------------------------------
# Normalization — every engine output is coerced to the frozen contract shape
# ---------------------------------------------------------------------------
def normalize_listing(raw, language: str) -> dict:
    raw = raw if isinstance(raw, dict) else {}
    availability = raw.get("availability") if isinstance(raw.get("availability"), dict) else {}
    langs = raw.get("languages") if isinstance(raw.get("languages"), list) else []

    category = raw.get("category")
    if category not in CATEGORIES:
        category = "other"

    def _int(value, default):
        try:
            return int(value)
        except (TypeError, ValueError):
            return default

    def _list(value):
        return value if isinstance(value, list) else []

    return {
        "host_name": str(raw.get("host_name") or "").strip(),
        "village_name": str(raw.get("village_name") or "").strip(),
        "title": str(raw.get("title") or "").strip(),
        "description": str(raw.get("description") or "").strip(),
        "description_en": str(raw.get("description_en") or "").strip(),
        "category": category,
        "price": _int(raw.get("price"), 0),
        "duration_minutes": _int(raw.get("duration_minutes"), 60),
        "capacity": _int(raw.get("capacity"), 4),
        "availability": {
            "days": _list(availability.get("days")),
            "slots": _list(availability.get("slots")),
            "max_per_slot": _int(availability.get("max_per_slot"), 8),
        },
        "languages": [language, *[l for l in langs if l != language]],
        "original_language": language,
    }


def fixture_result(language: str) -> dict:
    """Layer 3 — hardcoded sample listing (mirrors the frontend mock)."""
    return normalize_listing(SAMPLE_LISTING, language)


def _extract_json(text: str) -> dict:
    """Model output may arrive wrapped in ```json fences — strip and parse."""
    text = text.strip()
    if text.startswith("```"):
        text = text.strip("`")
        if text.lower().startswith("json"):
            text = text[4:]
    start, end = text.find("{"), text.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("No JSON object found in model output")
    return json.loads(text[start : end + 1])


# ---------------------------------------------------------------------------
# Layer 1 — Gemini: one call, audio OR transcript → JSON
# ---------------------------------------------------------------------------
def gemini_one_call(audio_bytes, language: str, transcript: str | None) -> dict:
    from google import genai
    from google.genai import types

    client = genai.Client(
        api_key=config.GEMINI_API_KEY,
        http_options={"timeout": 45_000},  # ms — fail fast so fallback can run
    )

    # Only the spoken words go in `contents`; the extraction rules ride as a
    # separate system_instruction so the model treats them as orders, not data.
    if transcript:
        contents = transcript
    elif audio_bytes:
        contents = types.Part.from_bytes(data=audio_bytes, mime_type="audio/wav")
    else:
        raise ValueError("No audio or transcript to process")

    response = client.models.generate_content(
        model=config.GEMINI_MODEL,
        contents=contents,
        config=types.GenerateContentConfig(
            temperature=0.2,
            response_mime_type="application/json",
            # .replace(), not .format() — the prompt contains literal JSON braces
            system_instruction=STRUCTURING_PROMPT.replace("{language}", language),
        ),
    )
    return _extract_json(response.text)


# ---------------------------------------------------------------------------
# Layer 2 — Groq: Whisper transcribe, then Llama structure
# ---------------------------------------------------------------------------
def groq_two_call(audio_bytes, language: str, transcript: str | None) -> dict:
    from groq import Groq

    client = Groq(api_key=config.GROQ_API_KEY)

    # Step 1 — speech → text (skipped when a transcript was provided)
    if transcript:
        text = transcript
    elif audio_bytes:
        transcription = client.audio.transcriptions.create(
            file=("recording.wav", audio_bytes, "audio/wav"),
            model=config.GROQ_WHISPER_MODEL,
            language=language,
            response_format="json",
        )
        text = transcription.text
    else:
        raise ValueError("No audio or transcript to process")

    # Step 2 — text → structured JSON
    completion = client.chat.completions.create(
        model=config.GROQ_LLM_MODEL,
        messages=[
            # .replace(), not .format() — the prompt contains literal JSON braces
            {"role": "system", "content": STRUCTURING_PROMPT.replace("{language}", language)},
            {"role": "user", "content": text},
        ],
        temperature=0.2,
        response_format={"type": "json_object"},
    )
    return _extract_json(completion.choices[0].message.content)


# ---------------------------------------------------------------------------
# Orchestrator — the automatic fallback chain
# ---------------------------------------------------------------------------
def structure_listing(audio_bytes, language: str, transcript: str | None = None) -> dict:
    engine = config.VOICE_ENGINE

    if engine == "fixture":
        return fixture_result(language)

    if engine in ("auto", "gemini"):
        if config.GEMINI_API_KEY:
            try:
                return normalize_listing(gemini_one_call(audio_bytes, language, transcript), language)
            except Exception as e:  # noqa: BLE001 — any failure → next layer
                log.warning("Gemini failed (%s), moving down the chain", e)
        elif engine == "gemini":
            log.warning("VOICE_ENGINE=gemini but no GEMINI_API_KEY — using fixture")
            return fixture_result(language)

    if engine in ("auto", "groq"):
        if config.GROQ_API_KEY:
            try:
                return normalize_listing(groq_two_call(audio_bytes, language, transcript), language)
            except Exception as e:  # noqa: BLE001
                log.warning("Groq failed (%s), using fixture", e)
        elif engine == "groq":
            log.warning("VOICE_ENGINE=groq but no GROQ_API_KEY — using fixture")
            return fixture_result(language)

    return fixture_result(language)
