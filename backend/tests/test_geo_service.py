"""Unit tests for F8 route math (backend/app/services/geo_service.py).

Known-point strategy:
  * Synthetic meridian polyline — distances are hand-computable
    (1 degree latitude approx 111.195 km; the km projection is the whole point
    of geo_service, so this pins the "degrees != km" fix).
  * The frozen corridor seed (backend/seed/route_ahmedabad_udaipur.json) —
    the verified NH-48 villages; no network needed, the seed is local.
"""

import pytest

from app.services.geo_service import (
    distance_to_polyline_km,
    filter_by_radius,
    route_progress,
)
from app.services.routing_service import get_route_polyline

# --- helpers ----------------------------------------------------------------


def corridor() -> list[list[float]]:
    """The frozen Ahmedabad -> Udaipur polyline (local seed, no network)."""
    return get_route_polyline(from_name="Ahmedabad", to_name="Udaipur")


# --- distance: hand-computable meridian --------------------------------------


def test_equator_known_distance():
    """An east-west line 1 deg long along the equator; a point 0.5 deg north
    of its middle is 0.5 deg of latitude away -- which must come out as ~55.6 km."""
    polyline = [[0.0, 0.0], [0.0, 1.0]]  # [lat, lng]: along the equator
    d = distance_to_polyline_km(0.5, 0.5, polyline)  # 0.5 deg north of the line
    assert d == pytest.approx(0.5 * 111.195, abs=0.5)  # ~55.6 km, NOT 0.5


def test_equator_known_progress():
    """Midpoint of a straight line projects to route_progress 0.5."""
    polyline = [[0.0, 0.0], [0.0, 1.0]]
    assert route_progress(0.5, 0.5, polyline) == pytest.approx(0.5, abs=0.01)


def test_point_on_line_is_zero_distance():
    """Points exactly on the polyline report 0 km."""
    polyline = [[10.0, 10.0], [10.5, 10.0], [11.0, 10.0]]
    assert distance_to_polyline_km(10.5, 10.0, polyline) == pytest.approx(0.0, abs=0.001)
    assert distance_to_polyline_km(10.0, 10.0, polyline) == pytest.approx(0.0, abs=0.001)


def test_progress_at_endpoints():
    """Progress is 0 at the start and 1 at the end of a polyline."""
    polyline = [[10.0, 10.0], [10.5, 10.0], [11.0, 10.0]]
    assert route_progress(10.0, 10.0, polyline) == pytest.approx(0.0, abs=0.001)
    assert route_progress(11.0, 10.0, polyline) == pytest.approx(1.0, abs=0.001)


# --- distance: degenerate inputs ----------------------------------------------


def test_empty_polyline_is_infinity():
    assert distance_to_polyline_km(23.5, 73.0, []) == float("inf")
    assert distance_to_polyline_km(23.5, 73.0, None) == float("inf")


def test_single_point_polyline_is_infinity():
    assert distance_to_polyline_km(23.5, 73.0, [[23.5, 73.0]]) == float("inf")


def test_empty_polyline_progress_is_zero():
    assert route_progress(23.5, 73.0, []) == 0.0
    assert route_progress(23.5, 73.0, [[23.5, 73.0]]) == 0.0


# --- corridor verification (frozen seed) ---------------------------------------
# Values below were computed by hand-checking the OSRM polyline (see MAPS-GEO.md
# "verified corridor"); these tests freeze them so the demo can't silently drift.


def test_corridor_endpoints_are_on_route():
    polyline = corridor()
    assert len(polyline) > 1000  # real OSRM geometry, not a hand-drawn stub
    assert distance_to_polyline_km(23.0225, 72.5714, polyline) == pytest.approx(0.0, abs=1.0)
    assert distance_to_polyline_km(24.5854, 73.7125, polyline) == pytest.approx(0.0, abs=1.0)
    assert route_progress(24.5854, 73.7125, polyline) == pytest.approx(1.0, abs=0.02)


