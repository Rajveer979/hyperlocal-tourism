import { useMemo, useState } from 'react'
import { useApi } from '../hooks/useApi.js'
import { getExperiences } from '../services/experiences.js'
import MapView from '../components/map/MapView.jsx'
import ExperiencePin from '../components/map/ExperiencePin.jsx'
import ExperienceCard from '../components/experience/ExperienceCard.jsx'
import FilterBar from '../components/experience/FilterBar.jsx'
import Spinner from '../components/ui/Spinner.jsx'

// F9 — map browse with filters (category, price, women-hosted, language, search).
export default function Explore() {
  const { data, loading } = useApi(() => getExperiences({}), [])
  const [filters, setFilters] = useLocalFilters({})

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
    return items
  }, [data, filters])

  if (loading) return <div className="mx-auto max-w-6xl px-4 py-16"><Spinner label="Loading map…" /></div>

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-stone-800">Explore villages</h1>
      <p className="mb-6 text-sm text-stone-500">Pan the map or filter — every pin is a host waiting for you.</p>

      <FilterBar onChange={setFilters} />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MapView center={[23.8, 73.3]} zoom={8} className="h-[420px]">
          {filtered.map((e) => (
            <ExperiencePin key={e.id} experience={e} />
          ))}
        </MapView>
        <div>
          <p className="mb-3 text-sm font-medium text-stone-600">{filtered.length} experiences match</p>
          <div className="max-h-[420px] space-y-4 overflow-y-auto pr-1">
            {filtered.map((e) => (
              <ExperienceCard key={e.id} experience={e} />
            ))}
            {filtered.length === 0 && <p className="card text-sm text-stone-400">Nothing matches — loosen the filters.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

// tiny local-state hook to keep this page dependency-free
function useLocalFilters(initial) {
  const [state, setState] = useState(initial)
  return [state, setState]
}
