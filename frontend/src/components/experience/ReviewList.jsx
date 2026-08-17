import { formatDate } from '../../utils/format.js'

export function Stars({ rating }) {
  return <span className="text-amber-500">{'★'.repeat(rating)}<span className="text-stone-300">{'★'.repeat(5 - rating)}</span></span>
}

// F18 — reviews. In production these come only from completed bookings
// (the seeded demo reviews read as planted otherwise — plan discussion).
export default function ReviewList({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return <p className="text-sm text-stone-400">No reviews yet — the Panchayat badge vouches for this host.</p>
  }
  return (
    <ul className="space-y-3">
      {reviews.map((r) => (
        <li key={r.id} className="rounded-lg border border-stone-200 bg-stone-50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-stone-700">{r.traveller_name}</span>
            <Stars rating={r.rating} />
          </div>
          <p className="mt-1 text-sm text-stone-600">{r.comment}</p>
          <p className="mt-1 text-xs text-stone-400">{formatDate(r.created_at)}</p>
        </li>
      ))}
    </ul>
  )
}
