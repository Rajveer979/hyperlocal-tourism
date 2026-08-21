import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useApi } from '../hooks/useApi.js'
import { useApp } from '../context/AppContext.jsx'
import { getExperienceById } from '../services/experiences.js'
import Spinner from '../components/ui/Spinner.jsx'

export default function BookingConfirm() {
  const { id } = useParams()
  const { user } = useApp()
  const { data: exp, loading } = useApi(() => getExperienceById(id), [id])
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [groupSize, setGroupSize] = useState(1)
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  if (loading) return <div className="mx-auto max-w-3xl px-4 py-16"><Spinner label="Loading…" /></div>
  if (!exp) return <div className="mx-auto max-w-3xl px-4 py-16"><p className="card text-red-600">Experience not found.</p></div>

  const total = (exp.price || 0) * groupSize

  // Available time slots (from experience or defaults)
  const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']

  const today = new Date().toISOString().split('T')[0]
  const canConfirm = date && time && name.trim().length > 0

  const handleConfirm = () => {
    if (!canConfirm) return
    // Save booking to localStorage
    const LS_KEY = 'padaav_bookings'
    const existing = JSON.parse(localStorage.getItem(LS_KEY) || '[]')
    const booking = {
      id: Date.now(),
      experience_id: exp.id,
      traveller_name: user?.name || name || 'Traveller',
      slot_time: `${date}T${time}`,
      group_size: groupSize,
      status: 'confirmed',
      created_at: new Date().toISOString(),
    }
    existing.push(booking)
    localStorage.setItem(LS_KEY, JSON.stringify(existing))
    setConfirmed(true)
  }

  // --- Confirmed screen ---
  if (confirmed) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="card mx-auto max-w-md space-y-6 p-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-5xl">
            ✅
          </div>
          <h1 className="text-2xl font-bold text-green-700">Booking Confirmed!</h1>
          <div className="space-y-2 text-left text-sm text-stone-600">
            <p><span className="font-semibold text-stone-800">Experience:</span> {exp.title}</p>
            <p><span className="font-semibold text-stone-800">Location:</span> {exp.village_name}</p>
            <p><span className="font-semibold text-stone-800">Date:</span> {date}</p>
            <p><span className="font-semibold text-stone-800">Time:</span> {time}</p>
            <p><span className="font-semibold text-stone-800">Group size:</span> {groupSize} person{groupSize > 1 ? 's' : ''}</p>
            <p><span className="font-semibold text-stone-800">Total:</span> ₹{total}</p>
            <p><span className="font-semibold text-stone-800">Host:</span> {exp.host?.name || 'N/A'}</p>
            <p><span className="font-semibold text-stone-800">Booked by:</span> {name}</p>
          </div>
          <div className="rounded-lg bg-green-50 p-3 text-xs text-green-700">
            📞 The host {exp.host?.name} will contact you on <span className="font-semibold">{phone || 'your provided number'}</span> to confirm details.
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              to={`/itinerary/${Date.now()}`}
              state={{ experience: exp, booking: { slot_time: `${date}T${time}`, group_size: groupSize } }}
              className="flex-1 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 text-center"
            >
              📋 View Day Plan
            </Link>
            <Link to="/bookings" className="btn-primary flex-1 text-center">My Bookings</Link>
            <Link to="/" className="btn-secondary flex-1 text-center">Home</Link>
          </div>
        </div>
      </div>
    )
  }

  // --- Booking form ---
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-stone-800">Book your experience</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left: form */}
        <div className="space-y-6">
          {/* Experience summary */}
          <div className="card">
            <h2 className="mb-2 font-semibold text-stone-800">{exp.title}</h2>
            <p className="text-sm text-stone-500">📍 {exp.village_name}</p>
          </div>

          {/* Your details */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-stone-800">Your details</h2>
            <div>
              <label className="label">Your name *</label>
              <input
                className="input w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="label">Phone number</label>
              <input
                className="input w-full"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
          </div>

          {/* Date & time */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-stone-800">Choose date & time</h2>
            <div>
              <label className="label">Date *</label>
              <input
                type="date"
                min={today}
                className="input w-full"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Time slot *</label>
              <div className="flex flex-wrap gap-2">
                {timeSlots.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTime(t)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                      time === t
                        ? 'border-amber-600 bg-amber-50 text-amber-800'
                        : 'border-stone-300 bg-white text-stone-600 hover:border-amber-400'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Group size</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="rounded-lg border border-stone-300 px-3 py-1 text-lg font-bold hover:bg-stone-100"
                  onClick={() => setGroupSize(Math.max(1, groupSize - 1))}
                >
                  −
                </button>
                <span className="w-8 text-center text-lg font-semibold">{groupSize}</span>
                <button
                  type="button"
                  className="rounded-lg border border-stone-300 px-3 py-1 text-lg font-bold hover:bg-stone-100"
                  onClick={() => setGroupSize(Math.min(10, groupSize + 1))}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: summary + confirm */}
        <div className="space-y-6">
          <div className="card space-y-3">
            <h2 className="font-semibold text-stone-800">Booking summary</h2>
            <div className="space-y-2 text-sm text-stone-600">
              <div className="flex justify-between">
                <span>Price per person</span>
                <span className="font-medium">₹{exp.price || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Group size</span>
                <span className="font-medium">× {groupSize}</span>
              </div>
              <div className="border-t border-stone-200 pt-2">
                <div className="flex justify-between text-base font-bold text-stone-800">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>
            </div>
            {date && time && (
              <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
                📅 {date} at {time} · {groupSize} person{groupSize > 1 ? 's' : ''}
              </div>
            )}
          </div>

          <div className="card space-y-3">
            <h2 className="font-semibold text-stone-800">Host info</h2>
            <p className="text-sm text-stone-600">
              🧑 {exp.host?.name || 'Local host'}
              {exp.host?.is_women_hosted && (
                <span className="ml-2 rounded-full bg-pink-100 px-2 py-0.5 text-xs text-pink-700">Women hosted</span>
              )}
            </p>
            <p className="text-xs text-stone-400">
              You will pay the host directly. No platform fees.
            </p>
          </div>

          <button
            type="button"
            disabled={!canConfirm}
            onClick={handleConfirm}
            className={`w-full rounded-xl px-6 py-3 text-lg font-semibold transition ${
              canConfirm
                ? 'bg-green-600 text-white hover:bg-green-700 shadow-md'
                : 'cursor-not-allowed bg-stone-200 text-stone-400'
            }`}
          >
            {canConfirm ? `✅ Confirm Booking — ₹${total}` : 'Fill in all details to confirm'}
          </button>

          {!canConfirm && (
            <p className="text-center text-xs text-stone-400">
              {!name.trim() && 'Enter your name · '}
              {!date && 'Pick a date · '}
              {!time && 'Pick a time slot'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
