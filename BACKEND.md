# BACKEND — FastAPI · PostgreSQL · Auth

**Project:** Hyperlocal Tourism · Smart India Hackathon · Phase 1 website MVP
**Read first:** [`API-CONTRACT.md`](./API-CONTRACT.md) — the shared day-0 contract everyone builds against.

> **Project snapshot:** Travellers enter *from* and *to*; we show village experiences within 10 km of the route. Hosts list by speaking (voice → AI → structured card). Trust comes from Panchayat badges, not reviews. Stack: React + Vite + Tailwind (frontend), FastAPI + PostgreSQL (you), Leaflet/OSRM (maps), Gemini (AI).
> **You are the backbone.** Every other teammate consumes your endpoints. Your day-0 job is to write down the API contract everyone builds against.

---

## Role

Build and run the entire server side: database schema, REST API, auth, file storage. You ship the endpoints the AI, frontend and maps teammates depend on, and the DB the data teammate's seeds load into.

## Features you own (which features your work makes possible)

| Feature | Your part |
|---|---|
| **F1** Voice listing | `/voice/structure` endpoint — the AI teammate's logic inside |
| **F3** Manual listing | `POST /experiences` create endpoint |
| **F4** Host dashboard | `GET /bookings/host/{id}` + totals |
| **F8** Route discovery | `GET /experiences/route` — wired with the maps teammate's distance service |
| **F11** Booking | `POST /bookings` + slot-conflict check |
| **F12** Itinerary | `/itinerary/generate` endpoint — AI teammate's logic inside |
| **F15** Offline pack | `/offline-pack/{id}` bundled JSON + map image URL |
| **F18** Reviews | `POST /reviews` gated to completed bookings |
| **F21** Search & filters | query params on `GET /experiences` |
| **F22** Auth | JWT + two hardcoded demo users (no signup) |
| **F23** Admin | verify-host / badge / hide-listing endpoints |

## Deliverables (files you create)

```
backend/
├── requirements.txt · .env.example · main.py
├── app/
│   ├── config.py · database.py
│   ├── models/        user.py · experience.py · booking.py · review.py · itinerary.py · poi.py
│   ├── schemas/       user.py · experience.py · booking.py · voice.py
│   ├── routes/        auth.py · experiences.py · routes_search.py · voice.py · bookings.py
│   │                  · itinerary.py · daypass.py · reviews.py · admin.py
│   ├── services/      geo_service.py · routing_service.py · stt_service.py
│   │                  · llm_service.py · itinerary_service.py
│   └── core/          security.py (JWT + hashing) · deps.py
└── seed/              seed-runner CLI (the data teammate authors the DATA, you load it)
```

## Endpoints you own (freeze these shapes on day 0)

```
POST /auth/login                  → {token, role, user}
GET  /experiences                 → list (filters: category, price_min/max, distance, language, women_hosted, q)
GET  /experiences/{id}            → detail (includes host + story + badge)
POST /experiences                 → create listing (host)
GET  /experiences/route           → ?from=&to=&radius_km=   (maps teammate's geo service, your endpoint)
POST /voice/structure             → audio/text in, listing JSON out   (AI teammate's logic)
POST /bookings                    → creates booking, validates slot availability
GET  /bookings/host/{host_id}     → dashboard data + totals
POST /itinerary/generate          → booking_id → day plan   (AI teammate's logic)
GET  /daypass/{village}           → bundle (optional feature)
POST /reviews                     → only for completed bookings
GET  /offline-pack/{booking_id}   → bundled JSON + static map image URL
POST /admin/verify-host · /admin/hide-listing
```

## Schema (define on day 0 — v2 amendments included)

- `users`: id, name, phone, role, language_preference, upi_id, is_women_hosted, verified_by (panchayat), story, photo_url
- `experiences`: id, host_id, title, description, description_en, category, price, duration_minutes, capacity, lat, lng, village_name, languages_spoken[], included{}, photos[], original_language, audio_url, is_active, **availability{}** (new), created_at
- `bookings`: id, experience_id, traveller_id, slot_time, group_size, status, amount, created_at — **UNIQUE(experience_id, slot_time)**
- `reviews`: id, experience_id, traveller_id, rating, comment, created_at — **only insertable when booking is `completed`**
- `itineraries`: id, booking_id, generated_plan JSON
- `pois`: id, name, description, lat, lng, category, district, best_time
- Files → `backend/uploads/` static dir (photos, audio)

## Dependencies

- **Needs (day 0):** team to freeze the contract; AI teammate's voice/itinerary JSON shapes; data teammate's final schema fields; a team decision on Postgres vs SQLite (SQLite is fine for dev, swap later).
- **Gives:** every endpoint to the AI, frontend and maps teammates; DB + seed loader to the data teammate.

## Demo role

- F11 booking must appear on the host dashboard **immediately** (demo step 5).
- Enable CORS for the frontend dev origin (e.g. `http://localhost:5173`).
- `/voice/structure` and `/itinerary/generate` must accept cached payloads so the AI teammate's fallback layer works.

## Build order (do this order)

1. Day 0 — write `API-CONTRACT.md` with the team
2. Project skeleton + config + database.py + CORS
3. Models + migrations + seed loader CLI (data teammate starts loading)
4. Auth (JWT + 2 demo users)
5. Experiences CRUD + filters
6. Bookings (slot uniqueness) + host dashboard endpoint
7. Reviews + admin endpoints
8. Route endpoint (wire the maps teammate's geo service)
9. Voice + itinerary endpoints (wire the AI teammate's services)
10. Offline pack endpoint

## Definition of done

- [ ] All endpoints work with real data from the data teammate's seeds
- [ ] `GET /experiences/route` returns correctly filtered results for the demo corridor
- [ ] Booking → host dashboard update is instant
- [ ] CORS works from the frontend dev server

## Gotchas

- Shapely distance works in **degrees** — the maps teammate owns the haversine/projection correction; never ship raw-degree filtering
- Keep seed scripts **idempotent** (re-runnable without duplicates)
- `.env.example` must list every env var (DB URL, JWT secret, Gemini key)
- Don't build signup — two hardcoded demo logins (demo reliability rule)
