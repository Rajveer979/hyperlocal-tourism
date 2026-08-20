// ============================================================================
// MOCK DATA — Ahmedabad → Udaipur demo corridor (NH48)
// ----------------------------------------------------------------------------
// The frontend runs in MOCK_MODE until the backend exists.
// Experiences are created via the voice listing flow — nothing is pre-seeded.
// Coordinates are real village/landmark locations on the corridor.
// ============================================================================

// --- Hosts (F6 story, F7 verification badge) --------------------------------
export const hosts = {
  1: {
    id: 1,
    name: 'Kamlaben Patel',
    role: 'host',
    village: 'Himmatnagar',
    upi_id: 'kamlaben@okhdfcbank',
    story: 'Kamlaben has been making thepla in this kitchen for 40 years.',
    verified_by: 'Himmatnagar Gram Panchayat',
    is_women_hosted: true,
    photo_url: null,
    languages_spoken: ['gu', 'hi'],
  },
  2: {
    id: 2,
    name: 'Mahesh Prajapati',
    role: 'host',
    village: 'Idar',
    upi_id: 'maheshpotter@okaxis',
    story: 'Fourth-generation potter. His great-grandfather threw pots for the Idar fort.',
    verified_by: 'Idar Gram Panchayat',
    is_women_hosted: false,
    photo_url: null,
    languages_spoken: ['gu', 'hi'],
  },
  3: {
    id: 3,
    name: 'Shankar Lal Gurjar',
    role: 'host',
    village: 'Gogunda',
    upi_id: 'shankargurjar@ybl',
    story: "Retired schoolteacher who walks visitors through Gogunda's 500-year-old lanes.",
    verified_by: 'Gogunda Gram Panchayat',
    is_women_hosted: false,
    photo_url: null,
    languages_spoken: ['hi'],
  },
  4: {
    id: 4,
    name: 'Meera Chitrakar',
    role: 'host',
    village: 'Nathdwara',
    upi_id: 'meerachitrakar@okicici',
    story: 'Learned pichwai painting from her mother, who learned it from hers.',
    verified_by: 'Nathdwara Nagar Palika',
    is_women_hosted: true,
    photo_url: null,
    languages_spoken: ['hi'],
  },
  5: {
    id: 5,
    name: 'Ramesh Gurjar',
    role: 'host',
    village: 'Eklingji',
    upi_id: 'rameshfarm@okhdfcbank',
    story: 'Grows millet and vegetables on land his family has farmed for five generations.',
    verified_by: 'Eklingji Gram Panchayat',
    is_women_hosted: false,
    photo_url: null,
    languages_spoken: ['hi'],
  },
  6: {
    id: 6,
    name: 'Savitaben Rathwa',
    role: 'host',
    village: 'Khedbrahma',
    upi_id: 'savitabrathwa@ybl',
    story: 'Weaves on a handloom her mother brought as her wedding gift.',
    verified_by: 'Khedbrahma Gram Panchayat',
    is_women_hosted: true,
    photo_url: null,
    languages_spoken: ['gu', 'hi'],
  },
}

// --- Experiences (F9/F10) — empty, created via voice listing -----------------
export const experiences = []

// --- Reviews (F18) — empty, created after bookings --------------------------
export const reviews = []

// --- POIs (F12 itinerary source — seeded, never a live places API) ----------
export const pois = [
  { id: 1, name: 'Eklingji Temple', lat: 24.7337, lng: 73.7124, category: 'heritage', description: 'The 8th-century temple complex of Shiva, carved in grey marble.', best_time: 'Morning' },
  { id: 2, name: 'Haldighati Pass', lat: 24.6857, lng: 73.7063, category: 'heritage', description: 'The mountain pass of the 1576 battle — now a quiet, wind-blown memorial.', best_time: 'Any' },
  { id: 3, name: 'Shri Nathji Temple, Nathdwara', lat: 24.9326, lng: 73.8234, category: 'heritage', description: 'The home of the 7-year-old form of Krishna; the town exists around this shrine.', best_time: 'Dawn darshan' },
  { id: 4, name: 'Idar Fort', lat: 23.8421, lng: 73.0112, category: 'heritage', description: 'A hilltop fort above Idar town with views across the plains.', best_time: 'Sunset' },
  { id: 5, name: 'Shamlaji Temple', lat: 23.806, lng: 73.3759, category: 'heritage', description: 'A riverside Vishnu temple and pilgrimage stop off the highway.', best_time: 'Morning' },
]

// --- Route (F8) --------------------------------------------------------------
export const routePolyline = [
  [23.0225, 72.5714], // Ahmedabad
  [23.21, 72.65],
  [23.35, 72.79],
  [23.599, 72.953], // Himmatnagar
  [23.72, 72.98],
  [23.837, 73.003], // Idar
  [24.03, 73.24], // Khedbrahma
  [24.22, 73.42],
  [24.4, 73.53],
  [24.5854, 73.7125], // Udaipur
]

// Mock result of GET /experiences/route (order = along the route)
export const routeResult = []

// --- Day pass (F13) -----------------------------------------------------------
export const dayPasses = []

// --- Itinerary (F12) — pre-generated plan for the demo booking ---------------
export const demoItinerary = [
  { time: '09:30', place: 'Eklingji Temple', lat: 24.7337, lng: 73.7124, note: 'Morning darshan before the crowds', type: 'poi' },
  { time: '11:00', place: 'Travel to Eklingji farm', lat: 24.732, lng: 73.712, note: '10 min by auto from the temple', type: 'travel' },
  { time: '13:00', place: 'Organic Farm Lunch at Eklingji', lat: 24.732, lng: 73.712, note: 'Your booked experience — thali under the neem tree', type: 'experience' },
  { time: '15:30', place: 'Pichwai Painting at Nathdwara', lat: 24.933, lng: 73.817, note: 'Suggested add-on — 45 min drive north', type: 'experience' },
  { time: '18:00', place: 'Udaipur Lake Pichola view', lat: 24.5764, lng: 73.6826, note: 'End the day watching the sunset over the lake', type: 'poi' },
]

// --- Bookings (F4 host dashboard) ---------------------------------------------
export const bookings = []

export const hostEarnings = { total: 0, this_month: 0, pending: 0 }

// --- Voice fixture (F1) -------------------------------------------------------
// Layer 3 of the fallback chain: hardcoded listing returned when the live
// Gemini call is unavailable.
export const mockVoiceResult = {
  host_name: 'Kamlaben',
  village_name: 'Himmatnagar',
  title: 'Thepla Bananas Seekhen (थेपला बनाना सीखें)',
  description:
    'Kamlaben ke ghar par thepla banana seekhein — chulhe par, asli Gujarati masale ke saath. Khana bhi khayenge, aur recipe ghar le jaayenge.',
  description_en:
    "Learn to make thepla at Kamlaben's home — on the chulha, with real Gujarati spices. You eat what you cook and carry the recipe home.",
  price: 300,
  languages: ['hi', 'en'],
  original_language: 'hi',
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
