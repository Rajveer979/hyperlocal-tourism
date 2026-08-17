import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext.jsx'

export default function HostHome() {
  const { user } = useApp()

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-stone-800">Host on Hyperlocal Tourism</h1>
      <p className="mt-2 text-stone-600">
        You speak, we build your listing. No English, no forms, no typing — just your voice.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="card text-center">
          <div className="text-4xl">🎙️</div>
          <h2 className="mt-2 font-semibold text-stone-800">1. Speak</h2>
          <p className="mt-1 text-sm text-stone-500">Describe your food, craft or walk in your own language.</p>
        </div>
        <div className="card text-center">
          <div className="text-4xl">✨</div>
          <h2 className="mt-2 font-semibold text-stone-800">2. Review</h2>
          <p className="mt-1 text-sm text-stone-500">We turn your words into a structured listing — you check it.</p>
        </div>
        <div className="card text-center">
          <div className="text-4xl">📅</div>
          <h2 className="mt-2 font-semibold text-stone-800">3. Get booked</h2>
          <p className="mt-1 text-sm text-stone-500">Travellers pay you directly by UPI. No platform cut.</p>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link to="/host/voice" className="btn-primary text-base">
          🎙️ Create a listing by voice
        </Link>
        <Link to="/host/manual" className="btn-secondary">
          ⌨️ Or type it (manual form)
        </Link>
        {user?.role === 'host' && (
          <Link to="/host/dashboard" className="btn-secondary">
            📊 My dashboard
          </Link>
        )}
      </div>
    </div>
  )
}
