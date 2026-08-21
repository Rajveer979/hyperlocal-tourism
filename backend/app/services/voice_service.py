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
import re

from .. import config
from ..fixtures import SAMPLE_LISTING

log = logging.getLogger("voice")



STRUCTURING_PROMPT = """You are a listing assistant for a village tourism platform. A host described their experience out loud. Extract a structured listing from it.

Return ONLY JSON (no markdown, no commentary) with exactly these fields:
- "host_name": the host's name as they introduced themselves ("" if not mentioned)
- "village_name": the village, town or place the host lives / the experience happens ("" if not mentioned)
- "title": a short, catchy title in the original spoken language
- "description": 2-3 sentences in the original spoken language
- "description_en": an English translation of the description
- "price": price in INR as an integer (null if not mentioned — never invent one)
- "languages": ISO-639-1 codes the host speaks (e.g. ["hi", "en"])

Use the exact values the host states. Do not invent specific details that were
not spoken. If price was not mentioned, return null for it (the
platform will ask a follow-up question).

Numbers may be spoken in Hindi — common words: teen=3, paanch=5, chah=6,
aath=8, das=10, barah=12, dedh=1.5 (so dedh ghante = 90 minutes), sau=100,
paanch sau=500, hazaar=1000. Convert them to integers.

Spoken language: {language}"""

# Follow-up round: the host answers a spoken question about fields that were
# missing. The draft rides along; the model keeps everything already known and
# extracts only what the new audio adds.
MERGE_PROMPT = """You are a listing assistant for a village tourism platform. A host described
their experience, and this draft was extracted:

{previous}

The host is now answering a follow-up question about: {missing}

Listen to the new audio (or read the new text) and extract values for the
missing fields. Return the COMPLETE listing JSON with every field — keeping
the draft's existing values for anything the new audio does not mention or
change. Use null for any missing field still not mentioned — never guess.

Fields: host_name, village_name, title, description, description_en, price,
languages.

Spoken language: {language}"""

# Spoken follow-up questions, templated per field + host language (the demo
# speaks Hindi/Gujarati; anything else falls back to English).
QUESTIONS = {
    "host_name": {
        "hi": "आपका नाम क्या है?",
        "en": "What is your name?",
    },
    "village_name": {
        "hi": "आप किस गाँव या शहर से हैं?",
        "en": "Which village or city are you from?",
    },
    "title": {
        "hi": "आपके अनुभव का नाम क्या होगा?",
        "en": "What would you like to call your experience?",
    },
    "description": {
        "hi": "अपने अनुभव के बारे में थोड़ा और बताएं।",
        "en": "Tell us a bit more about your experience.",
    },
    "price": {
        "hi": "आप प्रति व्यक्ति कितने रुपये लेते हैं?",
        "en": "How much do you charge per person?",
    },
}

_JOINERS = {"hi": " और ", "en": " and "}


def compute_missing(raw: dict) -> list:
    """Critical fields the host did not mention — the follow-up asks about these."""
    missing = []
    for field in ("host_name", "village_name", "title", "description", "price"):
        value = raw.get(field)
        if value is None or str(value).strip() == "":
            missing.append(field)
    return missing


def build_question(missing: list, language: str) -> str | None:
    """One spoken sentence covering every missing field, in the host's language."""
    if not missing:
        return None
    lang = language if language in _JOINERS else "en"
    joiner = _JOINERS[lang]
    return joiner.join(QUESTIONS[f].get(lang, QUESTIONS[f]["en"]) for f in missing)


# ---------------------------------------------------------------------------
# Normalization — every engine output is coerced to the frozen contract shape
# ---------------------------------------------------------------------------
def normalize_listing(raw, language: str) -> dict:
    raw = raw if isinstance(raw, dict) else {}
    langs = raw.get("languages") if isinstance(raw.get("languages"), list) else []

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
        "price": _int(raw.get("price"), 0),
        "languages": [language, *[l for l in langs if l != language]],
        "original_language": language,
    }


def fixture_result(language: str) -> dict:
    """Layer 3 — hardcoded sample listing (mirrors the frontend mock)."""
    return normalize_listing(SAMPLE_LISTING, language)


def _extract_json(text: str) -> dict:
    """Model output may arrive wrapped in fences or carry trailing commas —
    strip and parse. Gemini occasionally emits `"max_per_slot": null,` before
    the closing brace, which vanilla json.loads rejects; dropping trailing
    commas first makes the extraction robust across engines."""
    text = text.strip()
    if text.startswith("```"):
        text = text.strip("`")
        if text.lower().startswith("json"):
            text = text[4:]
    start, end = text.find("{"), text.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("No JSON object found in model output")
    cleaned = re.sub(r",\s*([}\])])", r"\1", text[start : end + 1])
    return json.loads(cleaned)


