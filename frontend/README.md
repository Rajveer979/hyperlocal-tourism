# Hyperlocal Tourism — Frontend

React + Vite + Tailwind CSS. Runs fully standalone in **mock mode** — no backend
needed. Flip one flag to talk to FastAPI when it ships.

## Run it

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
npm run build      # production build check
```

## Mock mode vs real API

Everything in `src/services/` runs against in-memory mock data
(`src/data/mockData.js`) while `MOCK_MODE = true` in `src/services/api.js`.

- **Frontend teammates:** build pages freely — the service functions keep the
  exact signatures the real API will use (frozen in `../API-CONTRACT.md`).
- **Backend teammate:** when the endpoints exist, set `MOCK_MODE = false` and
  the services switch to `fetch` calls automatically (see `api.js`).
- The **voice pipeline** (`src/services/voice.js`) already documents its
  fallback chain: live → cached → fixture.

## Feature → file map

| Feature | Where |
|---|---|
| ⭐ F1 Voice listing | `pages/host/VoiceListing.jsx` → `components/voice/` → `hooks/useVoiceRecorder.js` → `utils/audio.js` (WebM→WAV) → `services/voice.js` |
| F1 Review form | `pages/host/ListingReview.jsx` + `components/host/ListingForm.jsx` |
| F2 Auto-translation | `services/voice.js` → `translateListing()` (same call as F1) |
| F3 Manual listing | `pages/host/ManualListing.jsx` (same form as review) |
| F4 Host dashboard | `pages/host/HostDashboard.jsx` (`services/bookings.js`) |
| F5 Photos | category placeholder art on `ExperienceCard` / detail page |
| F6 Host story | `components/experience/HostStory.jsx` |
| F7 Panchayat badge | `components/experience/VerifiedBadge.jsx` |
| ⭐ F8 Route discovery | `pages/RouteResults.jsx` + `components/map/` + mock polyline in `mockData.js` |
| F9 Map browse | `pages/Explore.jsx` + `components/map/MapView.jsx` |
| F10 Detail page | `pages/ExperienceDetail.jsx` |
| F11 Booking + UPI | `pages/BookingConfirm.jsx` + `components/booking/` (UPI simulated) |
| ⭐ F12 Itinerary | `pages/Itinerary.jsx` + `components/itinerary/Timeline.jsx` (pre-generated plan) |
| F13 Day pass | `pages/DayPass.jsx` |
| F14 Listen | `components/experience/ListenButton.jsx` + `hooks/useSpeechSynthesis.js` |
| F15 Offline pack | `components/itinerary/OfflinePackButton.jsx` + `services/offline.js` |
| F16/F17/F21 Filters | `components/experience/FilterBar.jsx` |
| F18 Reviews | `components/experience/ReviewList.jsx` |
| F19 Share | `components/experience/ShareButton.jsx` |
| F20 Included list | `components/experience/IncludedList.jsx` |
| F22 Auth | `pages/Login.jsx` + `context/AppContext.jsx` (hardcoded demo users) |
| F23 Admin | `pages/admin/AdminPanel.jsx` |

## Folder conventions

- `pages/` — one file per route (see `App.jsx` for the route table)
- `components/` — grouped by domain (`experience/`, `voice/`, `map/`, `booking/`,
  `itinerary/`, `layout/`, `ui/`, `host/`)
- `hooks/` — reusable state (recorder, speech synthesis, api wrapper)
- `services/` — the API boundary; mock now, real later
- `data/mockData.js` — demo corridor (Ahmedabad → Udaipur): hosts, listings,
  reviews, POIs, route, day-pass, itinerary, voice fixture
- `utils/` — pure helpers (format, geo, audio transcode, constants)
- `i18n/` — en/hi/gu UI strings (shared chrome only; full translation later)

## Gotchas

- **Leaflet:** map pins use custom `divIcon`s — the default marker icons break
  in bundlers. Don't switch back to defaults.
- **Voice:** Chrome records WebM; Gemini wants WAV — `utils/audio.js` transcodes.
  Keep the transcode on the path; don't gamble on WebM support.
- **UI language ≠ recording language.** `LanguageSwitcher` (top bar) changes the
  UI; `LanguagePicker` (voice flow) sets what the host speaks in.
