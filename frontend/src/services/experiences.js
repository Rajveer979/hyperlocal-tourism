import { isLive, request, delay, MOCK_MODE } from './api.js'
import {
  experiences,
  hosts,
  reviews,
  getExperience,
  getReviewsFor,
  routeResult,
  routePolyline,
  dayPasses,
  pois,
} from '../data/mockData.js'

// ── Create ──────────────────────────────────────────────────────────────
// Host publishes a listing — saves to DB (live) or localStorage (mock).
const LS_KEY = 'padaav_listings' // persisted user-created listings

function getLocalListings() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]')
  } catch {
    return []
  }
}

function saveLocalListing(listing) {
  const all = getLocalListings()
  all.push(listing)
  localStorage.setItem(LS_KEY, JSON.stringify(all))
}

export async function createExperience(data) {
  if (!isLive('experiences')) {
    await delay(300)
    // Convert File objects to data URLs for persistence
    const photos = (data.photos || []).map((p) => p)
    const local = {
      id: Date.now(),
      host_id: 0,
      ...data,
      photos,
      is_active: true,
      created_at: new Date().toISOString(),
    }
    saveLocalListing(local)
    return local
  }
  return request('/experiences', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function uploadPhoto(experienceId, file) {
  if (!isLive('experiences')) {
    await delay(200)
    // In mock mode, convert file to data URL and attach to the listing
    const dataUrl = await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.readAsDataURL(file)
    })
    // Update the listing in localStorage with the photo
    const all = getLocalListings()
    const listing = all.find((l) => l.id === Number(experienceId))
    if (listing) {
      listing.photos = [...(listing.photos || []), dataUrl]
      localStorage.setItem(LS_KEY, JSON.stringify(all))
    }
    return listing || { photos: [dataUrl] }
  }
  const form = new FormData()
  form.append('photo', file)
  const token = localStorage.getItem('app_token')
  const headers = token ? { Authorization: `Bearer ${token}` } : {}
  const res = await fetch(
    `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/experiences/${experienceId}/photos`,
    { method: 'POST', headers, body: form }
  )
  if (!res.ok) throw new Error('Photo upload failed')
  return res.json()
}

// ── Read ───────────────────────────────────────────────────────────────────
export async function getExperiences(filters = {}) {
  if (!isLive('experiences')) {
    await delay(200)
    // Merge seeded + locally-saved listings
    let items = [...experiences, ...getLocalListings()]
    if (filters.category && filters.category !== 'all') {
      items = items.filter((e) => e.category === filters.category)
    }
    if (filters.maxPrice) {
      items = items.filter((e) => e.price <= Number(filters.maxPrice))
    }
    if (filters.womenHosted) {
      items = items.filter((e) => e.host && e.host.is_women_hosted)
    }
    if (filters.language && filters.language !== 'all') {
      items = items.filter((e) => e.languages_spoken.includes(filters.language))
    }
    if (filters.q) {
      const q = filters.q.toLowerCase()
      items = items.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.village_name.toLowerCase().includes(q),
      )
    }
    // Attach host info (F6/F7) — same shape the API returns
    return items.map(withHost)
  }
  const params = new URLSearchParams(filters).toString()
  return request(`/experiences?${params}`)
}

export async function getExperienceById(id) {
  if (!isLive('experiences')) {
    await delay(150)
    const numId = Number(id)
    // Check seeded data first, then locally-saved listings from voice/manual publish
    const fromSeed = getExperience(numId)
    if (fromSeed) return withHost(fromSeed)
    const local = getLocalListings().find((l) => l.id === numId)
    return local || null
  }
  return request(`/experiences/${id}`)
}

// F8 — route-based discovery (backend computes with OSRM + shapely)
export async function getRouteResult(from, to, radiusKm = 10) {
  if (!isLive('route')) {
    await delay(400)
    // MOCK: returns the pre-seeded corridor result. The real call hits
    // GET /experiences/route?from=&to=&radius_km= once the backend ships.
    return { polyline: routePolyline, results: routeResult.map((r) => ({ ...r, experience: withHost(r.experience) })) }
  }
  const params = new URLSearchParams({ from: JSON.stringify(from), to: JSON.stringify(to), radius_km: radiusKm })
  return request(`/experiences/route?${params}`)
}

// F18 — reviews for an experience (gated to completed bookings in production)
export async function getReviews(experienceId) {
  if (!isLive('reviews')) {
    await delay(150)
    return getReviewsFor(experienceId)
  }
  return request(`/experiences/${experienceId}/reviews`)
}

// F18 — post a review. Real API enforces: only travellers with a *completed*
// booking may review. Mock mode appends to the shared mock list so a reload
// (or re-fetch of getReviews) shows the new review immediately.
export async function addReview(experienceId, { rating, comment }) {
  if (!isLive('reviews')) {
    await delay(400)
    const review = {
      id: Date.now(),
      experience_id: Number(experienceId),
      traveller_name: 'Aarav', // demo traveller (F22)
      rating,
      comment,
      created_at: new Date().toISOString(),
    }
    reviews.push(review)
    return review
  }
  return request('/reviews', {
    method: 'POST',
    body: JSON.stringify({ experience_id: Number(experienceId), rating, comment }),
  })
}

export async function getDayPasses() {
  if (!isLive('daypass')) {
    await delay(150)
    return dayPasses.map((d) => ({ ...d, includes: d.includes.map(withHost) }))
  }
  return request('/daypass')
}

export async function getPois() {
  if (!isLive('pois')) {
    await delay(100)
    return pois
  }
  return request('/pois')
}

export function withHost(exp) {
  if (!exp) return exp
  return { ...exp, host: hosts[exp.host_id] || null }
}
