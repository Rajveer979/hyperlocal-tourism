// Shared constants — keep this file as the single source for the team.
// Matches the frozen shapes in ../API-CONTRACT.md.

export const CATEGORIES = [
  { value: 'food', label: 'Food & Cooking', emoji: '🍲' },
  { value: 'craft', label: 'Craft & Art', emoji: '🎨' },
  { value: 'heritage', label: 'Heritage & Walk', emoji: '🏛️' },
  { value: 'nature', label: 'Nature & Farm', emoji: '🌾' },
  { value: 'other', label: 'Other', emoji: '✨' },
]

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.value, c]))

// Languages spoken by hosts (F16 language-match filter). Recording languages
// for the voice flow (F1) live in utils/voice-languages — this list is broader.
export const LANGUAGES = [
  { code: 'hi', label: 'Hindi' },
  { code: 'gu', label: 'Gujarati' },
  { code: 'mr', label: 'Marathi' },
  { code: 'ta', label: 'Tamil' },
  { code: 'bn', label: 'Bengali' },
  { code: 'en', label: 'English' },
]

export const LANGUAGE_MAP = Object.fromEntries(LANGUAGES.map((l) => [l.code, l]))

// SpeechSynthesis voices (F14 listen button) keyed by language code.
export const TTS_VOICE_LANG = {
  hi: 'hi-IN',
  gu: 'gu-IN',
  mr: 'mr-IN',
  ta: 'ta-IN',
  bn: 'bn-IN',
  en: 'en-IN',
}

export const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const DEMO_CREDENTIALS = {
  host: { username: 'host@demo', password: 'host123' },
  traveller: { username: 'traveller@demo', password: 'traveller123' },
  admin: { username: 'admin@demo', password: 'admin123' },
}

// Demo corridor used across the app (F8 route demo): Ahmedabad → Udaipur
export const DEMO_ROUTE = {
  from: { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  to: { name: 'Udaipur', lat: 24.5854, lng: 73.7125 },
  radius_km: 10,
}