def test_verified_villages_within_10km():
    """All 11 demo villages must stay within 10 km of the real highway."""
    polyline = corridor()
    villages = [
        # (name, lat, lng, expected distance km)
        ("Mota Chiloda", 23.2267, 72.7305, 0.0),
        ("Chandrala", 23.3417, 72.7827, 0.0),
        ("Prantij", 23.4372, 72.8518, 0.7),
        ("Himmatnagar", 23.5919, 72.9603, 1.2),
        ("Raigadh", 23.6020, 73.1814, 0.0),
        ("Shamlaji", 23.6879, 73.3861, 0.2),
        ("Dhamod", 23.7706, 73.4912, 0.0),
        ("Amjhhara", 23.8765, 73.5308, 0.0),
        ("Kherwara", 23.9853, 73.5945, 0.2),
        ("Rishabdeo", 24.0766, 73.6915, 0.7),
        ("Vav", 24.1253, 73.6921, 0.0),
        ("Chanbora", 24.4649, 73.6486, 0.2),
    ]
    for name, lat, lng, expected_km in villages:
        d = distance_to_polyline_km(lat, lng, polyline)
        assert d <= 10.0, f"{name} drifted off the corridor: {d:.1f} km"
        assert d == pytest.approx(expected_km, abs=1.5), name


def test_off_route_village_is_excluded():
    """Bhuj (~300 km from NH-48) must be far outside the corridor."""
    polyline = corridor()
    d = distance_to_polyline_km(23.253, 69.669, polyline)
    assert d > 200.0


def test_verified_villages_are_ordered_along_route():
    """route_progress must increase in travel order for the demo stops."""
    polyline = corridor()
    stops = [
        ("Mota Chiloda", 23.2267, 72.7305),
        ("Chandrala", 23.3417, 72.7827),
        ("Prantij", 23.4372, 72.8518),
        ("Himmatnagar", 23.5919, 72.9603),
        ("Raigadh", 23.6020, 73.1814),
        ("Shamlaji", 23.6879, 73.3861),
        ("Dhamod", 23.7706, 73.4912),
        ("Amjhhara", 23.8765, 73.5308),
        ("Kherwara", 23.9853, 73.5945),
        ("Rishabdeo", 24.0766, 73.6915),
        ("Vav", 24.1253, 73.6921),
        ("Chanbora", 24.4649, 73.6486),
    ]
    progresses = [route_progress(lat, lng, polyline) for _, lat, lng in stops]
    assert progresses == sorted(progresses), f"not ordered: {progresses}"
    assert progresses[0] == pytest.approx(0.12, abs=0.05)
    assert progresses[-1] == pytest.approx(0.93, abs=0.05)
    # Must have at least 10 stops
    assert len(stops) >= 10


# --- filter_by_radius ----------------------------------------------------------


def test_filter_by_radius_orders_and_excludes():
    polyline = [[0.0, 0.0], [0.0, 1.0]]  # [lat, lng]: along the equator
    experiences = [
        {"id": 1, "lat": 0.0, "lng": 0.2},  # on route, early
        {"id": 2, "lat": 0.0, "lng": 0.8},  # on route, late
        {"id": 3, "lat": 0.5, "lng": 2.0},  # ~124 km off -- must be dropped
    ]
    results = filter_by_radius(experiences, polyline, radius_km=10.0)
    assert [r["experience"]["id"] for r in results] == [1, 2]  # ordered, off-route gone
    assert results[0]["distance_km"] <= 1.0
    assert results[0]["route_progress"] < results[1]["route_progress"]
    for r in results:
        assert {"distance_km", "route_progress", "experience"} <= set(r)


def test_filter_by_radius_empty_polyline():
    results = filter_by_radius([{"id": 1, "lat": 23.5, "lng": 73.0}], [], radius_km=10.0)
    assert results == []
