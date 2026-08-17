import { useLocation, useNavigate } from 'react-router-dom'
import ListingForm from '../../components/host/ListingForm.jsx'

// F1 — the pre-filled card from the host's voice. Host reviews, corrects,
// publishes. "AI filled this in from your voice" is the trust cue.
export default function ListingReview() {
  const location = useLocation()
  const navigate = useNavigate()

  let listing = location.state?.listing
  if (!listing) {
    try {
      listing = JSON.parse(sessionStorage.getItem('voice_listing') || 'null')
    } catch {
      listing = null
    }
  }

  if (!listing) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="card text-center">
          <p className="text-stone-600">No voice listing found — record one first.</p>
          <button className="btn-primary mt-4" onClick={() => navigate('/host/voice')}>
            🎙️ Back to voice listing
          </button>
        </div>
      </div>
    )
  }

  const publish = (values) => {
    // In mock mode this just succeeds; POST /experiences when the backend ships.
    console.log('Publishing listing:', values)
    navigate('/host/dashboard', { state: { published: true } })
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 rounded-lg bg-brand-light p-4 text-sm text-brand-dark">
        ✨ <strong>Your card is ready.</strong> The AI filled this from your voice — check everything, fix anything, then
        publish. (Auto-translation to English rides the same call.)
      </div>
      <h1 className="mb-4 text-2xl font-bold text-stone-800">Review your listing</h1>
      <ListingForm initial={listing} onPublish={publish} />
    </div>
  )
}
