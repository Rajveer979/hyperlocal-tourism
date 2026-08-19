// ============================================================================
// MOCK DATA — Ahmedabad → Udaipur demo corridor (NH48)
// ----------------------------------------------------------------------------
// The frontend runs in MOCK_MODE until the backend exists. This file is the
// frontend twin of the DATA-CONTENT teammate's seeds: same villages, same
// spirit. When the backend ships, these move behind the API and this file
// shrinks to demo fixtures (voice result, itinerary) only.
//
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
    story: 'Retired schoolteacher who walks visitors through Gogunda’s 500-year-old lanes.',
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

// --- Experiences (F9/F10) ----------------------------------------------------
export const experiences = [
  {
    id: 1,
    host_id: 1,
    title: "Kamlaben's Thepla Cooking Class",
    description:
      "Learn to roll thepla — the Gujarati flatbread — on a chulha in Kamlaben's home kitchen. She'll teach you the dough, the masala, and the trick to keeping them soft for a road trip. You eat what you make, with chhaas and homemade gud.",
    description_en:
      "Learn to roll thepla — the Gujarati flatbread — on a chulha in Kamlaben's home kitchen. You eat what you make, with chhaas and homemade gud.",
    category: 'food',
    price: 300,
    duration_minutes: 90,
    capacity: 6,
    lat: 23.599, lng: 72.953,
    village_name: 'Himmatnagar',
    languages_spoken: ['gu', 'hi'],
    included: { meal: true, materials: true, transport: false, toilet: true, wheelchair: false },
    photos: [],
    original_language: 'gu',
    is_active: true,
    availability: { days: ['Mon', 'Wed', 'Fri', 'Sat'], slots: ['10:00', '13:00'], max_per_slot: 6 },
  },
  {
    id: 2,
    host_id: 2,
    title: 'Idar Pottery Wheel Workshop',
    description:
      'Sit at Mahesh’s wheel and throw your own pot, guided hand-over-hand. Idar has made terracotta for centuries; you leave with a fired piece stamped with the village mark.',
    description_en:
      'Throw your own pot on a real wheel in Idar, a town famous for terracotta for centuries.',
    category: 'craft',
    price: 500,
    duration_minutes: 120,
    capacity: 8,
    lat: 23.837, lng: 73.003,
    village_name: 'Idar',
    languages_spoken: ['gu', 'hi'],
    included: { meal: false, materials: true, transport: false, toilet: true, wheelchair: false },
    photos: [],
    original_language: 'gu',
    is_active: true,
    availability: { days: ['Tue', 'Thu', 'Sat', 'Sun'], slots: ['09:00', '11:00', '16:00'], max_per_slot: 8 },
  },
  {
    id: 3,
    host_id: 3,
    title: 'Gogunda Heritage Village Walk',
    description:
      'A slow two-hour walk through Gogunda’s havelis, stepwells and temple lanes with Shankar Lal, who knows every family that ever lived behind these facades. Ends with tea at the village choupal.',
    description_en:
      'Walk Gogunda’s havelis, stepwells and temple lanes with a retired teacher who knows every family behind these facades.',
    category: 'heritage',
    price: 200,
    duration_minutes: 120,
    capacity: 10,
    lat: 24.766, lng: 73.53,
    village_name: 'Gogunda',
    languages_spoken: ['hi'],
    included: { meal: false, materials: false, transport: false, toilet: true, wheelchair: false },
    photos: [],
    original_language: 'hi',
    is_active: true,
    availability: { days: ['Mon', 'Tue', 'Thu', 'Sat'], slots: ['08:00', '16:30'], max_per_slot: 10 },
  },
  {
    id: 4,
    host_id: 4,
    title: 'Pichwai Painting at Nathdwara',
    description:
      'A two-hour introduction to pichwai — the temple cloth paintings of Nathdwara. Meera will walk you through the lotus-and-cow motifs, then you paint your own small piece to carry home.',
    description_en:
      'Introduction to pichwai, the temple cloth paintings of Nathdwara — motifs, history, and your own piece to take home.',
    category: 'craft',
    price: 600,
    duration_minutes: 120,
    capacity: 6,
    lat: 24.933, lng: 73.817,
    village_name: 'Nathdwara',
    languages_spoken: ['hi'],
    included: { meal: false, materials: true, transport: false, toilet: true, wheelchair: false },
    photos: [],
    original_language: 'hi',
    is_active: true,
    availability: { days: ['Wed', 'Thu', 'Fri', 'Sun'], slots: ['10:00', '15:00'], max_per_slot: 6 },
  },
  {
    id: 5,
    host_id: 5,
    title: 'Organic Farm Lunch at Eklingji',
    description:
      'A millet-and-vegetable thali cooked from Ramesh’s own fields, eaten in the shade of the neem tree. He’ll show you the crops, the compost pit, and the well that has watered the farm for generations.',
    description_en:
      'A millet-and-vegetable thali from Ramesh’s own fields, eaten under the neem tree on the farm.',
    category: 'food',
    price: 350,
    duration_minutes: 75,
    capacity: 8,
    lat: 24.732, lng: 73.712,
    village_name: 'Eklingji',
    languages_spoken: ['hi'],
    included: { meal: true, materials: false, transport: false, toilet: true, wheelchair: false },
    photos: [],
    original_language: 'hi',
    is_active: true,
    availability: { days: ['Mon', 'Wed', 'Fri', 'Sun'], slots: ['13:00'], max_per_slot: 8 },
  },
  {
    id: 6,
    host_id: 6,
    title: 'Khedbrahma Tribal Weaving',
    description:
      'Watch Savitaben work her handloom and try a few passes yourself. The Rathwa patterns tell stories — each motif is a memory of the forest. Yarns and a small woven coaster are included.',
    description_en:
      'Watch Savitaben work her handloom and try a few passes yourself. Rathwa patterns tell stories of the forest.',
    category: 'craft',
    price: 400,
    duration_minutes: 150,
    capacity: 5,
    lat: 24.03, lng: 73.24,
    village_name: 'Khedbrahma',
    languages_spoken: ['gu', 'hi'],
    included: { meal: false, materials: true, transport: false, toilet: true, wheelchair: false },
    photos: [],
    original_language: 'gu',
    is_active: true,
    availability: { days: ['Tue', 'Thu', 'Sat'], slots: ['09:00', '14:00'], max_per_slot: 5 },
  },
]