# ---------------------------------------------------------------------------
# Layer 1 — Gemini: one call, audio OR transcript → JSON
# ---------------------------------------------------------------------------
def _build_prompt(previous, missing, language):
    """Pick the right prompt and fill it. .replace(), never .format() — the
    prompts contain literal JSON braces that .format() would choke on."""
    if previous is not None:
        return (
            MERGE_PROMPT.replace("{previous}", json.dumps(previous, ensure_ascii=False))
            .replace("{missing}", ", ".join(missing))
            .replace("{language}", language)
        )
    return STRUCTURING_PROMPT.replace("{language}", language)


def gemini_one_call(audio_bytes, language: str, transcript: str | None, previous: dict | None = None) -> dict:
    from google import genai
    from google.genai import types

    client = genai.Client(
        api_key=config.GEMINI_API_KEY,
        http_options={"timeout": 25_000},  # ms — fail fast so fallback can run
    )

    # Only the spoken words go in `contents`; the extraction rules ride as a
    # separate system_instruction so the model treats them as orders, not data.
    if transcript:
        contents = transcript
    elif audio_bytes:
        contents = types.Part.from_bytes(data=audio_bytes, mime_type="audio/wav")
    else:
        raise ValueError("No audio or transcript to process")

    missing = compute_missing(previous) if previous else []
    prompt = _build_prompt(previous, missing, language)

    # Gemini occasionally emits JSON with a trailing comma or similar quirk.
    # Retry ONCE on parse failures only — a retry is fast (the response already
    # arrived) and usually returns clean JSON. Real API errors (timeout/500/429)
    # propagate straight to the fallback chain so the demo can't hang.
    last_parse_error = None
    for attempt in range(2):
        try:
            response = client.models.generate_content(
                model=config.GEMINI_MODEL,
                contents=contents,
                config=types.GenerateContentConfig(
                    temperature=0.2,
                    response_mime_type="application/json",
                    system_instruction=prompt,
                ),
            )
            return _extract_json(response.text)
        except (json.JSONDecodeError, ValueError) as e:
            last_parse_error = e
            log.warning("Gemini output unparseable (attempt %d): %s", attempt + 1, e)
    raise last_parse_error


# ---------------------------------------------------------------------------
# Layer 2 — Groq: Whisper transcribe, then Llama structure
# ---------------------------------------------------------------------------
def groq_two_call(audio_bytes, language: str, transcript: str | None, previous: dict | None = None) -> dict:
    from groq import Groq

    client = Groq(api_key=config.GROQ_API_KEY, timeout=15.0)

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

    # Step 2 — text → structured JSON (merge mode when a draft rides along)
    missing = compute_missing(previous) if previous else []
    completion = client.chat.completions.create(
        model=config.GROQ_LLM_MODEL,
        messages=[
            {"role": "system", "content": _build_prompt(previous, missing, language)},
            {"role": "user", "content": text},
        ],
        temperature=0.2,
        response_format={"type": "json_object"},
    )
    return _extract_json(completion.choices[0].message.content)


# ---------------------------------------------------------------------------
# Orchestrator — the automatic fallback chain
# ---------------------------------------------------------------------------
def structure_listing(
    audio_bytes,
    language: str,
    transcript: str | None = None,
    previous: dict | None = None,
) -> dict:
    """audio (or transcript) + language → {listing, missing, question}.

    When `previous` (a draft listing) rides along, the engine merges the new
    audio into it instead of extracting from scratch. `missing` lists the
    critical numbers the host has not mentioned yet; `question` is the spoken
    follow-up in the host's language (null when nothing is missing).
    """
    engine = config.VOICE_ENGINE

    def _finish(raw: dict) -> dict:
        missing = compute_missing(raw)
        return {
            "listing": normalize_listing(raw, language),
            "missing": missing,
            "question": build_question(missing, language),
        }

    if engine == "fixture":
        # The fixture is always complete — the follow-up never triggers in
        # offline/rehearsal mode, keeping the demo simple.
        return {"listing": fixture_result(language), "missing": [], "question": None}

    if engine in ("auto", "gemini"):
        if config.GEMINI_API_KEY:
            try:
                return _finish(gemini_one_call(audio_bytes, language, transcript, previous))
            except Exception as e:  # noqa: BLE001 — any failure → next layer
                log.warning("Gemini failed (%s), moving down the chain", e)
        elif engine == "gemini":
            log.warning("VOICE_ENGINE=gemini but no GEMINI_API_KEY — using fixture")
            return {"listing": fixture_result(language), "missing": [], "question": None}

    if engine in ("auto", "groq"):
        if config.GROQ_API_KEY:
            try:
                return _finish(groq_two_call(audio_bytes, language, transcript, previous))
            except Exception as e:  # noqa: BLE001
                log.warning("Groq failed (%s), using fixture", e)
        elif engine == "groq":
            log.warning("VOICE_ENGINE=groq but no GROQ_API_KEY — using fixture")
            return {"listing": fixture_result(language), "missing": [], "question": None}

    return {"listing": fixture_result(language), "missing": [], "question": None}
