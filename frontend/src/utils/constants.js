// Shared constants -- keep this file as the single source for the team.
// Matches the frozen shapes in ../API-CONTRACT.md.

export const CATEGORIES = [
  { value: 'food', label: 'Food & Cooking', emoji: '🍲' },
  { value: 'craft', label: 'Craft & Art', emoji: '🎨' },
  { value: 'heritage', label: 'Heritage & Walk', emoji: '🏛️' },
  { value: 'temple', label: 'Temple & Religious', emoji: '🛕' },
  { value: 'nature', label: 'Nature & Farm', emoji: '🌾' },
  { value: 'tourist', label: 'Tourist & Sightseeing', emoji: '🗺️' },
  { value: 'historical', label: 'Historical', emoji: '🏰' },
  { value: 'waterfall', label: 'Waterfall', emoji: '💧' },
  { value: 'other', label: 'Other', emoji: '✨' },
]

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.value, c]))

// Languages spoken by hosts (F16 language-match filter).
export const LANGUAGES = [
  { code: 'hi', label: 'Hindi' },
  { code: 'en', label: 'English' },
  { code: 'gu', label: 'Gujarati' },
  { code: 'mr', label: 'Marathi' },
  { code: 'mewari', label: 'Mewari' },
]

export const LANGUAGE_MAP = Object.fromEntries(LANGUAGES.map((l) => [l.code, l]))

// SpeechSynthesis voices (F14 listen button) keyed by language code.
export const TTS_VOICE_LANG = {
  hi: 'hi-IN',
  en: 'en-IN',
}

export const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const DEMO_CREDENTIALS = {
  host: { username: 'host@demo', password: 'host123' },
  traveller: { username: 'traveller@demo', password: 'traveller123' },
  admin: { username: 'admin@demo', password: 'admin123' },
}

// Default city for the F8 city search demo
export const DEMO_CITY = 'Ahmedabad'
export const DEMO_RADIUS_KM = 10
