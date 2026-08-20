# MAPS & GEO — Leaflet · OSRM · Distance Math

**Project:** Hyperlocal Tourism · Smart India Hackathon
**Read first:** [`API-CONTRACT.md`](./API-CONTRACT.md) — the shared day-0 contract everyone builds against.

> **Project snapshot:** Traveller enters a city/town name + radius, the map shows a circle with all experiences within that area. You also own "Find a Guide" — matching local guides to the searched area — and "My Location" for nearby sorting.

---

## Role

Map rendering, route drawing, distance-to-polyline math, and routing strategy (seeded polyline first, live OSRM as fallback).

## Features you own

| Feature | Your part |
|---|---|
| **F8** City + Radius Search ⭐ | user enters city + radius → map shows circle + experiences within it |
| **F9** Map Browse | shared `MapView` component for the Explore page |
| **Find a Guide** | search guides available in a city/town area |
| My Location / Find Nearby | browser geolocation + sort by distance |
| Offline Map Tiles | service worker caching OSM tiles for offline use |

## Deliverables

```
frontend/src/components/map/   MapView.jsx (Leaflet wrapper) · RouteLayer.jsx · ExperiencePin.jsx · GuidePin.jsx
frontend/src/hooks/            useGeolocation.js (browser GPS) · useOfflineMaps.js (tile caching)
frontend/src/pages/            CitySearch.jsx (F8 city+radius search) · Explore.jsx (F9 browse)
frontend/src/components/guide/  FindGuideButton.jsx (F18 guide search)
frontend/src/public/sw.js       service worker for offline OSM tile caching
frontend/src/utils/geo.js      haversine distance helpers
backend/app/services/geo_service.py   shapely distance-to-polyline + city radius filtering
backend/app/services/routing_service.py  OSRM fetch → polyline (legacy, kept for route layer)
backend/app/guides_data.py       seed guide profiles with lat/lng
backend/app/experiences_data.py  seed experiences with verified lat/lng
```

## The math (do this right)

- Server: `shapely` for polyline distance (in degrees → local projection to km).
- Haversine: `GET /experiences/nearby?city=X&radius_km=R` uses haversine to filter experiences within the radius of a geocoded city center.
- Haversine sort: `sort_by=distance` orders experiences by distance from user's GPS coordinates.

## City search strategy

1. Geocode the city/town name (Nominatim API)
2. Haversine-filter all experiences within the radius
3. Sort by distance from center (ascending)

## Day-one task: corridor verification (with the data teammate) — do this FIRST

1. Pick demo city (default: Ahmedabad)
2. Place experiences with verified lat/lng in seed data
3. **Freeze the verified list** — this is the contract every other feature depends on
4. Result: `GET /experiences/nearby?city=Ahmedabad&radius_km=200` returns all experiences

### ✅ Done — verified corridor (frozen)

- Math: `backend/app/services/geo_service.py` (shapely + haversine in km projection)
- Seed: `backend/app/experiences_data.py` (12 verified NH-48 villages with real lat/lng)
- Guides: `backend/app/guides_data.py` (6 seed guide profiles with lat/lng)
- Frontend mock: `frontend/src/data/mockData.js` (12 experiences) + `frontend/src/data/mockGuides.js` (6 guides)

### Verified villages (NH-48 corridor)

| Village | Coordinates | Category |
|---|---|---|
| Mota Chiloda | 23.315, 72.640 | Food |
| Chandrala | 23.383, 72.628 | Food |
| Prantij | 23.417, 72.834 | Craft |
| Himmatnagar | 23.589, 72.964 | Heritage |
| Raigadh | 23.893, 73.078 | Food |
| Shamlaji | 24.050, 73.130 | Food |
| Dhamod | 24.234, 73.163 | Craft |
| Amjhhara | 24.343, 73.198 | Craft |
| Kherwara | 24.449, 73.253 | Food |
| Rishabdeo | 24.670, 73.298 | Craft |
| Vav | 24.717, 73.324 | Food |
| Chanbora | 25.009, 73.355 | Craft |

## Dependencies

- **Needs:** `GET /experiences/nearby` and `GET /guides` from the backend (you provide `geo_service`); seed lat/lng data from the data teammate.
- **Gives:** `MapView` / `ExperiencePin` / `GuidePin` components; `geo_service` + `useGeolocation` hook; verified corridor to everyone.

## Build order

1. Day 0 — agree map props contract with the frontend teammate
2. Corridor verification + seed data (with the data teammate)
3. Leaflet `MapView` skeleton (OSM tiles, attribution visible)
4. `geo_service` (shapely + haversine) + unit check on known points
5. `/experiences/nearby` + `/guides` wired with the backend teammate
6. `ExperiencePin` + `GuidePin` + CitySearch page
7. Explore map browse (shared `MapView`)
8. My Location / Find Nearby
9. Offline map tiles (service worker)

## Definition of done

- [x] For the demo corridor: 12 experiences verified with real coordinates
- [x] `GET /experiences/nearby` returns experiences within radius
- [x] `GET /guides` returns available guides for a city
- [x] CitySearch page renders map with circle + pins
- [x] Explore page renders all experiences on map
- [x] Find a Guide button shows matching guides
- [x] My Location sorts by distance from user GPS
- [x] Offline map tiles cached via service worker
- [ ] Tile attribution stays visible (OSM policy)

## Gotchas

- Degrees ≠ km: never ship raw shapely distance as a km threshold
- OSM tile usage: fine for app display; **do not** bundle tiles into the offline pack — the offline pack uses a static rendered map image (see frontend/data briefs)
- Real village coordinates only — the audience can check
- If live OSRM is slow, the seeded polyline saves the demo
