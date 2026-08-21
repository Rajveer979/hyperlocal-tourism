import { isLive, request, delay, API_BASE } from './api.js'
import { hostEarnings, demoItinerary } from '../data/mockData.js'
import { getLocalListings, getExperiencesByHost } from './experiences.js'

// F11 — create a booking
export async function createBooking({ experience_id, slot_time, group_size, traveller_name }) {
  if (!isLive('bookings')) {
    await delay(500) // simulates the UPI "confirm" round-trip
    return {
      id: Date.now(),
      experience_id,
      traveller_name: traveller_name || 'You',
      slot_time,
      group_size,
      status: 'confirmed',
      amount: 0,
      created_at: new Date().toISOString(),
    }
  }
  // Live mode: save to database via API
  return request('/bookings', {
    method: 'POST',
    body: JSON.stringify({ experience_id, slot_time, group_size, traveller_name }),
  })
}

// Helper: read bookings from localStorage (where BookingConfirm saves them)
function getLocalBookings() {
  try {
    return JSON.parse(localStorage.getItem('padaav_bookings') || '[]')
  } catch {
    return []
  }
}

// F4 — host dashboard data
export async function getHostBookings(hostId) {
  if (!isLive('bookings')) {
    await delay(200)
    // Mock mode: read from localStorage, filter by host's experiences
    let hostExpIds = new Set()
    const localListings = getLocalListings().filter((e) => e.host_id === hostId)
    localListings.forEach((e) => hostExpIds.add(e.id))
    if (hostExpIds.size === 0) {
      try {
        const apiListings = await getExperiencesByHost(hostId)
        apiListings.forEach((e) => hostExpIds.add(e.id))
      } catch { /* ignore */ }
    }
    return getLocalBookings()
      .filter((b) => hostExpIds.has(b.experience_id))
      .map((b) => ({ ...b, slot_time: b.slot_time || '', group_size: b.group_size || 1, traveller_name: b.traveller_name || 'Guest', amount: b.amount || 0 }))
      .sort((a, b) => new Date(a.slot_time) - new Date(b.slot_time))
  }
  // Live mode: read from database via API
  return request(`/bookings/host/${hostId}`)
}

export async function getHostEarnings(hostId) {
  if (!isLive('bookings')) {
    await delay(150)
    // New mock data is an array: [{host_id, month, amount, bookings}]
    // Components expect: {total, this_month, pending}
    if (Array.isArray(hostEarnings)) {
      const total = hostEarnings.reduce((sum, e) => sum + (e.amount || 0), 0)
      return { total, this_month: total, pending: 0 }
    }
    return hostEarnings || { total: 0, this_month: 0, pending: 0 }
  }
  return request(`/bookings/host/${hostId}/earnings`)
}

