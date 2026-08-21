import { useApi } from '../../hooks/useApi.js'
import { getHostBookings, getHostEarnings } from '../../services/bookings.js'
import { getExperiences } from '../../services/experiences.js'
import { formatINR, formatDate } from '../../utils/format.js'
import Spinner from '../../components/ui/Spinner.jsx'

// New bookings page for hosts — shows incoming traveller bookings
export default function HostBookings() {
  const { data: bookings, loading } = useApi(() => getHostBookings(1), [])
  const { data: earnings } = useApi(() => getHostEarnings(1), [])
  const { data: listings } = useApi(() => getExperiences({}), [])

  // Map experience_id to experience details
  const getExperience = (id) => listings?.find((l) => l.id === id)

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">New Bookings</h1>
          <p className="text-sm text-stone-500">Travellers who have booked your experiences</p>
        </div>
        {earnings?.total > 0 && (
          <div className="rounded-lg bg-green-50 px-4 py-2 text-right">
            <p className="text-xs text-green-600">Total earnings</p>
            <p className="text-lg font-bold text-green-700">{formatINR(earnings.total)}</p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="mt-8"><Spinner label="Loading bookings…" /></div>
      ) : bookings && bookings.length > 0 ? (
        <div className="mt-6 space-y-4">
          {bookings.map((b) => {
            const exp = getExperience(b.experience_id)
            return (
              <div key={b.id} className="card flex flex-wrap items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👤</span>
                    <div>
                      <p className="font-semibold text-stone-800">{b.traveller_name || 'Guest'}</p>
                      <p className="text-sm text-stone-500">
                        {exp ? exp.title : `Experience #${b.experience_id}`}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-stone-500">
                    <span>📅 {b.slot_time ? formatDate(b.slot_time) : b.date || 'Date TBD'}</span>
                    <span>👥 Group of {b.group_size || b.guests || 1}</span>
                    {b.amount > 0 && <span>💰 {formatINR(b.amount)}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                    b.status === 'confirmed'
                      ? 'bg-green-50 text-green-700'
                      : b.status === 'completed'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-amber-50 text-amber-700'
                  }`}>
                    {b.status}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="mt-8 card text-center py-12">
          <p className="text-4xl">📭</p>
          <p className="mt-3 text-lg font-semibold text-stone-700">No bookings yet</p>
          <p className="mt-1 text-sm text-stone-500">
            When travellers book your experiences, they'll appear here.
          </p>
        </div>
      )}
    </div>
  )
}
