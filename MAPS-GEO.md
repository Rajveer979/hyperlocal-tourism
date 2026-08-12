# MAPS & GEO — Leaflet · OSRM · Distance Math

**Project:** Hyperlocal Tourism · Smart India Hackathon
**Read first:** [`API-CONTRACT.md`](./API-CONTRACT.md) — the shared day-0 contract everyone builds against.

> **Project snapshot:** You own the second money moment — traveller enters Ahmedabad → Udaipur, the route draws, and experiences appear along it. You also own the day-one geography check that makes that moment *true* (villages genuinely within 10 km of the route).

---

## Role

Map rendering, route drawing, distance-to-polyline math, and routing strategy (seeded polyline first, live OSRM as fallback).

## Features you own

| Feature | Your part |
|---|---|
| **F8** Route discovery ⭐ | route polyline render, distance-to-polyline filtering, ordered stops |
| **F9** Map browse | shared `MapView` component for the Explore page |
| Corridor verification | day-one task with the data teammate — makes F8 true on stage |

## Deliverables

```
frontend/src/components/map/   MapView.jsx (Leaflet wrapper) · RouteLayer.jsx (draws polyline) · ExperiencePin.jsx
frontend/src/utils/geo.js      point-to-segment helpers (client-side preview only — server decides)
backend/app/services/geo_service.py      shapely: LineString(polyline).distance(Point(x,y))
backend/app/services/routing_service.py  OSRM fetch → polyline, with SEEDED POLYLINE as primary
backend/seed/route_ahmedabad_udaipur.json  pre-fetched polyline (freeze on day 1)
```

## The math (do this right)

- Server: `shapely` — `LineString(polyline).distance(Point(lat, lng))` is one call, BUT shapely works in **degrees**. Apply a haversine correction or a local projection so the 10 km threshold is actually kilometres.
- Sort matches by position along the polyline (route progress 0–1) → pins become ordered stops.

## Routing strategy

1. **Primary:** pre-seeded polyline for the demo corridor (never flaky)
2. **Fallback:** live OSRM fetch (public server is rate-limited — don't rely on it on stage)
3. If even the line fails, pins + distances must still render

## Day-one task: corridor verification (with the data teammate) — do this FIRST

1. Pick corridor (default: NH-48 Ahmedabad → Udaipur)
2. Geocode endpoints → fetch polyline once → save to seed
3. Check every planned experience's lat/lng: distance to polyline ≤ 10 km
4. **Freeze the verified list** — this is the contract every other feature depends on
5. Result: you KNOW the stage moment shows "6 experiences along the route"

## Dependencies

- **Needs:** `GET /experiences/route` from the backend teammate (you provide `geo_service`, they wire it); seed lat/lng data from the data teammate; corridor decision from the team.
- **Gives:** `MapView` / `RouteLayer` / `ExperiencePin` components + props contract to the frontend teammate; `geo_service` to the backend teammate; verified corridor to everyone.

## Build order

1. Day 0 — agree map props contract with the frontend teammate
2. Corridor verification + polyline seed (with the data teammate)
3. Leaflet `MapView` skeleton (OSM tiles, attribution visible)
4. `geo_service` (shapely + haversine) + unit check on known points
5. `/experiences/route` wired with the backend teammate
6. `RouteLayer` + `ExperiencePin` + ordered-stop rendering
7. Explore map browse (shared `MapView`)

## Definition of done

- [ ] For the demo corridor: ≥ 10 experiences verified inside 10 km of the route
- [ ] `/experiences/route` returns correct ordered results
- [ ] Map renders route + pins in RouteResults and Explore
- [ ] Tile attribution stays visible (OSM policy)

## Gotchas

- Degrees ≠ km: never ship raw shapely distance as a km threshold
- OSM tile usage: fine for app display; **do not** bundle tiles into the offline pack — the offline pack uses a static rendered map image (see frontend/data briefs)
- Real village coordinates only — the audience can check
- If live OSRM is slow, the seeded polyline saves the demo
