import { MOCK_MODE, API_BASE, request, delay } from './api.js'
import { mockVoiceResult } from '../data/mockData.js'

// ============================================================================
// F1 — THE ONE-CALL VOICE PIPELINE
// ----------------------------------------------------------------------------
// audio (WAV 16kHz mono) + language  →  backend  →  structured listing JSON
// The frontend transcode (utils/audio.js) converts the MediaRecorder WebM
// blob to WAV before this call. The backend tries Gemini → Groq → fixture
// automatically, so the frontend never sees which engine answered.
//
// Fallback chain (frontend side): live → cached → fixture.
//   Layer 1 (live):    POST /voice/structure  (real engines, backend-side)
//   Layer 2 (cached):  pre-run result keyed by language (added when sample
//                      clips are recorded — DATA-CONTENT teammate)
//   Layer 3 (fixture): mockVoiceResult below (works with zero network)
//
// Live toggle: the voice backend is the only live backend so far, so it can
// go live on its own while the rest of the app stays on mock data.
// Set VITE_VOICE_LIVE=true in frontend/.env (see .env.example). Once the
// whole app is on the real backend (VITE_MOCK_MODE=false), voice is live
// automatically.
// ============================================================================

const VOICE_LIVE = MOCK_MODE ? import.meta.env.VITE_VOICE_LIVE === 'true' : true

export async function structureListing(audioBlob, language, opts = {}) {
  if (!VOICE_LIVE || opts.forceFixture) {
    await delay(1800) // "processing…" beat for the demo
    return {
      ...mockVoiceResult,
      languages: [language, ...mockVoiceResult.languages.filter((l) => l !== language)],
      original_language: language,
    }
  }

  // ---- LIVE PATH: multipart upload (no Content-Type — fetch sets the boundary) ----
  const form = new FormData()
  if (opts.transcript) {
    form.append('transcript', opts.transcript)
  } else {
    form.append('audio', audioBlob, 'recording.wav')
  }
  form.append('language', language)

  const headers = {}
  const token = localStorage.getItem('app_token')
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_BASE}/voice/structure`, { method: 'POST', headers, body: form })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || `Voice structuring failed: ${res.status}`)
  }
  return res.json()
}

// F2 — auto-translation (same call, one extra instruction). Backend returns
// description_en alongside the listing; kept as a service so the review form
// can re-translate after edits.
export async function translateListing(listing, targetLang = 'en') {
  if (MOCK_MODE) {
    await delay(400)
    return { ...listing, description_en: listing.description_en || listing.description }
  }
  return request('/voice/translate', {
    method: 'POST',
    body: JSON.stringify({ listing, target_lang: targetLang }),
  })
}
