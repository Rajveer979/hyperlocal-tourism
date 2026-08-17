import { Polyline, CircleMarker } from 'react-leaflet'

// F8 — the drawn route. `positions` is an array of [lat, lng].
export default function RouteLayer({ positions }) {
  if (!positions || positions.length < 2) return null
  return (
    <>
      <Polyline
        positions={positions}
        pathOptions={{ color: '#f97316', weight: 5, opacity: 0.85 }}
      />
      {/* start / end dots */}
      <CircleMarker center={positions[0]} radius={7} pathOptions={{ color: '#16a34a', fillColor: '#16a34a', fillOpacity: 1 }} />
      <CircleMarker center={positions[positions.length - 1]} radius={7} pathOptions={{ color: '#dc2626', fillColor: '#dc2626', fillOpacity: 1 }} />
    </>
  )
}
