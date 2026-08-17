import { Link } from 'react-router-dom'
import { CATEGORY_MAP } from '../../utils/constants.js'
import { formatINR, formatDuration, formatKm } from '../../utils/format.js'
import VerifiedBadge from './VerifiedBadge.jsx'

// F9/F10 card. Placeholder art per category when the host uploaded no photos (F5).
export default function ExperienceCard({ experience, distanceKm }) {
  const cat = CATEGORY_MAP[experience.category] || CATEGORY_MAP.other
  return (
    <Link
      to={`/experience/${experience.id}`}
      className="card group flex flex-col overflow-hidden p-0 transition-shadow hover:shadow-md"
    >
      <div className="flex h-36 items-center justify-center bg-gradient-to-br from-brand-light to-amber-100 text-5xl">
        {cat.emoji}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-stone-800 group-hover:text-brand-dark">{experience.title}</h3>
          <span className="shrink-0 font-bold text-brand-dark">{formatINR(experience.price)}</span>
        </div>
        <p className="text-sm text-stone-500">
          📍 {experience.village_name} · {formatDuration(experience.duration_minutes)}
          {distanceKm != null && ` · ${formatKm(distanceKm)} off route`}
        </p>
        {experience.host?.verified_by && <VerifiedBadge org={experience.host.verified_by} />}
        {experience.host?.story && <p className="line-clamp-2 text-xs italic text-stone-400">{experience.host.story}</p>}
        <div className="mt-auto flex items-center gap-2 pt-1">
          <span className="text-xs text-stone-400">{cat.label}</span>
          {experience.host?.is_women_hosted && <span className="text-xs text-pink-600">👩 Women-hosted</span>}
        </div>
      </div>
    </Link>
  )
}
