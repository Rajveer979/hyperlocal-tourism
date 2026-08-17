import { useApi } from '../hooks/useApi.js'
import { getDayPasses } from '../services/experiences.js'
import { formatINR } from '../utils/format.js'
import Spinner from '../components/ui/Spinner.jsx'
import { Link } from 'react-router-dom'

// F13 — bundle 3–4 experiences in one village: a full day justifies the
// detour, and income spreads across several households.
export default function DayPass() {
  const { data: passes, loading } = useApi(() => getDayPasses(), [])

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-stone-800">Village day-passes</h1>
      <p className="mt-1 text-sm text-stone-500">One village, a full day, several households — at a bundled price.</p>

      {loading && <div className="mt-8"><Spinner label="Loading day passes…" /></div>}

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {passes?.map((p) => (
          <div key={p.village} className="card flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-bold text-stone-800">{p.title}</h2>
              <p className="text-sm text-stone-500">{p.village}</p>
            </div>
            <ul className="space-y-1 text-sm text-stone-600">
              {p.highlights.map((h) => (
                <li key={h}>• {h}</li>
              ))}
            </ul>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-brand-dark">{formatINR(p.price)}</span>
                <span className="ml-2 text-sm text-stone-400 line-through">
                  {formatINR(p.includes.reduce((sum, e) => sum + e.price, 0))}
                </span>
              </div>
              <Link to={`/book/${p.includes[0]?.id}`} className="btn-primary">
                Plan this day →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
