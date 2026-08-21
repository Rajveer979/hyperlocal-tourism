import { isLive, request, delay, MOCK_MODE } from './api.js'
import {
  experiences,
  hosts,
  reviews,
  getExperience,
  getReviewsFor,
  dayPasses,
  pois,
} from '../data/mockData.js'

// Re-import for mock guides
import { MOCK_GUIDES } from '../data/mockGuides.js'

// ── Create ──────────────────────────────────────────────────────────────
const LS_KEY = 'padaav_listings'

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
    const local = {
      id: Date.now(),
      host_id: 0,
      ...data,
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
    const dataUrl = await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.readAsDataURL(file)
    })
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
    let items = [...experiences, ...getLocalListings()]
    if (filters.category && filters.category !== 'all') {
      items = items.filter((e) => e.category === filters.category)
    }
    if (filters.maxPrice) {
      items = items.filter((e) => e.price <= Number(filters.maxPrice))
    }
    if (filters.womenHosted) {
      items = items.filter((e) => e.women_hosted || (e.host && e.host.is_women_hosted))
    }
    if (filters.language && filters.language !== 'all') {
      items = items.filter((e) => (e.languages || []).includes(filters.language))
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
    return items.map(withHost)
  }
  const params = new URLSearchParams(filters).toString()
  return request(`/experiences?${params}`)
}

export async function getExperienceById(id) {
  if (!isLive('experiences')) {
    await delay(150)
    const numId = Number(id)
    const fromSeed = getExperience(numId)
    if (fromSeed) return withHost(fromSeed)
    const local = getLocalListings().find((l) => l.id === numId)
    return local || null
  }
  return request(`/experiences/${id}`)
}

// F8 -- City/town + radius search
export async function getNearbyExperiences(city, radiusKm = 10) {
  if (!isLive('experiences')) {
    await delay(400)
    const cityCoords = {
      ahmedabad: { lat: 23.0225, lng: 72.5714 },
      vadodara: { lat: 22.3072, lng: 73.1812 },
      surat: { lat: 21.1702, lng: 72.8311 },
      halol: { lat: 22.5047, lng: 73.4710 },
      rajkot: { lat: 22.3039, lng: 70.8022 },
      udaipur: { lat: 24.5854, lng: 73.7125 },
      mumbai: { lat: 19.0760, lng: 72.8777 },
      himmatnagar: { lat: 23.5919, lng: 72.9603 },
      shamlaji: { lat: 23.6879, lng: 73.3861 },
    }
    const key = city.toLowerCase().trim()
    const center = cityCoords[key] || { lat: 23.02, lng: 72.57 }
    const R = 6371
    const toRad = (d) => (d * Math.PI) / 180

    // Include seeded + locally-saved listings
    const allItems = [...experiences, ...getLocalListings()]

    const results = allItems
      .filter((e) => e.lat && e.lng)
      .map((e) => {
        const dlat = toRad(e.lat - center.lat)
        const dlng = toRad(e.lng - center.lng)
        const a =
          Math.sin(dlat / 2) ** 2 +
          Math.cos(toRad(center.lat)) * Math.cos(toRad(e.lat)) * Math.sin(dlng / 2) ** 2
        const dist = R * 2 * Math.asin(Math.sqrt(a))
        return { experience: withHost(e), distance_km: Math.round(dist * 100) / 100 }
      })
      .filter((r) => r.distance_km <= radiusKm)
      .sort((a, b) => a.distance_km - b.distance_km)

    // Also include listings without coordinates that match the city/village name
    const cityLower = key
    allItems
      .filter((e) => (!e.lat || !e.lng) && e.village_name?.toLowerCase().includes(cityLower))
      .forEach((e) => {
        results.push({ experience: withHost(e), distance_km: 0 })
      })

    return {
      city,
      center,
      radius_km: radiusKm,
      results,
      total: results.length,
    }
  }
  const params = new URLSearchParams({ city, radius_km: radiusKm })
  return request(`/experiences/nearby?${params}`)
}

// Guides -- find local guides near a city/town
export async function getGuides(city, radiusKm = 25) {
  if (!isLive('experiences')) {
    await delay(300)
    const cityCoords = {
      ahmedabad: { lat: 23.0225, lng: 72.5714 },
      vadodara: { lat: 22.3072, lng: 73.1812 },
      surat: { lat: 21.1702, lng: 72.8311 },
      halol: { lat: 22.5047, lng: 73.4710 },
      rajkot: { lat: 22.3039, lng: 70.8022 },
      udaipur: { lat: 24.5854, lng: 73.7125 },
      mumbai: { lat: 19.0760, lng: 72.8777 },
      himmatnagar: { lat: 23.5919, lng: 72.9603 },
      shamlaji: { lat: 23.6879, lng: 73.3861 },
    }
    const key = city.toLowerCase().trim()
    const center = cityCoords[key] || { lat: 23.02, lng: 72.57 }
    const R = 6371
    const toRad = (d) => (d * Math.PI) / 180

    const results = MOCK_GUIDES
      .map((g) => {
        if (g.city && g.city.toLowerCase() === key) {
          return { ...g, distance_km: 0 }
        }
        const dlat = toRad(g.lat - center.lat)
        const dlng = toRad(g.lng - center.lng)
        const a =
          Math.sin(dlat / 2) ** 2 +
          Math.cos(toRad(center.lat)) * Math.cos(toRad(g.lat)) * Math.sin(dlng / 2) ** 2
        const dist = R * 2 * Math.asin(Math.sqrt(a))
        return { ...g, distance_km: Math.round(dist * 100) / 100 }
      })
      .filter((g) => g.distance_km <= radiusKm && g.available)
      .sort((a, b) => a.distance_km - b.distance_km)

    return {
      city,
      center,
      radius_km: radiusKm,
      guides: results,
      total: results.length,
    }
  }
  const params = new URLSearchParams({ city, radius_km: radiusKm })
  return request(`/guides?${params}`)
}

// F18 -- reviews
export async function getReviews(experienceId) {
  if (!isLive('reviews')) {
    await delay(150)
    return getReviewsFor(experienceId)
  }
  return request(`/experiences/${experienceId}/reviews`)
}

export async function addReview(experienceId, { rating, comment }) {
  if (!isLive('reviews')) {
    await delay(400)
    const review = {
      id: Date.now(),
      experience_id: Number(experienceId),
      traveller_name: 'Aarav',
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
