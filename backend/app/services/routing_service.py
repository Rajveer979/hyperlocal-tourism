"""F8 routing strategy — seeded polyline primary, live OSRM fallback.

Per MAPS-GEO.md: the demo corridor (Ahmedabad → Udaipur) uses the frozen
pre-seeded polyline (never flaky on stage). For any other from/to pair we
try the public OSRM server, and if that fails we return an empty polyline —
the caller still renders pins with distances computed against the corridor.

Seed file: backend/seed/route_ahmedabad_udaipur.json
  { corridor: {from, to}, polyline: [[lat, lng], ...], ... }
"""

from __future__ import annotations

import json
import math
from pathlib import Path

import httpx

SEED_DIR = Path(__file__).resolve().parents[2] / "seed"
OSRM_URL = "https://router.project-osrm.org/route/v1/driving"
OSRM_TIMEOUT_S = 15.0


def _load_seed() -> dict | None:
    path = SEED_DIR / "route_ahmedabad_udaipur.json"
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return None


def _seed_matches(seed: dict, from_name: str, to_name: str) -> bool:
    """Match by place name (case-insensitive) so 'ahmedabad' == 'Ahmedabad'."""
    if not seed or "corridor" not in seed:
        return False
    c = seed["corridor"]
    return (
        c["from"]["name"].strip().lower() == (from_name or "").strip().lower()
        and c["to"]["name"].strip().lower() == (to_name or "").strip().lower()
    )


def _fetch_osrm(lat1: float, lng1: float, lat2: float, lng2: float) -> list[list[float]] | None:
    """Live OSRM fetch → [[lat, lng], ...]. None on any failure (rate-limit, network…)."""
    try:
        resp = httpx.get(
            f"{OSRM_URL}/{lng1},{lat1};{lng2},{lat2}",
            params={"overview": "full", "geometries": "geojson"},
            timeout=OSRM_TIMEOUT_S,
        )
        resp.raise_for_status()
        route = resp.json()["routes"][0]
        # OSRM returns [lng, lat] — flip to the project's [lat, lng] convention.
        return [[lat, lng] for lng, lat in route["geometry"]["coordinates"]]
    except Exception:
        return None


def get_route_polyline(
    from_name: str = "",
    to_name: str = "",
    from_lat: float | None = None,
    from_lng: float | None = None,
    to_lat: float | None = None,
    to_lng: float | None = None,
) -> list[list[float]]:
    """Primary: seeded corridor polyline. Fallback: live OSRM. Last resort: [].

    Coordinates win when both names and coords are given (exact match on the
    seed needs the names; OSRM needs the coords).
    """
    seed = _load_seed()
    if seed and _seed_matches(seed, from_name, to_name):
        return seed["polyline"]

    if None in (from_lat, from_lng, to_lat, to_lng):
        return []
    fetched = _fetch_osrm(from_lat, from_lng, to_lat, to_lng)
    return fetched or []


def route_metadata(polyline: list[list[float]]) -> dict:
    """Approximate total length (km) of the polyline via haversine steps."""
    total = 0.0
    for (lat1, lng1), (lat2, lng2) in zip(polyline, polyline[1:]):
        total += _haversine_km(lat1, lng1, lat2, lng2)
    return {"length_km": round(total, 1)}


def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))
