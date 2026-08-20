"""F8 route math — distance from an experience to a route polyline.

Shapely's LineString.distance() works in the input units, and raw lat/lng
degrees are not kilometres. We therefore project both the polyline and the
point into a local equirectangular plane (metres) centred on the route
midpoint, run shapely there, and convert back to km. This keeps the
10 km threshold honest (see MAPS-GEO.md: "degrees ≠ km").

Also computes route_progress (0–1): the fraction of the polyline travelled
to reach the nearest point — used to order experiences as stops.
"""

from __future__ import annotations

import math

from shapely.geometry import LineString, Point

EARTH_RADIUS_M = 6_371_000.0


def _equirect_scale(lat_deg: float) -> float:
    """Metres per degree at this latitude (x direction shrinks with cos(lat))."""
    lat_rad = math.radians(lat_deg)
    return math.cos(lat_rad)


def _to_plane(lat: float, lng: float, ref_lat: float, ref_lng: float) -> tuple[float, float]:
    """Project (lat, lng) to local (x=East, y=North) metres from a reference point."""
    m_per_deg_lat = EARTH_RADIUS_M * math.pi / 180.0
    m_per_deg_lng = m_per_deg_lat * _equirect_scale(ref_lat)
    return (lng - ref_lng) * m_per_deg_lng, (lat - ref_lat) * m_per_deg_lat


def distance_to_polyline_km(lat: float, lng: float, polyline: list[list[float]]) -> float:
    """Shortest distance (km) from point to the polyline. Infinity if polyline is empty."""
    if not polyline or len(polyline) < 2:
        return float("inf")

    # Reference = polyline midpoint, so the equirectangular projection error
    # stays negligible across the whole corridor.
    mid = polyline[len(polyline) // 2]
    ref_lat, ref_lng = mid[0], mid[1]

    line = LineString([_to_plane(la, ln, ref_lat, ref_lng) for la, ln in polyline])
    point = Point(_to_plane(lat, lng, ref_lat, ref_lng))
    return line.distance(point) / 1000.0


def route_progress(lat: float, lng: float, polyline: list[list[float]]) -> float:
    """Fraction (0–1) along the polyline to the nearest point — orders stops."""
    if not polyline or len(polyline) < 2:
        return 0.0

    mid = polyline[len(polyline) // 2]
    ref_lat, ref_lng = mid[0], mid[1]

    line = LineString([_to_plane(la, ln, ref_lat, ref_lng) for la, ln in polyline])
    point = Point(_to_plane(lat, lng, ref_lat, ref_lng))
    if line.length == 0:
        return 0.0
    return line.project(point, normalized=True)


def filter_by_radius(
    experiences: list[dict],
    polyline: list[list[float]],
    radius_km: float,
) -> list[dict]:
    """Keep experiences within radius_km of the route, each annotated with
    distance_km and route_progress, sorted as ordered stops along the route."""
    annotated = []
    for exp in experiences:
        lat, lng = exp.get("lat"), exp.get("lng")
        if lat is None or lng is None:
            continue
        dist = distance_to_polyline_km(lat, lng, polyline)
        if dist <= radius_km:
            annotated.append(
                {
                    "experience": exp,
                    "distance_km": round(dist, 1),
                    "route_progress": round(route_progress(lat, lng, polyline), 3),
                }
            )
    annotated.sort(key=lambda r: r["route_progress"])
    return annotated
