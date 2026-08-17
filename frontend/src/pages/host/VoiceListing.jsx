import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import LanguagePicker from '../../components/voice/LanguagePicker.jsx'
import VoiceRecorder from '../../components/voice/VoiceRecorder.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import { structureListing } from '../../services/voice.js'

// ============================================================================
// F1 — THE DEMO MOMENT ⭐
// ----------------------------------------------------------------------------
// Host taps mic → speaks in Hindi/Gujarati → "processing…" → a structured
// listing card appears (ListingReview). One call (audio → Gemini → JSON).
// Fallback chain: live → cached → fixture lives inside services/voice.js.
// ============================================================================

export default function VoiceListing() {
  const navigate = useNavigate()
  const [lang, setLang] = useState('hi')
  const [phase, setPhase] = useState('idle') // idle | processing | error
  const [errorMsg, setErrorMsg] = useState('')

  const handleComplete = async ({ wavBlob, durationSec }) => {
    setPhase('processing')
    try {
      // One call: audio + language → structured listing JSON.
      // (Mock-mode returns the fixture; the real Gemini call swaps in behind
      // the same function signature when the backend ships.)
      const listing = await structureListing(wavBlob, lang)
      // Stash a copy so the review page survives a refresh (location.state lost)
      sessionStorage.setItem('voice_listing', JSON.stringify(listing))
      navigate('/host/voice/review', { state: { listing } })
    } catch (e) {
      console.error('Voice structuring failed:', e)
      setErrorMsg('We could not read your recording. Please try again — or use the manual form.')
      setPhase('error')
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-stone-800">Create your listing by voice</h1>
      <p className="mt-1 text-sm text-stone-500">
        Speak naturally — what you offer, what you charge, when you're free. We'll turn it into a card you can edit.
      </p>

      <div className="card mt-6">
        <LanguagePicker value={lang} onChange={setLang} />
        <VoiceRecorder onComplete={handleComplete} onError={(msg) => { setErrorMsg(msg); setPhase('error') }} />

        {phase === 'processing' && (
          <div className="mt-4 rounded-lg bg-brand-light p-6 text-center">
            <Spinner label="Reading your words… building your listing" />
            <p className="mt-2 text-xs text-stone-500">This is the moment — voice becomes a card.</p>
          </div>
        )}

        {phase === 'error' && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p>{errorMsg}</p>
            <div className="mt-3 flex gap-3">
              <button className="btn-secondary" onClick={() => { setPhase('idle'); setErrorMsg('') }}>
                Try again
              </button>
              <Link to="/host/manual" className="btn-ghost">Use the manual form instead</Link>
            </div>
          </div>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-stone-400">
        Demo pipeline: audio → Gemini → structured JSON (one call). The optional live-transcript sugar is not on the
        critical path.
      </p>
    </div>
  )
}