// --- Reviews (F18) — only for completed bookings -----------------------------
export const reviews = [
  { id: 1, experience_id: 1, traveller_name: 'Sneha M.', rating: 5, comment: 'Best thepla I have ever eaten. Kamlaben teaches like a grandmother, patient and warm.', created_at: '2026-07-12T10:00:00Z' },
  { id: 2, experience_id: 1, traveller_name: 'Rohan D.', rating: 5, comment: 'Came for the food, stayed for the conversation. The chhaas is worth the detour alone.', created_at: '2026-06-28T09:30:00Z' },
  { id: 3, experience_id: 2, traveller_name: 'Ananya K.', rating: 4, comment: 'Throwing the pot was harder than it looks but Mahesh is a brilliant teacher. My pot survived the journey home!', created_at: '2026-07-05T12:00:00Z' },
  { id: 4, experience_id: 3, traveller_name: 'David L.', rating: 5, comment: 'Shankar Lal knows every stone of this village. The stepwell story alone is worth the walk.', created_at: '2026-07-18T08:00:00Z' },
  { id: 5, experience_id: 4, traveller_name: 'Priya V.', rating: 5, comment: 'A gentle introduction to pichwai. Meera’s hands move like water. Took my painting home and framed it.', created_at: '2026-07-20T15:00:00Z' },
  { id: 6, experience_id: 5, traveller_name: 'Karan S.', rating: 4, comment: 'The simplest, most honest meal of our trip. Everything came from the field behind us.', created_at: '2026-07-25T14:00:00Z' },
]

// --- POIs (F12 itinerary source — seeded, never a live places API) ----------
export const pois = [
  { id: 1, name: 'Eklingji Temple', lat: 24.7337, lng: 73.7124, category: 'heritage', description: 'The 8th-century temple complex of Shiva, carved in grey marble.', best_time: 'Morning' },
  { id: 2, name: 'Haldighati Pass', lat: 24.6857, lng: 73.7063, category: 'heritage', description: 'The mountain pass of the 1576 battle — now a quiet, wind-blown memorial.', best_time: 'Any' },
  { id: 3, name: 'Shri Nathji Temple, Nathdwara', lat: 24.9326, lng: 73.8234, category: 'heritage', description: 'The home of the 7-year-old form of Krishna; the town exists around this shrine.', best_time: 'Dawn darshan' },
  { id: 4, name: 'Idar Fort', lat: 23.8421, lng: 73.0112, category: 'heritage', description: 'A hilltop fort above Idar town with views across the plains.', best_time: 'Sunset' },
  { id: 5, name: 'Shamlaji Temple', lat: 23.806, lng: 73.3759, category: 'heritage', description: 'A riverside Vishnu temple and pilgrimage stop off the highway.', best_time: 'Morning' },
]

