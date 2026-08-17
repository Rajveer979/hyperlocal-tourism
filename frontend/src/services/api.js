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
