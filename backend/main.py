"""FastAPI entry point -- voice feature (F1), city/nearby search (F8),
map browse (F9), guides, reviews (F18), auth, and database.

Run from backend/:  uvicorn main:app --reload
Docs: http://localhost:8000/docs
"""

import json
import math
import os
from contextlib import asynccontextmanager
import httpx
from fastapi import Depends, FastAPI, File, Form, HTTPException, Query, UploadFile
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app import config
from app.database import Base, engine
from app.models.poi import POI
from app.models.experience import Experience
from app.routes.admin import router as admin_router
from app.database import get_db
from app.routes.auth import router as auth_router
from app.routes.experiences import router as experiences_router
from app.routes.bookings import router as bookings_router
from app.routes.reviews import router as reviews_router
from app.services.itinerary_service import generate_itinerary
from app.services.voice_service import structure_listing
from app.experiences_data import EXPERIENCES
from app.guides_data import GUIDES


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    # Seed POIs on startup
    try:
        from seed.seed_pois import seed_pois
        seed_pois()
    except Exception as e:
        print(f"[WARN] POI seeding failed: {e}")
    yield


app = FastAPI(title="Hyperlocal Tourism", version="0.2.0", lifespan=lifespan)

# Serve uploaded photos
_uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(_uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=_uploads_dir), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# NOTE: Our geo routes (/experiences/nearby, /experiences-list, /guides) are
# defined below. Router includes are registered AFTER to avoid path conflicts
# with the upstream experiences_router's /experiences/{exp_id}.


@app.get("/health")
def health():
    return {"status": "ok", "engine": config.VOICE_ENGINE}


@app.post("/voice/structure")
async def voice_structure(
    language: str = Form(...),
    audio: UploadFile | None = File(None),
    transcript: str | None = Form(None),
    previous: str | None = Form(None),
):
    """Audio (WAV 16 kHz mono) + language -> {listing, missing, question}."""
    if audio is None and not transcript:
        raise HTTPException(status_code=400, detail="Provide an audio file or a transcript")

    prev = None
    if previous:
        try:
            prev = json.loads(previous)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="previous must be a JSON object") from None

    audio_bytes = await audio.read() if audio else None
    return structure_listing(
        audio_bytes=audio_bytes,
        language=language,
        transcript=transcript,
        previous=prev,
    )


# ---------------------------------------------------------------------------
# Geo helpers
# ---------------------------------------------------------------------------

CITY_COORDS = {
    "ahmedabad": {"lat": 23.0225, "lng": 72.5714},
    "vadodara": {"lat": 22.3072, "lng": 73.1812},
    "surat": {"lat": 21.1702, "lng": 72.8311},
    "halol": {"lat": 22.5047, "lng": 73.4710},
    "rajkot": {"lat": 22.3039, "lng": 70.8022},
    "udaipur": {"lat": 24.5854, "lng": 73.7125},
    "mumbai": {"lat": 19.0760, "lng": 72.8777},
    "himmatnagar": {"lat": 23.5919, "lng": 72.9603},
    "shamlaji": {"lat": 23.6879, "lng": 73.3861},
    "prantij": {"lat": 23.4372, "lng": 72.8518},
    "kherwara": {"lat": 23.9853, "lng": 73.5945},
    "rishabdeo": {"lat": 24.0766, "lng": 73.6915},
    "raigadh": {"lat": 23.6020, "lng": 73.1814},
    "dhamod": {"lat": 23.7706, "lng": 73.4912},
    "chandrala": {"lat": 23.3417, "lng": 72.7827},
    "amjhhara": {"lat": 23.8765, "lng": 73.5308},
    "vav": {"lat": 24.1253, "lng": 73.6921},
    "chanbora": {"lat": 24.4649, "lng": 73.6486},
    "mota chiloda": {"lat": 23.2267, "lng": 72.7305},
    "mota": {"lat": 23.2267, "lng": 72.7305},
    "bhuj": {"lat": 23.253, "lng": 69.669},
    "jaipur": {"lat": 26.9124, "lng": 75.7873},
    "jodhpur": {"lat": 26.2389, "lng": 73.0243},
    "mount abu": {"lat": 24.5926, "lng": 72.7156},
    "abu": {"lat": 24.5926, "lng": 72.7156},
}


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


async def _geocode_city(name: str) -> dict:
    key = name.strip().lower()
    if key in CITY_COORDS:
        return {"lat": CITY_COORDS[key]["lat"], "lng": CITY_COORDS[key]["lng"], "display_name": name}
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            resp = await client.get(
                "https://nominatim.openstreetmap.org/search",
                params={"q": name, "format": "json", "limit": 1, "countrycodes": "in"},
                headers={"User-Agent": "HyperlocalTourism/0.1"},
            )
            results = resp.json()
            if results:
                r = results[0]
                return {
                    "lat": float(r["lat"]),
                    "lng": float(r["lon"]),
                    "display_name": r.get("display_name", name),
                }
    except Exception:
        pass
    raise HTTPException(
        status_code=404,
        detail=f"Could not find city/town '{name}'. Try Ahmedabad, Udaipur, etc.",
    )


