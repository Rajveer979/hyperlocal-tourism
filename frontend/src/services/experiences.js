import { isLive, request, delay } from './api.js'
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

export async function getExperiences(filters = {}) {
  if (!isLive('experiences')) {
    await delay(200)
    let items = [...experiences]
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
    return withHost(getExperience(id))
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
