// ============================================================================
// API layer — runs in MOCK_MODE until the FastAPI backend exists.
// ----------------------------------------------------------------------------
// Mock mode is ON by default so the app runs standalone with zero backend.
// Point it at the real voice backend:
//   frontend/.env  →  VITE_MOCK_MODE=false  (+ VITE_API_URL=http://localhost:8000)
// The contract is frozen in ../API-CONTRACT.md — request/response shapes must
// not change when we switch.
// ============================================================================

export const MOCK_MODE = import.meta.env.VITE_MOCK_MODE !== 'false'
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Backend features implemented TODAY (per API-CONTRACT.md). Everything else
// stays on mock data so the demo keeps working while the team ships the rest.
// Flip a feature to true only when its endpoints exist in the backend.
export const LIVE_FEATURES = {
  auth: true, // signup / login / forgot / reset / me
  reviews: true, // GET + POST reviews (completed-booking gate)
  admin: true, // GET /admin/users
  experiences: true, // POST create + GET list + GET detail + photo upload
  itinerary: true, // POST /itinerary/generate — AI day plan
  // Not built yet: bookings, route, offline, daypass
}

// True when the app is live AND the backend actually serves this feature.
export function isLive(feature) {
  return !MOCK_MODE && !!LIVE_FEATURES[feature]
}

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Thin wrapper over fetch — what every service uses once MOCK_MODE is off.
export async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  const token = localStorage.getItem('app_token')
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || `Request failed: ${res.status}`)
  }
  return res.json()
}