# ---------------------------------------------------------------------------
# F8 -- City / nearby search
# ---------------------------------------------------------------------------

@app.get("/experiences/nearby")
async def experiences_nearby(
    city: str = Query("Ahmedabad", description="City or town name"),
    radius_km: float = Query(10.0, ge=1.0, le=60.0, description="Search radius in km (max 60)"),
    category: str | None = None,
    max_price: float | None = None,
    db: Session = Depends(get_db),
):
    """Return experiences within radius_km of the city/town centre."""
    geo = await _geocode_city(city)
    center_lat, center_lng = geo["lat"], geo["lng"]

    all_items = db.query(Experience).filter(Experience.is_active == True).all()
    results = []
    for e in all_items:
        if e.lat is None or e.lng is None:
            continue
        dist = _haversine_km(center_lat, center_lng, e.lat, e.lng)
        if dist <= radius_km:
            results.append({"experience": e.to_dict(), "distance_km": round(dist, 2)})

    if category and category != "all":
        results = [r for r in results if r["experience"].get("category") == category]
    if max_price is not None:
        results = [r for r in results if r["experience"]["price"] <= max_price]

    results.sort(key=lambda r: r["distance_km"])

    return {
        "city": geo["display_name"],
        "center": {"lat": center_lat, "lng": center_lng},
        "radius_km": radius_km,
        "results": results,
        "total": len(results),
    }


# ---------------------------------------------------------------------------
# F9 -- Map browse: list / filter experiences
# ---------------------------------------------------------------------------

@app.get("/experiences-list")
def list_experiences(
    category: str | None = None,
    max_price: float | None = None,
    women_hosted: bool | None = None,
    language: str | None = None,
    q: str | None = None,
    lat: float | None = None,
    lng: float | None = None,
    sort_by: str | None = None,
):
    """Return all active experiences (optionally filtered) for map browse."""
    items = [e for e in EXPERIENCES if e.get("is_active", True)]
    if category and category != "all":
        items = [e for e in items if e["category"] == category]
    if max_price is not None:
        items = [e for e in items if e["price"] <= max_price]
    if women_hosted:
        items = [e for e in items if e.get("host", {}).get("is_women_hosted")]
    if language and language != "all":
        items = [e for e in items if language in e.get("languages_spoken", [])]
    if q:
        ql = q.lower()
        items = [
            e for e in items
            if ql in e["title"].lower()
            or ql in e.get("description", "").lower()
            or ql in e.get("village_name", "").lower()
        ]
    if lat is not None and lng is not None and sort_by == "distance":
        for e in items:
            e["_distance_km"] = round(_haversine_km(lat, lng, e["lat"], e["lng"]), 2)
        items.sort(key=lambda e: e["_distance_km"])
    return items


# ---------------------------------------------------------------------------
# Guides -- find local guides in a city/town
# ---------------------------------------------------------------------------

@app.get("/guides")
async def list_guides(
    city: str = Query(..., description="City or town name to search guides in"),
    radius_km: float = Query(25.0, ge=1.0, le=200.0, description="Search radius in km"),
    language: str | None = None,
):
    """Find available guides near a city/town."""
    geo = await _geocode_city(city)
    center_lat, center_lng = geo["lat"], geo["lng"]

    results = []
    city_key = city.strip().lower()
    for g in GUIDES:
        if not g.get("available", True):
            continue
        if g.get("city", "").lower() == city_key:
            results.append({**g, "distance_km": 0.0})
            continue
        dist = _haversine_km(center_lat, center_lng, g["lat"], g["lng"])
        if dist <= radius_km:
            results.append({**g, "distance_km": round(dist, 2)})

    if language and language != "all":
        results = [g for g in results if language in g.get("languages", [])]

    results.sort(key=lambda g: g["distance_km"])

    return {
        "city": geo["display_name"],
        "center": {"lat": center_lat, "lng": center_lng},
        "radius_km": radius_km,
        "guides": results,
        "total": len(results),
    }


# Register upstream routers AFTER our geo routes to avoid path conflicts
app.include_router(admin_router)
app.include_router(auth_router)
app.include_router(experiences_router)
app.include_router(reviews_router)
app.include_router(bookings_router)


# ---------------------------------------------------------------------------
# F12 -- AI Itinerary Builder
# ---------------------------------------------------------------------------

@app.post("/itinerary/generate")
def itinerary_generate(
    booking_id: int = Form(...),
    experience_id: int = Form(...),
    title: str = Form(""),
    village: str = Form(""),
    slot_time: str = Form(""),
    description: str = Form(""),
    lat: float = Form(23.0),
    lng: float = Form(72.5),
    radius_km: float = Form(20.0),
):
    """Generate a day plan for a booked experience."""
    # Load POIs from database
    from sqlalchemy.orm import Session as Ses
    with Ses(engine) as db:
        pois = [p.to_dict() for p in db.query(POI).all()]

    result = generate_itinerary(
        title=title,
        village=village,
        slot_time=slot_time,
        description=description,
        lat=lat,
        lng=lng,
        radius_km=radius_km,
        pois=pois,
    )
    return result
