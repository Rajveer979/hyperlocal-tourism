# DATA & CONTENT — Seeds · Realism · Demo Corridor

**Project:** Hyperlocal Tourism · Smart India Hackathon
**Read first:** [`API-CONTRACT.md`](./API-CONTRACT.md) — the shared day-0 contract everyone builds against.

> **Project snapshot:** You make the demo feel real. Judges hear stories — *"Kamlaben has been making thepla in this kitchen for 40 years"* — and believe them because of YOUR data. Nothing on stage is faked by the code; it's made real by you.

---

## Role

All seed content: hosts, experiences, POIs, reviews, photos, sample voice clips — plus the day-one corridor verification that makes the route demo true.

## Features you own (which features your work makes possible)

| Feature | Your part |
|---|---|
| **F1** Voice fallback | sample audio clips (hi/gu) + cached transcripts for the AI teammate's fallback |
| **F5** Photos | seed images from free sources (Unsplash/Pexels, with attribution) + category placeholders |
| **F6** Host story ⭐ | photo + one line of personal history for every host |
| **F12** Itinerary | 10–15 real heritage POIs the AI teammate's itinerary generator uses |
| **F18** Reviews | 3–5 realistic reviews per experience |
| **F8** Route discovery | corridor selection + verification so experiences genuinely sit near the route |

## Deliverables

```
backend/seed/
├── seed_pois.py          10–15 real heritage POIs: name, description, lat, lng, category, district, best_time
├── seed_hosts.py         6–8 hosts: name, phone, language, upi_id, story, photo_url, verified_by (panchayat), is_women_hosted
├── seed_experiences.py   10–15 experiences: title, description + description_en, category, price, duration, capacity,
│                         village_name, lat/lng, languages_spoken, included JSON, photos
└── seed_reviews.py       3–5 reviews per experience — realistic traveller voice
demo/
└── sample-voice-hindi.mp3 · sample-voice-gujarati.mp3   (with the AI / pitch & demo teammates)
```

## Day-one task: corridor verification (with the maps teammate) — do this FIRST

- Pick the corridor (default NH-48 Ahmedabad → Udaipur)
- Choose REAL villages within ~10 km of the actual route
- Verify coordinates with the maps teammate's polyline math
- Freeze the list — then write all content around it

## Content guidelines

- **Specific beats generic:** "Thepla with achar and chai" > "traditional meal"
- **Prices in ₹, realistic:** ₹200–₹1500 depending on category
- **Reviews read like travellers**, not marketing: mention the food, the host, one small friction ("slightly hard to find, host came to the gate")
- **Stories are one line about the person**, not the product (F6)
- **POIs are real heritage sites** in the district — check the names and coordinates

## Photo sourcing

- Free sources (Unsplash / Pexels) with attribution, downloaded into the repo
- Village-category placeholder illustrations for listings without photos
- Host "portrait" photos that look like real people (or category placeholders)

## Dependencies

- **Needs:** final schema from the backend teammate (day 0); corridor + polyline from the maps teammate.
- **Gives:** all seed data to the backend teammate (DB), the AI teammate (itinerary POIs), the frontend teammate (real-looking UI), and the pitch & demo teammate (demo content).

## Build order

1. Day 0 — schema fields confirmed; corridor picked
2. Corridor verification with the maps teammate → frozen list
3. Hosts (names, stories, UPI IDs, panchayat names)
4. Experiences (all fields, coordinates verified)
5. POIs (10–15 heritage sites)
6. Reviews
7. Photos + placeholders
8. Sample voice clips (hi + gu) for fallback

## Definition of done

- [ ] ≥ 10 experiences verified within 10 km of the demo route
- [ ] Every listing is complete: story, price, included list, languages, badge
- [ ] Every POI is real and correctly placed
- [ ] Seeds load cleanly into the backend teammate's DB (idempotent)

## Gotchas

- Real coordinates, not plausible ones — the map is live on stage
- Don't wait for the backend: build the data as JSON files first, load later
- Keep descriptions short (a sentence beats a paragraph)
- Reviews must not sound like ads
