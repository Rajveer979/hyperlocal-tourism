import { isLive, request, delay, API_BASE } from './api.js'
import { bookings, hostEarnings, demoItinerary } from '../data/mockData.js'

// F11 — create a booking
export async function createBooking({ experience_id, slot_time, group_size, traveller_name }) {
  if (!isLive('bookings')) {
    await delay(500) // simulates the UPI "confirm" round-trip
    const booking = {
      id: Date.now(),
      experience_id,
      traveller_name: traveller_name || 'You',
      slot_time,
      group_size,
      status: 'confirmed',
      amount: 0,
      created_at: new Date().toISOString(),
    }
    return booking
  }
  return request('/bookings', {
    method: 'POST',
    body: JSON.stringify({ experience_id, slot_time, group_size }),
  })
}

// F4 — host dashboard data
export async function getHostBookings(hostId) {
  if (!isLive('bookings')) {
    await delay(200)
    // Normalize: new mock data uses `date`, `guests`, `user_name`
    // Components expect `slot_time`, `group_size`, `traveller_name`, `amount`
    return bookings
      .map((b) => ({
        ...b,
        slot_time: b.slot_time || b.date || '',
        group_size: b.group_size || b.guests || 1,
        traveller_name: b.traveller_name || b.user_name || 'Guest',
        amount: b.amount || 0,
      }))
      .sort((a, b) => new Date(a.slot_time) - new Date(b.slot_time))
  }
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
    // Mock fallback: return a static 3-stop plan
    return [
      { time: '09:30', place: 'Adalaj Stepwell', lat: 23.1638, lng: 72.6364, note: 'Start your day at this heritage stepwell', type: 'poi' },
      { time: '12:00', place: experienceData.title || 'Your booked experience', lat: experienceData.lat || 23.0, lng: experienceData.lng || 72.5, note: experienceData.village_name ? `In ${experienceData.village_name}` : 'Your booked experience', type: 'experience' },
      { time: '15:00', place: 'Sabarmati Ashram', lat: 23.0627, lng: 72.5807, note: 'End with a visit to Gandhiji\'s ashram', type: 'poi' },
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
  formData.append('radius_km', 20.0)

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
