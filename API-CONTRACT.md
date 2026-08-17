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

`POST /voice/structure` response is an envelope — the listing plus follow-up info:

```json
{
  "listing": { ...ListingJSON below... },
  "missing": ["price"],
  "question": "आप प्रति व्यक्ति कितने रुपये लेते हैं?"
}
```

- `missing`: critical numbers the host did not mention (`price`, `duration_minutes`, `capacity`)
- `question`: one spoken follow-up in the host's language (`null` when nothing is missing)
- Frontend: when `missing` is non-empty, play `question` aloud and record a short reply; send it back
  with `previous` = the draft `listing` (form field, JSON string). The engine merges the reply into
  the draft and returns the same envelope. Cap at 2 rounds, then let the host finish in the form.
- Numeric fields the host did not mention come back as `null` from the engines — never guessed.

```json
{
  "host_name": "",
  "village_name": "",
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

## Voice engine fallback (decided — backend implements this)

`POST /voice/structure` accepts **audio OR transcript** + `language`, and returns
the ListingJSON above. The backend tries engines automatically, invisible to the
frontend; every engine returns the identical shape.

| Layer | Engine | Call pattern | Model(s) | Key needed |
|---|---|---|---|---|
| 1 | **Gemini** | one call (audio → JSON) | `gemini-3.5-flash` (⚠️ NOT `gemini-3.6-flash` — that model 500s on audio; 3.5/2.5 accept audio fine) | `GEMINI_API_KEY` |
| 2 | **Groq** | two calls (transcribe → structure) | `whisper-large-v3-turbo` + `openai/gpt-oss-120b` (`llama-3.3-70b-versatile` was retired from Groq) | `GROQ_API_KEY` |
| 3 | **Fixture** | hardcoded Hindi sample | — | none (demo never breaks) |

Config: `VOICE_ENGINE=auto|gemini|groq|fixture` in `backend/.env`.
`auto` = Gemini → Groq → fixture. Audio is sent inline (WAV, under 20 MB).
Frontend toggles with `VITE_MOCK_MODE=false` in `frontend/.env`.

## Gotchas

- Add new fields here **before** coding — the contract is the single source of truth
- Anything added late cascades to three other teammates; keep the contract the first edit, always
