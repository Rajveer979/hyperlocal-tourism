import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { useApi } from '../hooks/useApi.js'
import { getExperiences } from '../services/experiences.js'
import ExperienceCard from '../components/experience/ExperienceCard.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import { DEMO_ROUTE } from '../utils/constants.js'

// Landing + the F8 route search ("From → To").
export default function Home() {
  const { t } = useApp()
  const navigate = useNavigate()
  const [from, setFrom] = useState(DEMO_ROUTE.from.name)
  const [to, setTo] = useState(DEMO_ROUTE.to.name)
  const [radius, setRadius] = useState(DEMO_ROUTE.radius_km)

  const { data: featured, loading } = useApi(() => getExperiences({}), [])

  const searchRoute = (e) => {
    e.preventDefault()
    navigate(`/route?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&radius_km=${radius}`)
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-light via-amber-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight text-stone-800 sm:text-5xl">
            {t('hero_title')}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-stone-600">{t('hero_subtitle')}</p>

          {/* Route search (F8) */}
          <form onSubmit={searchRoute} className="mx-auto mt-10 flex max-w-3xl flex-wrap items-end justify-center gap-3 rounded-2xl bg-white p-4 shadow-lg ring-1 ring-stone-200">
            <div>
              <label className="label">From</label>
              <input className="input w-44" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="City" />
            </div>
            <div>
              <label className="label">To</label>
              <input className="input w-44" value={to} onChange={(e) => setTo(e.target.value)} placeholder="City" />
            </div>
            <div>
              <label className="label">Radius (km)</label>
              <input type="number" min="1" className="input w-24" value={radius} onChange={(e) => setRadius(e.target.value)} />
            </div>
            <button type="submit" className="btn-primary">
              🗺️ {t('cta_search')}
            </button>
          </form>

          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-stone-500">
            <span>✨ Stops appear along your route, not just in cities</span>
            <span>🛡️ Panchayat-verified hosts</span>
            <span>💬 Hosts list by speaking</span>
          </div>
        </div>
      </section>

      {/* Host CTA (F1) */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="card flex flex-wrap items-center justify-between gap-4 bg-brand-light/50">
          <div>
            <h2 className="text-xl font-bold text-stone-800">Are you a village host?</h2>
            <p className="text-sm text-stone-600">No forms, no English, no typing. Tap the mic and speak — we build your listing.</p>
          </div>
          <Link to="/host/voice" className="btn-primary">
            🎙️ {t('cta_voice')}
          </Link>
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-stone-800">Featured experiences</h2>
          <Link to="/explore" className="text-sm font-semibold text-brand-dark hover:underline">
            Browse all →
          </Link>
        </div>
        {loading ? (
          <Spinner label="Loading experiences…" />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured?.slice(0, 6).map((e) => (
              <ExperienceCard key={e.id} experience={e} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
