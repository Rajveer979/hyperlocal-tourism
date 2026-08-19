import { useState } from 'react'
import { useApp } from '../../context/AppContext.jsx'
import Button from '../ui/Button.jsx'

// F18 — the write half of reviews. Only travellers who booked can post
// (gated server-side on completed bookings; the form itself just collects
// rating + comment and lets the API enforce the rule).
export default function ReviewForm({ onSubmit }) {
  const { user } = useApp()
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(null)

  if (!user || user.role !== 'traveller') {
    return (
      <p className="text-sm text-stone-400">
        {user
          ? 'Only travellers can review an experience.'
          : 'Log in as a traveller to leave a review.'}
      </p>
    )
  }

  const submit = async (e) => {
    e.preventDefault()
    if (rating < 1 || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({ rating, comment: comment.trim() })
      setDone(true)
      setRating(0)
      setComment('')
    } catch (err) {
      setError(err.message || 'Could not post your review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="card border-green-200 bg-green-50">
        <p className="text-sm font-medium text-green-700">✓ Thank you! Your review has been posted.</p>
        <button
          type="button"
          className="mt-2 text-xs text-stone-500 underline"
          onClick={() => setDone(false)}
        >
          Write another review
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="card space-y-3">
      <h3 className="font-semibold text-stone-800">Leave a review</h3>

      <div>
        <label className="label">Your rating</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n} star${n > 1 ? 's' : ''}`}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              className={`text-2xl transition-colors ${
                (hover || rating) >= n ? 'text-amber-500' : 'text-stone-300'
              }`}
            >
              ★
            </button>
          ))}
          <span className="ml-1 text-sm text-stone-500">
            {rating > 0 ? `${rating} / 5` : 'Tap to rate'}
          </span>
        </div>
      </div>

      <div>
        <label className="label">Your review</label>
        <textarea
          className="input min-h-24 resize-y"
          placeholder="What was it like? Food, people, the place…"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" variant="primary" disabled={rating < 1 || submitting}>
        {submitting ? 'Posting…' : 'Post review'}
      </Button>
    </form>
  )
}
