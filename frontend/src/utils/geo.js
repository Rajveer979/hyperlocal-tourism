// Geo helpers. Distance-to-polyline is the core math behind F8 route discovery.
// (The backend re-implements this with shapely; this client copy powers the
// mock route results and will also verify the real backend's numbers.)

const R = 6371 // earth radius km

export function haversineKm(lat1, lng1, lat2, lng2) {
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

// Shortest distance from a point to a polyline (array of [lat, lng]).
export function distanceToPolylineKm(lat, lng, polyline) {
  if (!polyline || polyline.length === 0) return Infinity
  let min = Infinity
  for (let i = 0; i < polyline.length - 1; i++) {
    const d = distanceToSegmentKm(lat, lng, polyline[i], polyline[i + 1])
    if (d < min) min = d
  }
  return min
}

function distanceToSegmentKm(lat, lng, a, b) {
  // Project point onto segment in lat/lng space, then convert to km.
  const [ax, ay] = a
  const [bx, by] = b
  const dx = bx - ax
  const dy = by - ay
  const lenSq = dx * dx + dy * dy
  let t = lenSq === 0 ? 0 : ((lat - ax) * dx + (lng - ay) * dy) / lenSq
  t = Math.max(0, Math.min(1, t))
  const projLat = ax + t * dx
  const projLng = ay + t * dy
  return haversineKm(lat, lng, projLat, projLng)
}

// Rough position (0–1) of a point along a polyline — used to order stops.
export function routeProgress(lat, lng, polyline) {
  if (!polyline || polyline.length < 2) return 0
  let best = 0
  let bestT = 0
  for (let i = 0; i < polyline.length - 1; i++) {
    const d = distanceToSegmentKm(lat, lng, polyline[i], polyline[i + 1])
    if (d < best) continue
    best = d
    bestT = i / (polyline.length - 1)
  }
  return bestT
}
