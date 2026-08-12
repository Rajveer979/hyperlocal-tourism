# AI — Voice · LLM · Translation · Itinerary

**Project:** Hyperlocal Tourism · Smart India Hackathon
**Read first:** [`API-CONTRACT.md`](./API-CONTRACT.md) — the shared day-0 contract everyone builds against.

> **Project snapshot:** The demo opens with a host *speaking* in Hindi/Gujarati and a listing card *appearing*. That moment is yours. If your layer fails on stage, the fallback you built is the only thing standing between the team and an empty screen.

---

## Role

Own every AI call: audio → structured listing (F1), translation (F2), itinerary generation (F12), and the fallback caches that keep the demo alive.

## Features you own

| Feature | Your part |
|---|---|
| **F1** Voice listing ⭐ | The **one-call pipeline**: audio file → Gemini → structured listing JSON |
| **F2** Auto-translation | Same call, one extra instruction → `description_en` (+ hi) |
| **F12** Itinerary ⭐ | booking_id + seeded POIs → realistic day plan |
| Demo fallbacks | Three-layer fallback chain for F1 and F12 — build and test it |

## The one-call pipeline (do NOT build STT + LLM as two steps)

```
audio file (WebM/MP3) → Gemini API (audio + prompt) → structured listing JSON → pre-filled review form
```

- Same call for demo and production. Web Speech API is **optional live-transcript sugar only** — never required.
- Prompt contract (define the exact JSON shape, then hand it to the backend teammate for the schema):

```
"Extract {title, description, category, price, duration_minutes, capacity, availability, languages} from this spoken description. Return JSON."
```

- Use low temperature + JSON mode so output is deterministic.

## Deliverables

```
backend/app/services/llm_service.py        # Gemini calls: structure + translate + itinerary
backend/app/services/stt_service.py        # thin wrapper (may not be needed — one-call pipeline)
backend/app/services/itinerary_service.py  # POI lookup + prompt + parse
backend/app/routes/voice.py · itinerary.py # (or hand routes to the backend teammate — you own the service layer)
backend/.env.example                       # GEMINI_API_KEY, model name
demo/                                      # pre-recorded sample clips (hi/gu) + cached JSON outputs
```

## Endpoints (agree ownership with the backend teammate on day 0)

- `POST /voice/structure` — input: audio file (or transcript for fallback); output: listing JSON
- `POST /itinerary/generate` — input: `booking_id`; output: `[{time, place, lat, lng, note}]`

## Fallback chain (build all three layers)

| Layer | What | When |
|---|---|---|
| Live | Real audio → Gemini | first try |
| Cache | Pre-run clip + cached structured JSON | network / API failure |
| Fixture | Hardcoded demo card | worst case |

For F12 as well: pre-generate one itinerary for the demo booking, and build a small **rule-based template generator** (no LLM) as layer 3.

## Dependencies

- **Needs:** backend teammate's `/voice` and `/itinerary` endpoints; Gemini API key (Gemini free tier — verify current limits); data teammate's POIs for itineraries; sample audio (record hi/gu clips yourself or coordinate with the pitch & demo teammate).
- **Gives:** the exact voice/itinerary JSON shapes to the backend teammate (schema) and the frontend teammate (form prefill).

## Build order

1. Day 0 — define the listing JSON shape + share it with the backend and frontend teammates
2. Gemini key setup + a 10-line "audio in, JSON out" proof
3. Structuring service + prompt tuning (test with a real Hindi and Gujarati clip)
4. Wire `/voice/structure` with the backend teammate
5. Translation (same call, one extra instruction)
6. Itinerary service + prompt tuning using the data teammate's POIs
7. Fallback caches — pre-run all demo inputs, commit the cached JSON
8. Rule-based itinerary template generator

## Definition of done

- [ ] A Hindi and a Gujarati clip both produce correct structured JSON
- [ ] Itinerary for the demo booking looks human-plausible (fort 10:00 → meal 13:00 → craft 15:00)
- [ ] Full fallback chain rehearsed and working with no network

## Gotchas

- Gemini free-tier limits change — check before the event; keep one retry on timeout
- Keep demo clips < 1–2 minutes
- Never let the live call block the UI — the frontend shows "processing…" then the card
- Prompts must be stable: pure JSON output, no markdown
