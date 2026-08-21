"""F12 — AI Itinerary Builder.

Given a booked experience (lat/lng + slot time) and nearby POIs,
call an LLM to produce a realistic half-day itinerary.

Fallback chain (same as voice):
  1. Gemini — one text call → JSON timeline
  2. Groq   — one text call → JSON timeline
  3. fixture — location-aware fallback (demo never breaks)
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
- Village/Town: {village}
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
7. Uses ONLY the POIs listed above — do NOT invent places that aren't in the list

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

def _safe_float(val, default=0.0):
    """Safely convert a value to float, handling None."""
    if val is None:
        return default
    try:
        return float(val)
    except (TypeError, ValueError):
        return default


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
        dist = poi.get('distance_km', '')
        dist_str = f', {dist} km away' if dist else ''
        note = poi.get('description') or poi.get('note', '')
        lines.append(
            f"{i}. {poi['name']} ({poi.get('category', 'place')}){dist_str} — "
            f"lat: {poi['lat']}, lng: {poi['lng']}"
        )
        if note:
            lines.append(f"   {note}")
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
        "time": str(step.get("time") or "12:00"),
        "place": str(step.get("place") or "Unknown"),
        "lat": _safe_float(step.get("lat")),
        "lng": _safe_float(step.get("lng")),
        "note": str(step.get("note") or ""),
        "type": str(step.get("type") or "poi"),
    }


# ---------------------------------------------------------------------------
# Fixture (Layer 3) — location-aware fallback
# ---------------------------------------------------------------------------

REGION_FALLBACKS = {
    "jaipur": [
        {"name": "Amber Fort", "lat": 26.9855, "lng": 75.8513, "category": "heritage", "note": "Hilltop palace-fortress with mirrorwork and panoramic views"},
        {"name": "Hawa Mahal", "lat": 26.9239, "lng": 75.8267, "category": "heritage", "note": "Iconic Palace of Winds with 953 latticed windows"},
        {"name": "Jantar Mantar", "lat": 26.9247, "lng": 75.8245, "category": "historical", "note": "UNESCO astronomical observatory with the world's largest stone sundial"},
        {"name": "Nahargarh Fort", "lat": 26.9387, "lng": 75.8152, "category": "heritage", "note": "Fort overlooking the Pink City with stunning sunset views"},
        {"name": "Jal Mahal", "lat": 26.9532, "lng": 75.8462, "category": "heritage", "note": "Water palace in the middle of Man Sagar Lake"},
    ],
    "jodhpur": [
        {"name": "Mehrangarh Fort", "lat": 26.2985, "lng": 73.0184, "category": "heritage", "note": "One of India's largest forts towering over the Blue City"},
        {"name": "Jaswant Thada", "lat": 26.2990, "lng": 73.0146, "category": "heritage", "note": "White marble cenotaph — the Taj Mahal of Marwar"},
        {"name": "Clock Tower Market", "lat": 26.2933, "lng": 73.0261, "category": "food", "note": "Bustling bazaar with spices, textiles, and street food"},
    ],
    "udaipur": [
        {"name": "City Palace Udaipur", "lat": 24.5764, "lng": 73.6913, "category": "heritage", "note": "Rajput lakeside palace complex overlooking Lake Pichola"},
        {"name": "Fateh Sagar Lake", "lat": 24.5975, "lng": 73.6764, "category": "nature", "note": "Scenic lake with Nehru Island Park — sunset boat ride"},
        {"name": "Jagdish Temple", "lat": 24.5883, "lng": 73.6909, "category": "temple", "note": "Indo-Aryan temple with carved elephants and deity of Lord Vishnu"},
    ],
    "jaisalmer": [
        {"name": "Jaisalmer Fort", "lat": 26.9124, "lng": 70.9126, "category": "heritage", "note": "Living sandstone fort with shops, homes, and temples inside"},
        {"name": "Sam Sand Dunes", "lat": 26.7969, "lng": 70.4935, "category": "nature", "note": "Rolling Thar Desert dunes — camel safari at sunset"},
        {"name": "Patwon Ki Haveli", "lat": 26.9058, "lng": 70.9143, "category": "heritage", "note": "Ornate 19th-century merchant mansions with intricate carvings"},
    ],
    "delhi": [
        {"name": "Red Fort", "lat": 28.6562, "lng": 77.2410, "category": "heritage", "note": "Mughal emperor Shah Jahan's massive red sandstone palace"},
        {"name": "Qutub Minar", "lat": 28.5244, "lng": 77.1855, "category": "heritage", "note": "73-meter tall victory tower from 1193"},
        {"name": "Humayun's Tomb", "lat": 28.5933, "lng": 77.2507, "category": "heritage", "note": "Mughal garden tomb that inspired the Taj Mahal"},
        {"name": "Chandni Chowk", "lat": 28.6506, "lng": 77.2334, "category": "food", "note": "Old Delhi's legendary street food market — paranthas, chaat, and kebabs"},
    ],
    "mumbai": [
        {"name": "Gateway of India", "lat": 18.9220, "lng": 72.8347, "category": "heritage", "note": "Iconic 1924 arch monument overlooking the Arabian Sea"},
        {"name": "Elephanta Caves", "lat": 18.9634, "lng": 72.9315, "category": "heritage", "note": "UNESCO island caves with massive rock-cut Shiva sculptures"},
        {"name": "Marine Drive", "lat": 18.9432, "lng": 72.8231, "category": "nature", "note": "C-shaped boulevard along the coast — sunset walk"},
    ],
    "varanasi": [
        {"name": "Dashashwamedh Ghat", "lat": 25.3046, "lng": 83.0106, "category": "cultural", "note": "Spectacular Ganga Aarti ceremony every evening"},
        {"name": "Sarnath", "lat": 25.3714, "lng": 83.0226, "category": "heritage", "note": "Where Buddha gave his first sermon — ancient stupas and deer park"},
    ],
    "ahmedabad": [
        {"name": "Sabarmati Ashram", "lat": 23.0627, "lng": 72.5807, "category": "heritage", "note": "Gandhi's riverside ashram and museum"},
        {"name": "Adalaj Stepwell", "lat": 23.1638, "lng": 72.6364, "category": "heritage", "note": "Ornate 15th-century stepwell with intricate carvings"},
        {"name": "Jama Masjid", "lat": 23.0243, "lng": 72.5812, "category": "heritage", "note": "Ahmedabad's oldest mosque with stunning yellow sandstone architecture"},
    ],
    "vadodara": [
        {"name": "Laxmi Vilas Palace", "lat": 22.3117, "lng": 73.1817, "category": "heritage", "note": "Indo-Saracenic palace four times the size of Buckingham Palace"},
        {"name": "Champaner-Pavagadh", "lat": 22.4833, "lng": 73.5333, "category": "heritage", "note": "UNESCO World Heritage archaeological park in the Aravalli foothills"},
    ],
    "hampi": [
        {"name": "Virupaksha Temple", "lat": 15.3350, "lng": 76.4600, "category": "temple", "note": "Active 7th-century temple with a 160-foot tower"},
        {"name": "Vijaya Vittala Temple", "lat": 15.3483, "lng": 76.4730, "category": "heritage", "note": "Famous for its stone chariot and musical pillars"},
    ],
    "goa": [
        {"name": "Basilica of Bom Jesus", "lat": 15.5009, "lng": 73.9116, "category": "heritage", "note": "UNESCO baroque church housing St. Francis Xavier's remains"},
        {"name": "Fort Aguada", "lat": 15.4922, "lng": 73.7736, "category": "historical", "note": "17th-century Portuguese fort with panoramic sea views"},
    ],
    "kochi": [
        {"name": "Fort Kochi", "lat": 9.9638, "lng": 76.2431, "category": "heritage", "note": "450-year-old Portuguese/Dutch fishing village with Chinese fishing nets"},
    ],
    "alleppey": [
        {"name": "Alleppey Backwaters", "lat": 9.4981, "lng": 76.3388, "category": "nature", "note": "Houseboat cruises through coconut palm-lined waterways"},
    ],
}

def _get_region_fallback(village):
    """Find fallback POIs based on the village/town name."""
    if not village:
        return []
    village_lower = village.lower().strip()
    for key, pois in REGION_FALLBACKS.items():
        if key in village_lower or village_lower in key:
            return pois
    return []


def _fixture_itinerary(title, village, slot_time, nearby_pois):
    """Generate a location-aware itinerary from available POIs or region fallback."""
    slot_hour = 12
    if slot_time and "T" in str(slot_time):
        try:
            slot_hour = int(str(slot_time).split("T")[1][:2])
        except (ValueError, IndexError):
            pass

    available_pois = nearby_pois if nearby_pois else _get_region_fallback(village)

    steps = []

    morning_hour = max(8, slot_hour - 2)
    if available_pois:
        poi = available_pois[0]
        steps.append({
            "time": f"{morning_hour}:00",
            "place": poi["name"],
            "lat": poi["lat"],
            "lng": poi["lng"],
            "note": poi.get("note", f"Start your day at this {poi.get('category', 'heritage')} site"),
            "type": "poi",
        })

    exp_lat = available_pois[0]["lat"] if available_pois else 0
    exp_lng = available_pois[0]["lng"] if available_pois else 0
    steps.append({
        "time": f"{slot_hour}:00",
        "place": title or "Your booked experience",
        "lat": exp_lat,
        "lng": exp_lng,
        "note": f"Your booked experience in {village or 'the village'}",
        "type": "experience",
    })

    afternoon_hour = min(17, slot_hour + 2)
    if len(available_pois) > 1:
        poi2 = available_pois[1]
        steps.append({
            "time": f"{afternoon_hour}:00",
            "place": poi2["name"],
            "lat": poi2["lat"],
            "lng": poi2["lng"],
            "note": poi2.get("note", f"End with a visit to this {poi2.get('category', 'site')}"),
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
            temperature=0.8,
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
        temperature=0.8,
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
    # Determine if coordinates are real or just defaults
    _is_default_coords = (abs(lat - 23.0) < 0.1 and abs(lng - 72.5) < 0.1 and village and village.lower() != 'ahmedabad')

    region_pois = _get_region_fallback(village)

    if _is_default_coords or (not lat or not lng):
        # Coordinates are unreliable — use ONLY region fallback POIs
        all_pois = region_pois
    else:
        # Coordinates are real — combine nearby DB POIs with region fallback
        nearby = find_nearby_pois(lat, lng, radius_km, pois)
        all_pois = nearby[:]
        seen_names = {p["name"] for p in all_pois}
        for rp in region_pois:
            if rp["name"] not in seen_names:
                all_pois.append(rp)
                seen_names.add(rp["name"])

    # Build the prompt
    if all_pois:
        poi_list = _format_poi_list(all_pois)
    else:
        poi_list = f"No nearby POIs found for {village or 'this area'}. Suggest nearby attractions based on the village/town name '{village or 'a village in India'}' and general knowledge of the region."

    prompt = ITINERARY_PROMPT.replace("{title}", title or "Unnamed experience")
    prompt = prompt.replace("{village}", village or "a village in India")
    prompt = prompt.replace("{slot_time}", slot_time or "12:00")
    prompt = prompt.replace("{description}", description or "A local village experience")
    prompt = prompt.replace("{radius_km}", str(radius_km))
    prompt = prompt.replace("{poi_list}", poi_list)
    prompt += f"\n\nCRITICAL: The experience is in {village or 'India'}. ONLY suggest places that are IN or very near {village or 'that city'}. Do NOT suggest places from other cities or states."

    engine = config.VOICE_ENGINE

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
    steps = _fixture_itinerary(title, village, slot_time, all_pois)
    log.info("Itinerary generated via fixture (village=%s, all_pois=%d)", village, len(all_pois))
    return {"steps": steps, "source": "fixture"}
