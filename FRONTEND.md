# FRONTEND — React · Vite · Tailwind (all pages & UI)

**Project:** Hyperlocal Tourism · Smart India Hackathon
**Read first:** [`API-CONTRACT.md`](./API-CONTRACT.md) — the shared day-0 contract everyone builds against.

> **Project snapshot:** You build everything the traveller and host see and touch. The maps teammate hands you the map components; the backend teammate hands you the API. Your job is to make it look and feel alive.

---

## Role

Build the whole UI: routing, pages, components, forms, booking flow, i18n, and the hooks/services that talk to the backend.

## Features you own (which features your work makes possible)

| Feature | Your part |
|---|---|
| **F1** Voice listing UI | `VoiceListing` page (mic + language picker + "processing…") → jumps to prefilled `ListingReview` form |
| **F3** Manual listing | typed form, always available |
| **F4** Host dashboard | bookings list, earnings total, availability edit, activate/deactivate |
| **F5** Photo upload | optional (cut-first — seed images only if time dies) |
| **F6** Host story | photo + one line on the detail page |
| **F7** Panchayat badge | "Verified by [X] Gram Panchayat" icon |
| **F10** Detail page | story, gallery, included list, price, duration, capacity, reviews, listen, book CTA |
| **F11** Booking flow | date + slot picker, group size, UPI QR (simulated), success state |
| **F13** Day-pass | bundle card on detail page (optional) |
| **F14** Listen ⭐ | speaker button — browser SpeechSynthesis, ~5 lines |
| **F15** Offline pack | download button + local storage logic (text-only pack if time dies) |
| **F16** Language filter | filter by host languages |
| **F17** Women-hosted filter | one boolean |
| **F18** Reviews UI | star rating + comment display |
| **F19** WhatsApp share | `https://wa.me/?text=<url>` button |
| **F20** What's included | checkbox list (Meal ✓ · Materials ✓ · Transport ✗ …) |
| **F21** Search UI | keyword search box |
| **F22** Login screens | two hardcoded demo logins (no signup) |
| **F23** Admin page | verify host, issue badge, hide listing |

## Deliverables (create the whole frontend tree)

```
frontend/src/
├── main.jsx · App.jsx (router) · index.css
├── pages/            Home · RouteResults · Explore · ExperienceDetail · BookingConfirm · Itinerary
│                     · host/{HostHome, VoiceListing, ListingReview, ManualListing, HostDashboard}
│                     · Login · admin/AdminPanel
├── components/
│   ├── layout/       Navbar · Footer · LanguageSwitcher
│   ├── experience/   ExperienceCard · FilterBar · IncludedList · HostStory · VerifiedBadge
│   │                 · ListenButton · ShareButton · ReviewList
│   ├── voice/        VoiceRecorder · LiveTranscript (optional) · LanguagePicker
│   ├── booking/      SlotPicker · UpiPayment · BookingSummary
│   ├── itinerary/    Timeline · OfflinePackButton
│   └── ui/           buttons, inputs, modals
├── hooks/            useVoiceRecorder · useSpeechSynthesis · useGeolocation · useApi
├── services/         api.js (axios) · experiences.js · bookings.js · voice.js · offline.js
└── i18n/             en.json · hi.json (+ gu.json if time)
```

**Map components are the maps teammate's** — you import `MapView`, `RouteLayer`, `ExperiencePin`. Agree the props contract on day 0 (e.g. `MapView {center, markers, routePolyline}`).

## Key screens to nail for the demo

1. **VoiceListing** — one big mic button, language picker, "processing…" state, then the pre-filled ListingReview form (F1)
2. **RouteResults** — route drawn, pins as ordered stops, cards alongside (F8)
3. **ExperienceDetail** — story, badge, listen button, included list, book CTA (F10/F6/F7/F14/F20)
4. **BookingConfirm** — date+slot, group size, UPI QR (simulated), success (F11)
5. **HostDashboard** — booking appears instantly after a traveller books (F4)

## Dependencies

- **Needs:** API contract from the backend teammate (via `services/api.js`); map components + props from the maps teammate; listing JSON shape from the AI teammate (form prefill); seed data from the data teammate so the UI looks real.
- **Gives:** the working UI to the pitch & demo teammate.

## Build order

1. Day 0 — agree map-component props with the maps teammate
2. Vite + Tailwind skeleton, router, layout (Navbar/Footer), design tokens
3. `services/api.js` against the frozen contract (mock data until the backend ships)
4. Home + Login (two demo logins)
5. Manual listing form → ExperienceCard list → Detail page (story, badge, listen, included)
6. Booking flow + UPI simulation + HostDashboard
7. VoiceListing flow (mic → processing → prefilled review)
8. RouteResults + Itinerary pages (import the maps teammate's components)
9. Filters, search, share, reviews, offline pack button, admin page
10. Polish pass — hover states, transitions, empty states

## Definition of done

- [ ] All must-ship screens work end-to-end against the real backend with real seed data
- [ ] Listen button reads a listing aloud (graceful if the device has no Indian voice)
- [ ] UPI step shows a QR and marks "paid" (simulated)
- [ ] UI is in English + Hindi at minimum

## Gotchas

- RouteResults must still render pins + cards if the polyline is missing (demo fallback)
- Don't build signup — two hardcoded logins
- Leaflet CSS import required for the maps teammate's components
- Keep the "processing…" state honest — it's the pause before the magic
