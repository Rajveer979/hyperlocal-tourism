"""F12 — AI Itinerary Builder.

Given a booked experience (lat/lng + slot time) and nearby POIs,
call an LLM to produce a realistic half-day itinerary.

Fallback chain (same as voice):
  1. Gemini — one text call → JSON timeline
  2. Groq   — one text call → JSON timeline
  3. fixture — hardcoded 3-stop plan (demo never breaks)
"""

import json
import logging
import math
import re

from .. import config

log = logging.getLogger("itinerary")


# ---------------------------------------------------------------------------
# Prompt
# ---------------------------------------------------------------------------

ITINERARY_PROMPT = """You are a travel planner for a village tourism platform in India.

A traveller has booked this experience:
- Title: {title}
- Village: {village}
- Slot time: {slot_time}
- Description: {description}

Here are nearby points of interest (within {radius_km} km):
{poi_list}

Create a realistic half-day itinerary that:
1. Starts 1-2 hours before the booked slot
2. Includes 2-4 stops total (heritage sites, nature, or cultural experiences)
3. Ends 1-2 hours after the booked slot
4. Includes realistic travel times between stops (10-30 min for nearby, 30-60 min for farther)
5. The booked experience is the centerpiece, placed at the correct slot time
6. Mixes heritage/nature POIs with the booked experience

Return ONLY JSON (no markdown, no commentary) as an array of objects:
[
  {{
    "time": "HH:MM",
    "place": "Name of the place",
    "lat": 0.0,
    "lng": 0.0,
    "note": "Brief description or travel instruction",
    "type": "poi" | "experience" | "travel"
  }}
]

Rules:
- "type" must be "experience" for the booked experience, "poi" for heritage/nature stops, "travel" for pure transit
- Times must be realistic (no overlapping, reasonable gaps)
- lat/lng must match the provided POI coordinates exactly
- Keep notes short (one sentence max)
- Sort by time ascending"""


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _haversine_km(lat1, lng1, lat2, lng2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlng / 2) ** 2
    )
    return R * 2 * math.asin(math.sqrt(a))


def find_nearby_pois(lat, lng, radius_km, pois):
    """Return POIs within radius_km, sorted by distance."""
    results = []
    for poi in pois:
        dist = _haversine_km(lat, lng, poi["lat"], poi["lng"])
        if dist <= radius_km:
            results.append({**poi, "distance_km": round(dist, 1)})
    results.sort(key=lambda p: p["distance_km"])
    return results


def _format_poi_list(pois):
    """Format POIs for the LLM prompt."""
    lines = []
    for i, poi in enumerate(pois, 1):
        lines.append(
            f"{i}. {poi['name']} ({poi.get('category', 'place')}) — "
            f"{poi['distance_km']} km away, lat: {poi['lat']}, lng: {poi['lng']}"
        )
        if poi.get("description"):
            lines.append(f"   {poi['description']}")
    return "\n".join(lines)


def _extract_json(text):
    """Parse JSON from LLM output (handles markdown fences, trailing commas)."""
    text = text.strip()
    if text.startswith("```"):
        text = text.strip("`")
        if text.lower().startswith("json"):
            text = text[4:]
    start, end = text.find("["), text.rfind("]")
    if start == -1 or end == -1:
        # Try object instead of array
        start, end = text.find("{"), text.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("No JSON found in model output")
    cleaned = re.sub(r",\s*([\]}])", r"\1", text[start : end + 1])
    return json.loads(cleaned)


def _normalize_step(step):
    """Coerce one step to the shape the frontend expects."""
    return {
        "time": str(step.get("time", "12:00")),
        "place": str(step.get("place", "Unknown")),
        "lat": float(step.get("lat", 0)),
        "lng": float(step.get("lng", 0)),
        "note": str(step.get("note", "")),
        "type": str(step.get("type", "poi")),
    }


# ---------------------------------------------------------------------------
# Fixture (Layer 3) — hardcoded fallback
# ---------------------------------------------------------------------------

