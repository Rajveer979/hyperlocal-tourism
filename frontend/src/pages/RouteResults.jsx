import { useSearchParams, Link } from 'react-router-dom'
import { useApi } from '../hooks/useApi.js'
import { getRouteResult } from '../services/experiences.js'
import MapView from '../components/map/MapView.jsx'
import RouteLayer from '../components/map/RouteLayer.jsx'
import ExperiencePin from '../components/map/ExperiencePin.jsx'
import ExperienceCard from '../components/experience/ExperienceCard.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import { formatKm } from '../utils/format.js'
import { DEMO_ROUTE } from '../utils/constants.js'

// F8 — the hero demo: "Ahmedabad → Udaipur" draws a route and every
// experience within the radius appears, ordered as stops.
export default function RouteResults() {
  const [params] = useSearchParams()
  const from = params.get('from') || DEMO_ROUTE.from.name
  const to = params.get('to') || DEMO_ROUTE.to.name
  const radius = params.get('radius_km') || DEMO_ROUTE.radius_km

  const { data, loading, error } = useApi(() => getRouteResult(from, to, radius), [from, to, radius])

  const polyline = data?.polyline || []
  const results = data?.results || []

  const center = polyline.length
    ? polyline[Math.floor(polyline.length / 2)]
    : [23.4, 73.1]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800">
          Stops between {from} and {to}
        </h1>
        <p className="text-sm text-stone-500">
          Showing experiences within {radius} km of the route — not in the cities, on the way.
        </p>
      </div>

      {error && <p className="card text-red-600">{error}</p>}
      {loading && <Spinner label="Drawing your route…" />}

      {!loading && !error && (
        <>
          <MapView center={center} zoom={9} className="h-96">
            <RouteLayer positions={polyline} />
            {results.map((r) => (
              <ExperiencePin key={r.experience.id} experience={r.experience} />
            ))}
          </MapView>

          <div className="mt-8">
            <h2 className="mb-4 text-xl font-bold text-stone-800">
              {results.length} experiences on your way
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((r) => (
                <div key={r.experience.id} className="relative">
                  <span className="absolute -top-2 -left-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-bold text-white shadow">
                    {results.indexOf(r) + 1}
                  </span>
                  <ExperienceCard experience={r.experience} distanceKm={r.distance_km} />
                </div>
              ))}
            </div>
            <p className="mt-6 text-center text-sm text-stone-400">
              Route geometry is pre-seeded for the demo (no live OSRM on stage).{' '}
              <Link to="/explore" className="text-brand-dark hover:underline">Browse the map instead →</Link>
            </p>
          </div>
        </>
      )}
    </div>
  )
}
