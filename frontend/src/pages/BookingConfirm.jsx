import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApi } from '../hooks/useApi.js'
import { getExperienceById } from '../services/experiences.js'
import { createBooking } from '../services/bookings.js'
import { useApp } from '../context/AppContext.jsx'
import SlotPicker from '../components/booking/SlotPicker.jsx'
import BookingSummary from '../components/booking/BookingSummary.jsx'
import UpiPayment from '../components/booking/UpiPayment.jsx'
import Spinner from '../components/ui/Spinner.jsx'

// F11 — select date/slot/group → summary → UPI (simulated) → booking created.
export default function BookingConfirm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useApp()
  const { data: exp, loading } = useApi(() => getExperienceById(id), [id])
  const [slot, setSlot] = useState(null)
  const [creating, setCreating] = useState(false)

  if (loading) return <div className="mx-auto max-w-3xl px-4 py-16"><Spinner label="Loading…" /></div>
  if (!exp) return <div className="mx-auto max-w-3xl px-4 py-16"><p className="card text-red-600">Experience not found.</p></div>

  const total = (exp.price || 0) * (slot?.groupSize || 1)

  const confirm = async () => {
    setCreating(true)
    const booking = await createBooking({
      experience_id: exp.id,
      slot_time: `${slot.date}T${slot.slot}`,
      group_size: slot.groupSize,
      traveller_name: user?.name || 'Demo traveller',
    })
    navigate(`/itinerary/${booking.id}`, { state: { experience: exp, booking } })
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-stone-800">Book your slot</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <div className="card">
            <h2 className="mb-4 font-semibold text-stone-800">Choose date & time</h2>
            <SlotPicker
              availability={exp.availability}
              capacity={exp.capacity}
              onChange={setSlot}
            />
          </div>
          <BookingSummary experience={exp} slot={slot} />
        </div>

        <div>
          <UpiPayment
            hostName={exp.host?.name}
            upiId={exp.host?.upi_id}
            amount={total}
            onPaid={confirm}
          />
          <p className="mt-3 text-center text-xs text-stone-400">
            {creating ? 'Creating your booking…' : 'Demo: payment is simulated — the QR goes live in the roadmap.'}
          </p>
        </div>
      </div>
    </div>
  )
}
