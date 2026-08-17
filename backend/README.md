# Backend — Voice feature (F1)

One endpoint: **`POST /voice/structure`**

| Input | Output |
|---|---|
| `audio` (WAV 16 kHz mono) + `language` | Listing JSON (the shape frozen in `../API-CONTRACT.md`) |
| `transcript` + `language` (no audio) | Same JSON — skips speech-to-text entirely |

## Engine fallback (automatic, invisible to the frontend)

```
Gemini (one call: audio → JSON)  →  Groq (Whisper → Llama)  →  fixture
```

Every engine returns the **identical JSON shape**, so the frontend can never
tell which one answered. Controlled by `VOICE_ENGINE` in `.env`:
`auto` (try Gemini → Groq → fixture) · `gemini` · `groq` · `fixture`.

- **No keys needed:** with `VOICE_ENGINE=fixture` (or no keys set), it returns
  a hardcoded Hindi sample listing — the demo never breaks.
- **Gemini key:** https://aistudio.google.com/apikey
- **Groq key:** https://console.groq.com/keys (free tier: Whisper + Llama)

## Run it

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows Git Bash: source .venv/Scripts/activate
pip install -r requirements.txt
cp .env.example .env             # add keys (optional — fixture works without)
uvicorn main:app --reload        # → http://localhost:8000
```

Docs auto-generate at http://localhost:8000/docs

## Quick test (no audio file handy — use a transcript)

```bash
curl -X POST http://localhost:8000/voice/structure \
  -F "language=hi" \
  -F "transcript=मैं चूल्हे पर थेपला बनाना सिखाती हूँ, 300 रुपये, डेढ़ घंटा, छह लोग"
```

## Gotchas

- The frontend transcodes the browser recording to **WAV 16 kHz mono** before
  sending (`frontend/src/utils/audio.js`) — keep the endpoint expecting WAV.
- Audio is sent inline to Gemini (under 20 MB) — no file-upload service needed.
- `CORS_ORIGINS` must include the frontend origin (`http://localhost:5173`).
