import { useLocation, useParams, Link } from 'react-router-dom'
import { useApi } from '../hooks/useApi.js'
import { getItinerary } from '../services/bookings.js'
import Timeline from '../components/itinerary/Timeline.jsx'
import OfflinePackButton from '../components/itinerary/OfflinePackButton.jsx'
import Spinner from '../components/ui/Spinner.jsx'

// F12 — after booking: a realistic day plan bundling the booked experience
// with nearby heritage and other stops. F15 — download the offline pack.
export default function Itinerary() {
  const { bookingId } = useParams()
  const location = useLocation()
  const experience = location.state?.experience
  const booking = location.state?.booking

  const { data: steps, loading } = useApi(
    () => getItinerary(bookingId, {
      id: experience?.id,
      title: experience?.title,
      village_name: experience?.village_name,
      description: experience?.description || experience?.description_en,
      lat: experience?.lat,
      lng: experience?.lng,
      slot_time: booking?.slot_time,
    }),
    [bookingId]
  )

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Your day plan</h1>
          <p className="text-sm text-stone-500">
            Booking #{bookingId} {experience ? `· ${experience.title}` : ''} — generated around your slot.
          </p>
        </div>
        {experience && booking && (
          <OfflinePackButton
            booking={booking}
            experience={experience}
            itinerary={steps || []}
            host={experience.host}
          />
        )}
      </div>

      {loading ? (
        <Spinner label="Planning your day…" />
      ) : (
        <>
          <Timeline steps={steps || []} />
          <div className="mt-8 card bg-brand-light/40">
            <h2 className="font-semibold text-stone-800">Made for the demo</h2>
            <p className="mt-1 text-sm text-stone-600">
              This plan is pre-generated from seeded heritage sites (F12 reliability rule: no live places API on
              stage). Swap and remove stops above; the AI endpoint will offer alternatives.
            </p>
            <Link to="/explore" className="mt-3 inline-block text-sm font-semibold text-brand-dark hover:underline">
              Add another stop →
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
