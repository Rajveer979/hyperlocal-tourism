import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Circle, Marker } from 'react-leaflet'
import L from 'leaflet'
import { useApi } from '../hooks/useApi.js'
import { getNearbyExperiences, getGuides } from '../services/experiences.js'
import MapView from '../components/map/MapView.jsx'
import ExperiencePin from '../components/map/ExperiencePin.jsx'
import GuidePin from '../components/map/GuidePin.jsx'
import ExperienceCard from '../components/experience/ExperienceCard.jsx'
import FindGuideButton from '../components/guide/FindGuideButton.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import { CATEGORIES } from '../utils/constants.js'

const RADIUS_KM = 25
const SUGGESTED_CITIES = [
  { name: 'Ahmedabad', emoji: '🕌' },
  { name: 'Vadodara', emoji: '🏛️' },
  { name: 'Surat', emoji: '💎' },
  { name: 'Rajkot', emoji: '🎨' },
  { name: 'Udaipur', emoji: '🏰' },
  { name: 'Mumbai', emoji: '🌊' },
  { name: 'Halol', emoji: '🌳' },
]

export default function CitySearch() {
  const [params, setParams] = useSearchParams()
  const initialCity = params.get('city') || ''
  const initialCat = params.get('category') || 'all'

  const [city, setCity] = useState(initialCity)
  const [category, setCategory] = useState(initialCat)
  const [showGuides, setShowGuides] = useState(false)
  const [hasSearched, setHasSearched] = useState(!!initialCity)

  const { data, loading, error } = useApi(
    () => (hasSearched && city.trim() ? getNearbyExperiences(city, RADIUS_KM) : Promise.resolve(null)),
    [hasSearched, city],
  )

  const { data: guideData, loading: guidesLoading } = useApi(
    () => (hasSearched && showGuides && city.trim() ? getGuides(city, 50) : Promise.resolve(null)),
    [hasSearched, showGuides, city],
  )

  let results = data?.results || []
  const center = data?.center || { lat: 22.5, lng: 72.0 }
  const guides = guideData?.guides || []

  // Apply category filter on frontend
  if (category && category !== 'all') {
    results = results.filter((r) => r.experience.category === category)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (!city.trim()) return
    setHasSearched(true)
    setParams({ city, category })
  }

  const handleSuggestCity = (name) => {
    setCity(name)
    setHasSearched(true)
    setParams({ city: name, category })
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Search bar — always visible */}
      <form onSubmit={handleSearch} className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl bg-white p-4 shadow-lg ring-1 ring-stone-200">
        <div className="flex-1 min-w-[200px]">
          <label className="label">City / Town</label>
          <input
            className="input w-full"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter a city name..."
          />
        </div>
        <button type="submit" className="btn-primary">
          🔍 Search
        </button>
      </form>

      {error && <p className="card mb-4 text-red-600">{error}</p>}

      {/* ===== NO SEARCH YET — show suggestions only ===== */}
      {!hasSearched && (
        <div className="mx-auto max-w-2xl text-center py-12">
          <div className="mb-6 text-6xl">🗺️</div>
          <h2 className="mb-3 text-2xl font-bold text-stone-800">Discover local experiences</h2>
          <p className="mb-8 text-sm text-stone-500">
            Search for a city to find temples, food spots, heritage sites, craft workshops, and more within 25 km.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {SUGGESTED_CITIES.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => handleSuggestCity(c.name)}
                className="group flex flex-col items-center gap-2 rounded-xl border border-stone-200 bg-white p-4 transition hover:border-amber-400 hover:shadow-md"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">{c.emoji}</span>
                <span className="text-sm font-medium text-stone-700 group-hover:text-amber-700">{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ===== LOADING ===== */}
      {hasSearched && loading && <Spinner label={`Searching experiences near ${city}…`} />}

      {/* ===== SEARCH RESULTS ===== */}
      {hasSearched && !loading && !error && (
        <>
          {/* Category filter */}
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategory('all')}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                category === 'all'
                  ? 'bg-amber-600 text-white'
                  : 'border border-stone-300 bg-white text-stone-600 hover:border-amber-400'
              }`}
            >
              All
            </button>
            {CATEGORIES.filter((c) => c.value !== 'other').map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  category === cat.value
                    ? 'bg-amber-600 text-white'
                    : 'border border-stone-300 bg-white text-stone-600 hover:border-amber-400'
                }`}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>

          {/* Map + results grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Map */}
            <MapView center={[center.lat, center.lng]} zoom={10} className="h-[420px]">
              <RadiusCircle lat={center.lat} lng={center.lng} radiusKm={RADIUS_KM} />
              <CityMarker lat={center.lat} lng={center.lng} />
              {results.map((r) => (
                <ExperiencePin key={r.experience.id} experience={r.experience} />
              ))}
              {showGuides && guides.map((g) => (
                <GuidePin key={g.id} guide={g} />
              ))}
            </MapView>

            {/* Results list */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-stone-600">
                  {results.length} experience{results.length !== 1 ? 's' : ''} near {city}
                </p>
                <FindGuideButton
                  active={showGuides}
                  onClick={() => setShowGuides(!showGuides)}
                  guideCount={guides.length}
                  loading={guidesLoading}
                />
              </div>

              <div className="max-h-[380px] space-y-4 overflow-y-auto pr-1">
                {results.map((r) => (
                  <ExperienceCard key={r.experience.id} experience={r.experience} userDistance={r.distance_km} />
                ))}
                {results.length === 0 && (
                  <div className="card text-center text-sm text-stone-400">
                    No {category !== 'all' ? category : ''} experiences found near {city}. Try a different category.
                  </div>
                )}
              </div>

              {/* Guide results */}
              {showGuides && (
                <div className="mt-6 border-t border-stone-200 pt-4">
                  <h3 className="mb-3 text-sm font-semibold text-stone-700">
                    🧭 {guides.length} guide{guides.length !== 1 ? 's' : ''} near {city}
                  </h3>
                  {guidesLoading && <Spinner label="Loading guides…" />}
                  {!guidesLoading && guides.length === 0 && (
                    <p className="text-xs text-stone-400">No guides available in this area.</p>
                  )}
                  <div className="space-y-3">
                    {guides.map((g) => (
                      <GuideCard key={g.id} guide={g} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// --- Sub-components ---

const cityIcon = L.divIcon({
  className: '',
  html: `<div style="background:#d97706;color:white;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:14px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">📍</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

function RadiusCircle({ lat, lng, radiusKm }) {
  return (
    <Circle
      center={[lat, lng]}
      radius={radiusKm * 1000}
      pathOptions={{
        color: '#d97706',
        fillColor: '#f59e0b',
        fillOpacity: 0.06,
        weight: 2,
        dashArray: '8 4',
      }}
    />
  )
}

function CityMarker({ lat, lng }) {
  return <Marker position={[lat, lng]} icon={cityIcon} />
}

function GuideCard({ guide }) {
  return (
    <div className="card flex items-start gap-3 p-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg">
        🧭
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-stone-800">{guide.name}</h4>
          <span className="text-xs text-amber-600">⭐ {guide.rating}</span>
        </div>
        <p className="text-xs text-stone-500">{guide.specialty}</p>
        <p className="text-[11px] text-stone-400">
          📍 {guide.village_name} · {guide.experience_count} tours
        </p>
        <p className="mt-1 line-clamp-2 text-[11px] italic text-stone-400">{guide.bio}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[10px] text-green-600">✓ {guide.verified_by}</span>
          <a
            href={`https://wa.me/${guide.phone.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded bg-green-500 px-2 py-0.5 text-[10px] font-medium text-white hover:bg-green-600"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
