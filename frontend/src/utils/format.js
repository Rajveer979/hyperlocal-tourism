// Formatting helpers (currency, dates, durations)

export function formatINR(amount) {
  if (amount == null || Number.isNaN(amount)) return '—'
  return `₹${Number(amount).toLocaleString('en-IN')}`
}

export function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatTime(hhmm) {
  // "14:00" -> "2:00 PM"
  if (!hhmm) return '—'
  const [h, m] = hhmm.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

export function formatDuration(minutes) {
  if (!minutes) return '—'
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h}h ${m}m` : `${h} hr`
}

export function formatKm(km) {
  if (km == null) return '—'
  return `${Number(km).toFixed(1)} km`
}
