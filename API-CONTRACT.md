# API Contract — Hyperlocal Tourism · Day-0 document

> Frozen on **day 0** by the whole team. The backend teammate implements it; the AI, frontend and maps teammates build against THIS document.
> Anyone who needs a new field or endpoint updates this file FIRST, then tells the team — the contract is the single source of truth.

## Base URLs (dev)

- Frontend: `http://localhost:5173` · Backend: `http://localhost:8000`
- CORS: allow `http://localhost:5173`

## Conventions (decide and tick)

- [ ] Field naming: `snake_case` (matches FastAPI/Pydantic)
- [ ] Auth header: `Authorization: Bearer <token>`
- [ ] Dates: ISO 8601 · Money: INR (integer)
- [ ] Errors: `{"detail": "..."}` (FastAPI default)
- [ ] Demo users: `host@demo` / `traveller@demo` (decide credentials with the team)
- [ ] Pagination: skip for MVP or use `?page=&limit=` → `{items, total}` (decide)

## Endpoints (fill in request/response shapes on day 0)

| Method + Path | Auth | Request | Response | Owner | Consumers | Done |
|---|---|---|---|---|---|---|
| POST `/auth/login` | — | {username, password} | {token, role, user} | BACKEND | FRONTEND | [ ] |
| GET `/experiences` | — | query filters | Experience[] | BACKEND | FRONTEND, MAPS | [ ] |
| GET `/experiences/{id}` | — | — | Experience (detail) | BACKEND | FRONTEND | [ ] |
| POST `/experiences` | host | ExperienceIn | Experience | BACKEND | FRONTEND | [ ] |
| GET `/experiences/route` | — | from, to, radius_km | RouteResult[] | BACKEND + MAPS | FRONTEND, MAPS | [ ] |
| POST `/voice/structure` | host | audio file (or transcript) | ListingJSON | BACKEND + AI | FRONTEND | [ ] |
| POST `/bookings` | traveller | {experience_id, slot_time, group_size} | Booking | BACKEND | FRONTEND | [ ] |
| GET `/bookings/host/{host_id}` | host | — | Booking[] + totals | BACKEND | FRONTEND | [ ] |
| POST `/itinerary/generate` | traveller | {booking_id} | PlanStep[] | BACKEND + AI | FRONTEND | [ ] |
| POST `/reviews` | traveller | {experience_id, rating, comment} | Review | BACKEND | FRONTEND | [ ] |
| GET `/offline-pack/{booking_id}` | traveller | — | PackJSON + map image URL | BACKEND | FRONTEND | [ ] |
| POST `/admin/verify-host` | admin | {user_id, panchayat} | User | BACKEND | FRONTEND | [ ] |
| POST `/admin/hide-listing` | admin | {experience_id} | Experience | BACKEND | FRONTEND | [ ] |

## Voice listing JSON shape (defined by AI, encoded by BACKEND)

```json
{
  "title": "",
  "description": "",
  "category": "food|craft|heritage|nature|other",
  "price": 0,
  "duration_minutes": 0,
  "capacity": 0,
  "availability": {"days": [], "slots": [], "max_per_slot": 8},
  "languages": ["gu", "hi"]
}
```

## Experience object shape (BACKEND to define on day 0)

```
id, host_id, title, description, description_en, category, price, duration_minutes, capacity,
lat, lng, village_name, languages_spoken[], included{}, photos[], original_language,
audio_url, is_active, availability{},
host{ name, story, photo_url, verified_by, is_women_hosted }
```

## Route result item shape (MAPS to define on day 0)

```
experience{...} + distance_km + route_progress (0–1)
```

## Plan step shape (F12 — AI to define)

```
{time, place, lat, lng, note, type: experience|poi|travel}
```

## Gotchas

- Add new fields here **before** coding — the contract is the single source of truth
- Anything added late cascades to three other teammates; keep the contract the first edit, always
