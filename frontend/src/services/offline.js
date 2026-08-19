import { isLive } from './api.js'

// ============================================================================
// F15 — OFFLINE TRAVELLER PACK
// ----------------------------------------------------------------------------
// Before departure the traveller downloads: itinerary, host phone, directions,
// booking reference. Works with zero bars — the demo moment is turning off
// Wi-Fi and opening the pack.
//
// NOTE (plan): we bundle a static map image / text, NOT raw OSM tiles
// (violates tile usage policy). The backend serves a rendered map image.
// ============================================================================

export function buildOfflinePack({ booking, experience, itinerary, host }) {
  const lines = [
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '  OFFLINE TRAVELLER PACK',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '',
    `Booking reference: #${booking?.id || '—'}`,
    `Experience: ${experience?.title || '—'}`,
    `Village: ${experience?.village_name || '—'}`,
    `Host: ${host?.name || '—'}`,
    `Host phone: ${host?.phone || '—'} (WhatsApp works offline-first)`,
    `Slot: ${booking?.slot_time ? new Date(booking.slot_time).toLocaleString('en-IN') : '—'}`,
    `Group size: ${booking?.group_size || '—'}`,
    '',
    '— ITINERARY —',
    ...(itinerary || []).map((s) => `  ${s.time}  ${s.place}  ${s.note || ''}`),
    '',
    'Directions: follow the highway; the village is signposted at the main road.',
    'In an emergency call the host — the pack works without network.',
    '',
    'Made with ❤️ — Hyperlocal Tourism',
  ]
  return lines.join('\n')
}

export function downloadPack(bookingId) {
  // Real path (future): GET /offline-pack/{booking_id} → PackJSON + map image
  // Mock path (today): caller builds the pack string locally.
  if (!isLive('offline')) return
  return undefined
}

export function savePackLocally(packText) {
  localStorage.setItem('offline_pack', packText)
  const blob = new Blob([packText], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'offline-pack.txt'
  a.click()
  URL.revokeObjectURL(url)
}