def _fixture_itinerary(title, village, slot_time, nearby_pois):
    """Generate a deterministic 3-step itinerary from available POIs."""
    slot_hour = 12
    if slot_time and "T" in str(slot_time):
        try:
            slot_hour = int(str(slot_time).split("T")[1][:2])
        except (ValueError, IndexError):
            pass

    steps = []

    # Morning stop (1-2 hours before slot)
    morning_hour = max(8, slot_hour - 2)
    if nearby_pois:
        steps.append({
            "time": f"{morning_hour}:00",
            "place": nearby_pois[0]["name"],
            "lat": nearby_pois[0]["lat"],
            "lng": nearby_pois[0]["lng"],
            "note": f"Start your day at this {nearby_pois[0].get('category', 'heritage')} site",
            "type": "poi",
        })

    # Booked experience at slot time
    steps.append({
        "time": f"{slot_hour}:00",
        "place": title or "Your booked experience",
        "lat": nearby_pois[0]["lat"] if nearby_pois else 0,
        "lng": nearby_pois[0]["lng"] if nearby_pois else 0,
        "note": f"Your booked experience in {village or 'the village'}",
        "type": "experience",
    })

    # Afternoon stop (1-2 hours after slot)
    afternoon_hour = min(17, slot_hour + 2)
    if len(nearby_pois) > 1:
        steps.append({
            "time": f"{afternoon_hour}:00",
            "place": nearby_pois[1]["name"],
            "lat": nearby_pois[1]["lat"],
            "lng": nearby_pois[1]["lng"],
            "note": f"End with a visit to this {nearby_pois[1].get('category', 'site')}",
            "type": "poi",
        })

    return [_normalize_step(s) for s in steps]


# ---------------------------------------------------------------------------
# Layer 1 — Gemini
# ---------------------------------------------------------------------------

def _gemini_itinerary(prompt_text):
    from google import genai
    from google.genai import types

    client = genai.Client(
        api_key=config.GEMINI_API_KEY,
        http_options={"timeout": 20_000},
    )

    response = client.models.generate_content(
        model=config.GEMINI_MODEL,
        contents=prompt_text,
        config=types.GenerateContentConfig(
            temperature=0.3,
            response_mime_type="application/json",
        ),
    )
    return _extract_json(response.text)


# ---------------------------------------------------------------------------
# Layer 2 — Groq
# ---------------------------------------------------------------------------

def _groq_itinerary(prompt_text):
    from groq import Groq

    client = Groq(api_key=config.GROQ_API_KEY, timeout=15.0)

    completion = client.chat.completions.create(
        model=config.GROQ_LLM_MODEL,
        messages=[
            {"role": "system", "content": "You are a travel planner. Return valid JSON only."},
            {"role": "user", "content": prompt_text},
        ],
        temperature=0.3,
        response_format={"type": "json_object"},
    )
    return _extract_json(completion.choices[0].message.content)


# ---------------------------------------------------------------------------
# Orchestrator
# ---------------------------------------------------------------------------

def generate_itinerary(
    title: str,
    village: str,
    slot_time: str,
    description: str,
    lat: float,
    lng: float,
    radius_km: float,
    pois: list[dict],
) -> dict:
    """Generate an itinerary for a booked experience.

    Returns: { "steps": [...], "source": "gemini"|"groq"|"fixture" }
    """
    nearby = find_nearby_pois(lat, lng, radius_km, pois)

    # Build the prompt
    poi_list = _format_poi_list(nearby) if nearby else "No nearby POIs found — use your general knowledge of the region."

    prompt = ITINERARY_PROMPT.replace("{title}", title or "Unnamed experience")
    prompt = prompt.replace("{village}", village or "a village in Gujarat")
    prompt = prompt.replace("{slot_time}", slot_time or "12:00")
    prompt = prompt.replace("{description}", description or "A local village experience")
    prompt = prompt.replace("{radius_km}", str(radius_km))
    prompt = prompt.replace("{poi_list}", poi_list)

    engine = config.VOICE_ENGINE  # reuse the same engine control

    # Layer 1 — Gemini
    if engine in ("auto", "gemini") and config.GEMINI_API_KEY:
        try:
            raw = _gemini_itinerary(prompt)
            steps = [_normalize_step(s) for s in (raw if isinstance(raw, list) else raw.get("steps", []))]
            if steps:
                log.info("Itinerary generated via Gemini")
                return {"steps": steps, "source": "gemini"}
        except Exception as e:
            log.warning("Gemini itinerary failed (%s), trying Groq", e)

    # Layer 2 — Groq
    if engine in ("auto", "groq") and config.GROQ_API_KEY:
        try:
            raw = _groq_itinerary(prompt)
            steps = [_normalize_step(s) for s in (raw if isinstance(raw, list) else raw.get("steps", []))]
            if steps:
                log.info("Itinerary generated via Groq")
                return {"steps": steps, "source": "groq"}
        except Exception as e:
            log.warning("Groq itinerary failed (%s), using fixture", e)

    # Layer 3 — Fixture
    steps = _fixture_itinerary(title, village, slot_time, nearby)
    log.info("Itinerary generated via fixture")
    return {"steps": steps, "source": "fixture"}
