import { Link } from 'react-router-dom'
import { CATEGORY_MAP } from '../../utils/constants.js'
import { formatINR, formatKm, formatDuration } from '../../utils/format.js'
import VerifiedBadge from './VerifiedBadge.jsx'

// F9/F10 card. Shows uploaded photos as background (F5), category emoji fallback.
// distanceKm = off-route distance (F8), userDistance = from user's GPS (Find Nearby).
export default function ExperienceCard({ experience, distanceKm, userDistance }) {
  const cat = CATEGORY_MAP[experience.category] || CATEGORY_MAP.other
  const hasPhotos = experience.photos && experience.photos.length > 0

  return (
    <Link
      to={`/experience/${experience.id}`}
      className="card group flex flex-col overflow-hidden p-0 transition-shadow hover:shadow-md"
    >
      {/* Photo background or category emoji fallback */}
      <div className="relative flex h-36 items-center justify-center overflow-hidden">
        {hasPhotos ? (
          <img
            src={experience.photos[0]}
            alt={experience.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-light to-amber-100 text-5xl">
            {cat.emoji}
          </div>
        )}
        {/* Price badge on top of image */}
        <span className="absolute right-3 top-3 rounded-lg bg-white/90 px-3 py-1 text-sm font-bold text-brand-dark shadow-sm">
          {formatINR(experience.price)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-stone-800 group-hover:text-brand-dark">{experience.title}</h3>
        </div>
        <p className="text-sm text-stone-500">
          📍 {experience.village_name || 'Unknown village'} · {formatDuration(experience.duration_minutes)}
        </p>
        {/* Distance indicators */}
        {distanceKm != null && (
          <p className="text-xs text-amber-600">🚗 {formatKm(distanceKm)} off route</p>
        )}
        {userDistance != null && (
          <p className="flex items-center gap-1 text-xs text-blue-600">
            📍 {formatKm(userDistance)} away
            {userDistance < 5 && <span className="ml-1 rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700">Nearby</span>}
          </p>
        )}
        {experience.languages?.length > 0 && (
          <p className="text-xs text-stone-400">
            Speaks: {experience.languages.join(', ')}
          </p>
        )}
        {experience.host?.verified_by && <VerifiedBadge org={experience.host.verified_by} />}
        {experience.host?.story && <p className="line-clamp-2 text-xs italic text-stone-400">{experience.host.story}</p>}
        {experience.women_hosted && <span className="text-xs text-pink-600">👩 Women-hosted</span>}
      </div>
    </Link>
  )
}