// --- Route (F8) --------------------------------------------------------------
// Hardcoded polyline for the demo — per plan: pre-seed the route, never call
// live OSRM on stage. (OSRM fetch is the fallback for other corridors.)
export const routePolyline = [
  [23.0225, 72.5714], // Ahmedabad
  [23.21, 72.65],
  [23.35, 72.79],
  [23.599, 72.953], // Himmatnagar (exp 1)
  [23.72, 72.98],
  [23.837, 73.003], // Idar (exp 2)
  [24.03, 73.24], // Khedbrahma (exp 6)
  [24.22, 73.42],
  [24.4, 73.53],
  [24.5854, 73.7125], // Udaipur
]

// Mock result of GET /experiences/route (order = along the route)
export const routeResult = [
  { experience: experiences[0], distance_km: 1.2, route_progress: 0.25 },
  { experience: experiences[1], distance_km: 3.8, route_progress: 0.38 },
  { experience: experiences[5], distance_km: 2.6, route_progress: 0.5 },
  { experience: experiences[2], distance_km: 4.1, route_progress: 0.75 },
  { experience: experiences[4], distance_km: 2.2, route_progress: 0.87 },
  { experience: experiences[3], distance_km: 8.9, route_progress: 0.94 },
]

// --- Day pass (F13) -----------------------------------------------------------
export const dayPasses = [
  {
    village: 'Gogunda',
    title: 'A Day in Gogunda',
    price: 800, // vs 950 individually
    includes: [experiences[2], experiences[4], experiences[5]],
    highlights: ['Heritage walk at sunrise', 'Organic farm lunch', 'Weaving demo at Savitaben’s'],
  },
]

// --- Itinerary (F12) — pre-generated plan for the demo booking ---------------
export const demoItinerary = [
  { time: '09:30', place: 'Eklingji Temple', lat: 24.7337, lng: 73.7124, note: 'Morning darshan before the crowds', type: 'poi' },
  { time: '11:00', place: 'Travel to Eklingji farm', lat: 24.732, lng: 73.712, note: '10 min by auto from the temple', type: 'travel' },
  { time: '13:00', place: 'Organic Farm Lunch at Eklingji', lat: 24.732, lng: 73.712, note: 'Your booked experience — thali under the neem tree', type: 'experience' },
  { time: '15:30', place: 'Pichwai Painting at Nathdwara', lat: 24.933, lng: 73.817, note: 'Suggested add-on — 45 min drive north', type: 'experience' },
  { time: '18:00', place: 'Udaipur Lake Pichola view', lat: 24.5764, lng: 73.6826, note: 'End the day watching the sunset over the lake', type: 'poi' },
]

// --- Bookings (F4 host dashboard) ---------------------------------------------
export const bookings = [
  { id: 1, experience_id: 1, traveller_name: 'Sneha M.', slot_time: '2026-08-20T10:00:00', group_size: 2, status: 'confirmed', amount: 600, created_at: '2026-08-14T09:00:00Z' },
  { id: 2, experience_id: 1, traveller_name: 'David L.', slot_time: '2026-08-22T13:00:00', group_size: 4, status: 'confirmed', amount: 1200, created_at: '2026-08-15T11:30:00Z' },
  { id: 3, experience_id: 1, traveller_name: 'Ananya K.', slot_time: '2026-08-19T10:00:00', group_size: 1, status: 'pending', amount: 300, created_at: '2026-08-16T16:00:00Z' },
]

export const hostEarnings = { total: 8400, this_month: 2100, pending: 300 }

// --- Voice fixture (F1) -------------------------------------------------------
// Layer 3 of the fallback chain: hardcoded listing returned when the live
// Gemini call is unavailable. Layer 2 (cached pre-run result) slots in here
// once the DATA-CONTENT teammate records the sample Hindi/Gujarati clips.
export const mockVoiceResult = {
  host_name: 'Kamlaben',
  village_name: 'Himmatnagar',
  title: 'Thepla Bananas Seekhen (थेपला बनाना सीखें)',
  description:
    'Kamlaben ke ghar par thepla banana seekhein — chulhe par, asli Gujarati masale ke saath. Khana bhi khayenge, aur recipe ghar le jaayenge.',
  description_en:
    'Learn to make thepla at Kamlaben\'s home — on the chulha, with real Gujarati spices. You eat what you cook and carry the recipe home.',
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
