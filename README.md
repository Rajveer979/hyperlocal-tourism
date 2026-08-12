# Hyperlocal Tourism — Team Briefs

> **Working name** — final name to be decided by the team.

**Smart India Hackathon · Theme: Travel & Tourism · Phase 1: Website (MVP)**

> "Airbnb shows you experiences in a city. We show you the villages you were already driving past — and the host lists by speaking, not typing."

---

## The 3 differentiators

- **Voice-first listing** — the host speaks in their own language; AI turns speech into a structured listing
- **Route-based discovery** — traveller enters *from* and *to*; we show experiences near the route, not near a city
- **Institutional trust** — Panchayats / SHGs vouch for hosts; trust exists on day one

---

## Team files & the features each one covers

| File | Teammate | Features it covers |
|---|---|---|
| [BACKEND.md](BACKEND.md) | Backend (FastAPI · DB · Auth) | F22 auth · F21 search API · F4 dashboard API · F11 booking API · F18 reviews API · F23 admin API · F3 listing API · F1/F12 API wiring · F8 route API · F15 offline-pack API |
| [AI.md](AI.md) | AI (Voice · LLM) | **F1** voice → listing (one-call Gemini) · **F2** translation · **F12** itinerary + demo fallback chain |
| [FRONTEND.md](FRONTEND.md) | Frontend (React · UI) | F1 voice UI · F3 manual form · F4 dashboard UI · F6 story · F7 badge · F10 detail page · F11 booking + UPI · F14 listen · F15 offline pack UI · F16/F17 filters · F18 reviews UI · F19 share · F20 included · F21 search UI · F22 login · F23 admin UI (+ F5, F13 optional) |
| [MAPS-GEO.md](MAPS-GEO.md) | Maps & geo (Leaflet · OSRM) | **F8** route discovery (render + distance math + routing) · F9 map browse · corridor verification |
| [DATA-CONTENT.md](DATA-CONTENT.md) | Data & content (seeds) | F5 seed photos · F6 host stories · F18 seeded reviews · F12 POI data · demo corridor · sample voice clips |
| [PITCH-DEMO.md](PITCH-DEMO.md) | Pitch & demo | deck · demo script · rehearsal · backup video · fallback drill · judge Q&A |
| [API-CONTRACT.md](API-CONTRACT.md) | Shared (everyone) | Day-0 contract — endpoints, shapes, conventions. Read before coding |

---

## Start here

1. **Everyone:** read `API-CONTRACT.md`
2. **Day-0 huddle:** freeze the contract (BACKEND owns writing it; AI provides the voice JSON shape; MAPS defines the route result shape)
3. **First build task:** DATA + MAPS verify the demo corridor (real villages within 10 km of the route)
4. Then everyone builds in parallel — each file has its own build order and "definition of done"

## Must-ship spine (never cut)

F1 · F3 · F4 · F6 · F7 · F8 · F10 · F11 · F12 · F14 · F18 · F22 · F23
