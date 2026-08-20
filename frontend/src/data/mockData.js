// ============================================================================
// MOCK DATA — emptied: no predefined experiences, hosts, reviews, etc.
// When the backend ships, real data comes from the API.
// ============================================================================

// --- Hosts (F6 story, F7 verification badge) --------------------------------
export const hosts = {}

// --- Experiences (F9/F10) ----------------------------------------------------
export const experiences = []

// --- Reviews (F18) — only for completed bookings -----------------------------
export const reviews = []

// --- POIs (F12 itinerary source) --------------------------------------------
export const pois = []

// --- Route (F8) --------------------------------------------------------------
export const routePolyline = []

// Mock result of GET /experiences/route (empty)
export const routeResult = []

// --- Day pass (F13) -----------------------------------------------------------
export const dayPasses = []

// --- Itinerary (F12) — empty ------------------------------------------------
export const demoItinerary = []

// --- Bookings (F4 host dashboard) ---------------------------------------------
export const bookings = []

export const hostEarnings = { total: 0, this_month: 0, pending: 0 }

// --- Voice fixture (F1) — empty -----------------------------------------------
export const mockVoiceResult = {
  host_name: '',
  village_name: '',
  title: '',
  description: '',
  description_en: '',
  price: 0,
  languages: [],
  original_language: '',
}

// --- Helpers -------------------------------------------------------------------
export function getExperience(id) {
  return experiences.find((e) => e.id === Number(id)) || null
}

export function getHost(id) {
  return hosts[id] || null
}

export function getReviewsFor(experienceId) {
  return reviews.filter((r) => r.experience_id === Number(experienceId))
}
