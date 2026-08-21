import { useLocation } from 'react-router-dom'
import { useApp } from '../../context/AppContext.jsx'
import { useApi } from '../../hooks/useApi.js'
import { getHostBookings, getHostEarnings } from '../../services/bookings.js'
import { getExperiencesByHost } from '../../services/experiences.js'
import { formatINR, formatDate, formatTime } from '../../utils/format.js'
import ListenButton from '../../components/experience/ListenButton.jsx'
import Spinner from '../../components/ui/Spinner.jsx'

// F4 — bookings, earnings, availability. Numbers can be read aloud (F14).
export default function HostDashboard() {
  const location = useLocation()
  const justPublished = location.state?.published

  const { user } = useApp()
  const hostId = user?.id || 0
  const { data: bookings, loading } = useApi(() => getHostBookings(hostId), [hostId])
  const { data: earnings } = useApi(() => getHostEarnings(hostId), [hostId])
  const { data: listings } = useApi(() => getExperiencesByHost(hostId), [hostId])

  const summaryText = `You have ${earnings?.total || 0} rupees in total earnings. ${bookings?.length || 0} upcoming bookings.`

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {justPublished && (
        <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm text-green-700">
          ✅ Listing published! Travellers along your route can now find you.
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-stone-800">Host dashboard</h1>
        <ListenButton text={summaryText} language="hi" label="🔊 Read my numbers" />
      </div>

      {/* Earnings */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card">
          <p className="text-sm text-stone-500">Total earnings</p>
          <p className="text-2xl font-bold text-brand-dark">{formatINR(earnings?.total)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-stone-500">This month</p>
          <p className="text-2xl font-bold text-stone-800">{formatINR(earnings?.this_month)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-stone-500">Pending</p>
          <p className="text-2xl font-bold text-stone-800">{formatINR(earnings?.pending)}</p>
        </div>
      </div>

      {/* Upcoming bookings */}
      <h2 className="mt-10 mb-3 text-lg font-semibold text-stone-800">Upcoming bookings</h2>
      {loading ? (
        <Spinner label="Loading bookings…" />
      ) : (
        <div className="space-y-3">
          {bookings?.map((b) => (
            <div key={b.id} className="card flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-stone-800">{b.traveller_name} · group of {b.group_size}</p>
                <p className="text-sm text-stone-500">
                  {formatDate(b.slot_time)} at {formatTime(b.slot_time.split('T')[1]?.slice(0, 5) || '10:00')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${b.status === 'confirmed' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                  {b.status}
                </span>
                <span className="font-bold text-stone-700">{formatINR(b.amount)}</span>
              </div>
            </div>
          ))}
          {bookings?.length === 0 && <p className="card text-sm text-stone-400">No bookings yet.</p>}
        </div>
      )}

      {/* My listings (availability toggle) */}
      <h2 className="mt-10 mb-3 text-lg font-semibold text-stone-800">My listings</h2>
      <div className="space-y-3">          {(listings ?? []).length === 0 ? (
            <p className="card text-sm text-stone-400">No listings yet. Create one to get started!</p>
          ) : (
            (listings ?? []).map((l) => (
              <div key={l.id} className="card flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-stone-800">{l.title}</p>
                  <p className="text-sm text-stone-500">{l.village_name} · {formatINR(l.price)}</p>
                </div>
                <label className="flex items-center gap-2 text-sm text-stone-600">
                  <input type="checkbox" className="h-4 w-4 accent-brand" defaultChecked={l.is_active} />
                  Active
                </label>
              </div>
            ))
          )}
      </div>
    </div>
  )
}
