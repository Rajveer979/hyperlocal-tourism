import { useParams, Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { useApi } from '../hooks/useApi.js'
import { getExperienceById, getReviews, addReview } from '../services/experiences.js'
import { CATEGORY_MAP } from '../utils/constants.js'
import { formatINR, formatDuration } from '../utils/format.js'
import HostStory from '../components/experience/HostStory.jsx'
import VerifiedBadge from '../components/experience/VerifiedBadge.jsx'
import IncludedList from '../components/experience/IncludedList.jsx'
import ListenButton from '../components/experience/ListenButton.jsx'
import ShareButton from '../components/experience/ShareButton.jsx'
import ReviewList from '../components/experience/ReviewList.jsx'
import ReviewForm from '../components/experience/ReviewForm.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import Button from '../components/ui/Button.jsx'
import MapView from '../components/map/MapView.jsx'
import ExperiencePin from '../components/map/ExperiencePin.jsx'

// F10 — the page the demo lingers on: story, badge, Listen, book.
export default function ExperienceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useApp()
  const { data: exp, loading } = useApi(() => getExperienceById(id), [id])
  const { data: reviews, reload: reloadReviews } = useApi(() => getReviews(id), [id])

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-16"><Spinner label="Loading listing…" /></div>
  if (!exp) return <div className="mx-auto max-w-4xl px-4 py-16"><p className="card text-red-600">Experience not found.</p></div>

  const cat = CATEGORY_MAP[exp.category] || CATEGORY_MAP.other
  const listenText = `${exp.title}. ${exp.description}`

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Gallery placeholder (F5) */}
      <div className="flex h-56 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-light to-amber-100 text-7xl">
        {cat.emoji}
      </div>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-stone-400">{cat.label}</span>
            {exp.host?.is_women_hosted && <span className="text-sm text-pink-600">👩 Women-hosted</span>}
          </div>
          <h1 className="mt-1 text-3xl font-bold text-stone-800">{exp.title}</h1>
          <p className="mt-1 text-stone-500">
            📍 {exp.village_name} · {formatDuration(exp.duration_minutes)} · speaks{' '}
            {exp.languages_spoken.join(', ')}
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-brand-dark">{formatINR(exp.price)}</p>
          <p className="text-xs text-stone-400">per person · direct UPI to host</p>
        </div>
      </div>

      {exp.host?.verified_by && (
        <div className="mt-3"><VerifiedBadge org={exp.host.verified_by} /></div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={() => user ? navigate(`/book/${exp.id}`) : navigate('/login')}>Book a slot →</Button>
        <ListenButton text={listenText} language={exp.original_language || 'hi'} />
        <ShareButton text={`${exp.title} — ${exp.village_name}, ${formatINR(exp.price)}. Book on Hyperlocal Tourism!`} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <div className="card">
            <h2 className="mb-2 font-semibold text-stone-800">About this experience</h2>
            <p className="text-sm leading-relaxed text-stone-600">{exp.description}</p>
          </div>
          <div className="card">
            <h2 className="mb-2 font-semibold text-stone-800">What's included</h2>
            <IncludedList included={exp.included} />
          </div>
        </div>
        <div className="space-y-6">
          <HostStory host={exp.host} />
          <div className="card">
            <h2 className="mb-3 font-semibold text-stone-800">Where you'll be</h2>
            <MapView center={[exp.lat, exp.lng]} zoom={12} className="h-48">
              <ExperiencePin experience={exp} />
            </MapView>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-3 font-semibold text-stone-800">Reviews</h2>
        <ReviewList reviews={reviews} />
        <div className="mt-4">
          <ReviewForm
            onSubmit={async ({ rating, comment }) => {
              await addReview(id, { rating, comment })
              await reloadReviews()
            }}
          />
        </div>
      </div>
    </div>
  )
}
