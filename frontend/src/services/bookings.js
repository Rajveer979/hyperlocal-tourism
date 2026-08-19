import { isLive, request, delay } from './api.js'
import { bookings, hostEarnings, demoItinerary } from '../data/mockData.js'

// F11 — create a booking
export async function createBooking({ experience_id, slot_time, group_size, traveller_name }) {
  if (!isLive('bookings')) {
    await delay(500) // simulates the UPI "confirm" round-trip
    const booking = {
      id: bookings.length + 1,
      experience_id,
      traveller_name: traveller_name || 'You',
      slot_time,
      group_size,
      status: 'confirmed',
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
    // Demo: all seeded bookings belong to the demo host (Kamlaben, host id 1)
    return bookings
      .filter((b) => b.experience_id === 1 || hostId === 1)
      .sort((a, b) => new Date(a.slot_time) - new Date(b.slot_time))
  }
  return request(`/bookings/host/${hostId}`)
}

export async function getHostEarnings(hostId) {
  if (!isLive('bookings')) {
    await delay(150)
    return hostEarnings
  }
  return request(`/bookings/host/${hostId}/earnings`)
}

// F12 — itinerary generation for a booking
export async function getItinerary(bookingId) {
  if (!isLive('itinerary')) {
    await delay(600) // LLM "thinking" time for the demo
    return demoItinerary
  }
  return request('/itinerary/generate', {
    method: 'POST',
    body: JSON.stringify({ booking_id: bookingId }),
  })
}
