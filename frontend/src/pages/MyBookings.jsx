import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { getExperienceById } from '../services/experiences.js'

const LS_KEY = 'padaav_bookings'

function getBookings() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]')
  } catch {
    return []
  }
}

function cancelBooking(id) {
  const all = getBookings().filter((b) => b.id !== id)
  localStorage.setItem(LS_KEY, JSON.stringify(all))
  return all
}

export default function MyBookings() {
  const { user } = useApp()
  const location = useLocation()
  const [bookings, setBookings] = useState([])
  const [experiences, setExperiences] = useState({})
  const [tab, setTab] = useState('upcoming')

  // Re-read localStorage every time the page is visited (location.key changes on navigation)
  useEffect(() => {
    const all = getBookings().filter((b) => b.traveller_name === (user?.name || 'Demo traveller'))
    setBookings(all)

    // Fetch experience details for each booking
    const ids = [...new Set(all.map((b) => b.experience_id))]
    Promise.all(ids.map((id) => getExperienceById(id))).then((results) => {
      const map = {}
      results.forEach((exp) => { if (exp) map[exp.id] = exp })
      setExperiences(map)
    })
  }, [user, location.key])

  const now = new Date()
  const upcoming = bookings.filter((b) => new Date(b.slot_time) >= now && b.status !== 'cancelled')
  const past = bookings.filter((b) => new Date(b.slot_time) < now || b.status === 'cancelled')
  const displayed = tab === 'upcoming' ? upcoming : past

  const handleCancel = (id) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    const updated = cancelBooking(id)
    setBookings(updated.filter((b) => b.traveller_name === (user?.name || 'Demo traveller')))
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="mb-4 text-5xl">🔒</div>
        <h1 className="mb-2 text-2xl font-bold text-stone-800">Login required</h1>
        <p className="mb-6 text-sm text-stone-500">Please log in to view your bookings.</p>
        <Link to="/login" className="btn-primary">Login</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-stone-800">My Bookings</h1>

      {/* Tabs */}
      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={() => setTab('upcoming')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            tab === 'upcoming'
              ? 'bg-amber-600 text-white'
              : 'border border-stone-300 bg-white text-stone-600 hover:border-amber-400'
          }`}
        >
          Upcoming ({upcoming.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('past')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            tab === 'past'
              ? 'bg-amber-600 text-white'
              : 'border border-stone-300 bg-white text-stone-600 hover:border-amber-400'
          }`}
        >
          Past ({past.length})
        </button>
      </div>

      {displayed.length === 0 && (
        <div className="card text-center py-12">
          <div className="mb-4 text-5xl">{tab === 'upcoming' ? '📅' : '📜'}</div>
          <h2 className="mb-2 text-lg font-semibold text-stone-800">
            {tab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings'}
          </h2>
          <p className="mb-4 text-sm text-stone-500">
            {tab === 'upcoming'
              ? 'Search for a city to discover and book experiences.'
              : 'Your completed bookings will appear here.'}
          </p>
          {tab === 'upcoming' && (
            <Link to="/search" className="btn-primary">🔍 Search experiences</Link>
          )}
        </div>
      )}

      <div className="space-y-4">
        {displayed.map((booking) => {
          const exp = experiences[booking.experience_id]
          const isCancelled = booking.status === 'cancelled'
          const isPast = new Date(booking.slot_time) < now

          return (
            <div
              key={booking.id}
              className={`card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${isCancelled ? 'opacity-60' : ''}`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-stone-800">
                    {exp?.title || `Experience #${booking.experience_id}`}
                  </h3>
                  {isCancelled && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">
                      Cancelled
                    </span>
                  )}
                  {!isCancelled && !isPast && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
                      Confirmed
                    </span>
                  )}
                  {!isCancelled && isPast && (
                    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600">
                      Completed
                    </span>
                  )}
                </div>
                <p className="text-sm text-stone-500">
                  📍 {exp?.village_name || 'Unknown'} · 👥 {booking.group_size} person{booking.group_size > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-stone-500">
                  🗓 {new Date(booking.slot_time).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                  {' at '}
                  {new Date(booking.slot_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
                {exp && (
                  <p className="mt-1 text-xs text-stone-400">
                    🧑 {exp.host?.name || 'Host'} · ₹{exp.price} × {booking.group_size} = ₹{exp.price * booking.group_size}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {exp && !isCancelled && !isPast && (
                  <Link
                    to={`/itinerary/${booking.id}`}
                    state={{ experience: exp, booking }}
                    className="rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-200"
                  >
                    📋 Day Plan
                  </Link>
                )}
                {exp && !isCancelled && !isPast && (
                  <Link
                    to={`/experience/${exp.id}`}
                    className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-600 hover:border-amber-400"
                  >
                    View
                  </Link>
                )}
                {!isCancelled && !isPast && (
                  <button
                    type="button"
                    onClick={() => handleCancel(booking.id)}
                    className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
