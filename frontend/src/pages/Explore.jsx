import { useMemo, useState } from 'react'
import { Marker, Circle } from 'react-leaflet'
import L from 'leaflet'
import { useApi } from '../hooks/useApi.js'
import useGeolocation from '../hooks/useGeolocation.js'
import { getExperiences } from '../services/experiences.js'
import MapView from '../components/map/MapView.jsx'
import ExperiencePin from '../components/map/ExperiencePin.jsx'
import ExperienceCard from '../components/experience/ExperienceCard.jsx'
import FilterBar from '../components/experience/FilterBar.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import { haversineKm } from '../utils/geo.js'

// F9 — map browse with filters (category, price, women-hosted, language, search).
// + My Location / Find Nearby: sort by distance from user's GPS position.
export default function Explore() {
  const { data, loading } = useApi(() => getExperiences({}), [])
  const [filters, setFilters] = useLocalFilters({})
  const [nearbyMode, setNearbyMode] = useState(false)
  const geo = useGeolocation({ watch: nearbyMode })

  // Apply filters client-side in mock mode; the API does this when backend ships.
  const filtered = useMemo(() => {
    if (!data) return []
    let items = [...data]
    if (filters.category && filters.category !== 'all') items = items.filter((e) => e.category === filters.category)
    if (filters.maxPrice) items = items.filter((e) => e.price <= Number(filters.maxPrice))
    if (filters.womenHosted) items = items.filter((e) => e.host?.is_women_hosted)
    if (filters.language && filters.language !== 'all') items = items.filter((e) => e.languages_spoken.includes(filters.language))
    if (filters.q) {
      const q = filters.q.toLowerCase()
      items = items.filter((e) => [e.title, e.description, e.village_name].join(' ').toLowerCase().includes(q))
    }
    // Sort by distance from user if nearby mode is on and we have a position
    if (nearbyMode && geo.lat != null && geo.lng != null) {
      items = items
        .map((e) => ({ ...e, _distance_km: haversineKm(geo.lat, geo.lng, e.lat, e.lng) }))
        .sort((a, b) => a._distance_km - b._distance_km)
    }
    return items
  }, [data, filters, nearbyMode, geo.lat, geo.lng])

  // Center map on user location when in nearby mode
  const mapCenter = useMemo(() => {
    if (nearbyMode && geo.lat != null && geo.lng != null) return [geo.lat, geo.lng]
    return [23.8, 73.3]
  }, [nearbyMode, geo.lat, geo.lng])

  if (loading) return <div className="mx-auto max-w-6xl px-4 py-16"><Spinner label="Loading map…" /></div>

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-stone-800">Explore villages</h1>
      <p className="mb-6 text-sm text-stone-500">Pan the map or filter — every pin is a host waiting for you.</p>

      <FilterBar onChange={setFilters} />

      {/* Find Nearby toggle */}
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={() => {
            if (!nearbyMode) {
              setNearbyMode(true)
              geo.refresh()
            } else {
              setNearbyMode(false)
            }
          }}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            nearbyMode
              ? 'bg-brand text-white shadow-md'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          📍 {nearbyMode ? 'Nearby ON' : 'Find Nearby'}
        </button>

        {nearbyMode && geo.loading && (
          <span className="text-xs text-stone-400">Getting your location…</span>
        )}
        {nearbyMode && geo.error && (
          <span className="text-xs text-red-500">{geo.error}</span>
        )}
        {nearbyMode && geo.lat != null && (
          <span className="text-xs text-stone-400">
            Showing {filtered.length} experiences sorted by distance
          </span>
        )}
        {!nearbyMode && (
          <span className="text-xs text-stone-400">{filtered.length} experiences match</span>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MapView center={mapCenter} zoom={nearbyMode ? 10 : 8} className="h-[420px]">
          {nearbyMode && geo.lat != null && (
            <UserMarker lat={geo.lat} lng={geo.lng} />
          )}
          {filtered.map((e) => (
            <ExperiencePin key={e.id} experience={e} />
          ))}
        </MapView>
        <div>
          <div className="max-h-[420px] space-y-4 overflow-y-auto pr-1">
            {filtered.map((e) => (
              <ExperienceCard key={e.id} experience={e} userDistance={nearbyMode ? e._distance_km : undefined} />
            ))}
            {filtered.length === 0 && (
              <div className="card text-center py-8">
                <p className="text-3xl">🔍</p>
                <p className="mt-2 text-sm font-medium text-stone-600">No experiences found</p>
                <p className="mt-1 text-xs text-stone-400">Hosts haven't listed any experiences yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const blueIcon = L.divIcon({
  className: '',
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 8px rgba(59,130,246,0.6)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

function UserMarker({ lat, lng }) {
  return (
    <>
      <Circle
        center={[lat, lng]}
        radius={500}
        pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1, weight: 1 }}
      />
      <Marker position={[lat, lng]} icon={blueIcon} />
    </>
  )
}

// tiny local-state hook to keep this page dependency-free
function useLocalFilters(initial) {
  const [state, setState] = useState(initial)
  return [state, setState]
}