// F12 — itinerary generation for a booking
// experienceData: { id, title, village_name, description, lat, lng, slot_time }
export async function getItinerary(bookingId, experienceData = {}) {
  if (!isLive('itinerary')) {
    await delay(600) // LLM "thinking" time for the demo
    // Location-aware mock fallback: use region-specific POIs
    const REGION_POIS = {
      jaipur: [
        { time: '09:00', place: 'Amber Fort', lat: 26.9855, lng: 75.8513, note: 'Start your day at this hilltop palace-fortress with mirrorwork and panoramic views', type: 'poi' },
        { time: '15:00', place: 'Hawa Mahal', lat: 26.9239, lng: 75.8267, note: 'End with the iconic Palace of Winds — 953 latticed windows', type: 'poi' },
      ],
      delhi: [
        { time: '09:00', place: 'Red Fort', lat: 28.6562, lng: 77.2410, note: 'Start your day at the Mughal emperor\'s massive red sandstone palace', type: 'poi' },
        { time: '15:00', place: 'Humayun\'s Tomb', lat: 28.5933, lng: 77.2507, note: 'End with the garden tomb that inspired the Taj Mahal', type: 'poi' },
      ],
      mumbai: [
        { time: '09:00', place: 'Gateway of India', lat: 18.9220, lng: 72.8347, note: 'Start your day at this iconic 1924 arch overlooking the Arabian Sea', type: 'poi' },
        { time: '15:00', place: 'Elephanta Caves', lat: 18.9634, lng: 72.9315, note: 'End with UNESCO island caves and massive rock-cut Shiva sculptures', type: 'poi' },
      ],
      varanasi: [
        { time: '09:00', place: 'Sarnath', lat: 25.3714, lng: 83.0226, note: 'Start your day where Buddha gave his first sermon', type: 'poi' },
        { time: '15:00', place: 'Dashashwamedh Ghat', lat: 25.3046, lng: 83.0106, note: 'End at the main ghat for the spectacular Ganga Aarti ceremony', type: 'poi' },
      ],
      ahmedabad: [
        { time: '09:00', place: 'Adalaj Stepwell', lat: 23.1638, lng: 72.6364, note: 'Start your day at this ornate 15th-century stepwell', type: 'poi' },
        { time: '15:00', place: 'Sabarmati Ashram', lat: 23.0627, lng: 72.5807, note: 'End with a visit to Gandhiji\'s riverside ashram', type: 'poi' },
      ],
      jodhpur: [
        { time: '09:00', place: 'Mehrangarh Fort', lat: 26.2985, lng: 73.0184, note: 'Start your day at one of India\'s largest forts towering over the Blue City', type: 'poi' },
        { time: '15:00', place: 'Jaswant Thada', lat: 26.2990, lng: 73.0146, note: 'End at the white marble cenotaph — the Taj Mahal of Marwar', type: 'poi' },
      ],
      hampi: [
        { time: '09:00', place: 'Virupaksha Temple', lat: 15.3350, lng: 76.4600, note: 'Start at the active 7th-century temple with a 160-foot tower', type: 'poi' },
        { time: '15:00', place: 'Vijaya Vittala Temple', lat: 15.3483, lng: 76.4730, note: 'End at the famous stone chariot and musical pillars', type: 'poi' },
      ],
      udaipur: [
        { time: '09:00', place: 'City Palace Udaipur', lat: 24.5764, lng: 73.6913, note: 'Start your day at this lakeside palace complex overlooking Lake Pichola', type: 'poi' },
        { time: '15:00', place: 'Fateh Sagar Lake', lat: 24.5975, lng: 73.6764, note: 'End with a sunset boat ride on this scenic lake', type: 'poi' },
      ],
      jaisalmer: [
        { time: '09:00', place: 'Jaisalmer Fort', lat: 26.9124, lng: 70.9126, note: 'Start inside this living sandstone fort with shops and temples', type: 'poi' },
        { time: '15:00', place: 'Sam Sand Dunes', lat: 26.7969, lng: 70.4935, note: 'End with a camel safari across the rolling Thar Desert dunes', type: 'poi' },
      ],
    }
    const village = (experienceData.village_name || '').toLowerCase()
    const slotHour = 12
    let pois = []
    for (const [key, regionPois] of Object.entries(REGION_POIS)) {
      if (village.includes(key)) { pois = regionPois; break }
    }
    if (!pois.length) {
      // Generic fallback for unknown locations
      pois = [
        { time: `${Math.max(9, slotHour - 2)}:00`, place: 'Local heritage site', lat: experienceData.lat || 23.0, lng: experienceData.lng || 72.5, note: 'Start your day exploring the local area', type: 'poi' },
        { time: `${Math.min(16, slotHour + 2)}:00`, place: 'Local nature spot', lat: experienceData.lat || 23.0, lng: experienceData.lng || 72.5, note: 'End with a peaceful walk in nature', type: 'poi' },
      ]
    }
    const before = pois.find(p => p.type === 'poi' && parseInt(p.time) < slotHour) || pois[0]
    const after = pois.find(p => p.type === 'poi' && parseInt(p.time) > slotHour) || pois[pois.length - 1]
    return [
      { ...before, time: `${Math.max(9, slotHour - 2)}:00` },
      { time: `${slotHour}:00`, place: experienceData.title || 'Your booked experience', lat: experienceData.lat || 23.0, lng: experienceData.lng || 72.5, note: experienceData.village_name ? `In ${experienceData.village_name}` : 'Your booked experience', type: 'experience' },
      { ...after, time: `${Math.min(16, slotHour + 2)}:00` },
    ]
  }
  // Live mode: POST to the backend with experience details
  const formData = new FormData()
  formData.append('booking_id', bookingId)
  formData.append('experience_id', experienceData.id || 0)
  formData.append('title', experienceData.title || '')
  formData.append('village', experienceData.village_name || '')
  formData.append('slot_time', experienceData.slot_time || '')
  formData.append('description', experienceData.description || '')
  formData.append('lat', experienceData.lat || 23.0)
  formData.append('lng', experienceData.lng || 72.5)
  formData.append('radius_km', 50.0)

  const token = localStorage.getItem('app_token')
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_BASE}/itinerary/generate`, {
    method: 'POST',
    headers,
    body: formData,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || `Itinerary request failed: ${res.status}`)
  }
  const data = await res.json()
  return data.steps || []
}
