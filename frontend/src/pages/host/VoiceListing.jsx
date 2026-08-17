import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import LanguagePicker from '../../components/voice/LanguagePicker.jsx'
import VoiceRecorder from '../../components/voice/VoiceRecorder.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis.js'
import { structureListing } from '../../services/voice.js'

// ============================================================================
// F1 — THE DEMO MOMENT ⭐
// ----------------------------------------------------------------------------
// Host taps mic → speaks in Hindi/Gujarati → "processing…" → a structured
// listing card appears (ListingReview). One call (audio → Gemini → JSON).
// Fallback chain: live → cached → fixture lives inside services/voice.js.
//
// Follow-up round: if the host never mentioned a critical number (price,
// duration, capacity), the backend answers with a spoken question in the
// host's language. The host records a short reply, and the AI merges it into
// the draft. Max MAX_ROUNDS rounds, then the review form lets them finish.
// ============================================================================

const MAX_ROUNDS = 2

export default function VoiceListing() {
  const navigate = useNavigate()
  const [lang, setLang] = useState('hi')
  const [phase, setPhase] = useState('idle') // idle | processing | followup | error
  const [errorMsg, setErrorMsg] = useState('')
  const [envelope, setEnvelope] = useState(null) // {listing, missing, question}
  const [round, setRound] = useState(0)
  const { speak, stop: stopSpeech, speaking, supported } = useSpeechSynthesis()

  const goToReview = (listing) => {
    // Stash a copy so the review page survives a refresh (location.state lost)
    sessionStorage.setItem('voice_listing', JSON.stringify(listing))
    navigate('/host/voice/review', { state: { listing } })
  }

  const handleComplete = async ({ wavBlob }) => {
    setPhase('processing')
    try {
      // First call: fresh extraction. Follow-up calls: merge the reply into
      // the draft (previous) so already-correct fields are never re-guessed.
      const result = await structureListing(wavBlob, lang, {
        previous: envelope?.missing?.length ? envelope.listing : null,
      })
      if (result.missing?.length && round < MAX_ROUNDS) {
        setEnvelope(result)
        setRound((r) => r + 1)
        setPhase('followup')
        return
      }
      goToReview(result.listing)
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
        <VoiceRecorder key={round} onComplete={handleComplete} onError={(msg) => { setErrorMsg(msg); setPhase('error') }} />

        {phase === 'processing' && (
          <div className="mt-4 rounded-lg bg-brand-light p-6 text-center">
            <Spinner label={envelope ? 'Reading your answer… merging it in' : 'Reading your words… building your listing'} />
            <p className="mt-2 text-xs text-stone-500">This is the moment — voice becomes a card.</p>
          </div>
        )}

        {phase === 'followup' && envelope?.question && (
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand-light/50 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-dark">
                  One quick question
                </p>
                <p className="mt-1 text-lg font-semibold text-stone-800">{envelope.question}</p>
              </div>
              {supported && (
                <button
                  type="button"
                  className="btn-secondary shrink-0 text-sm"
                  onClick={() => (speaking ? stopSpeech() : speak(envelope.question, lang))}
                >
                  {speaking ? '⏹ Stop' : '🔊 Listen'}
                </button>
              )}
            </div>
            <p className="mt-3 text-sm text-stone-600">
              Just answer out loud — tap the mic and say it, e.g. <em>“teen sau rupaye”</em>. Then we'll finish your card.
            </p>
            <div className="mt-2">
              <button
                type="button"
                className="btn-ghost text-sm"
                onClick={() => goToReview(envelope.listing)}
              >
                Skip — I'll set it in the form
              </button>
            </div>
          </div>
        )}

        {phase === 'error' && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p>{errorMsg}</p>
            <div className="mt-3 flex gap-3">
              <button className="btn-secondary" onClick={() => { setPhase(envelope?.missing?.length ? 'followup' : 'idle'); setErrorMsg('') }}>
                Try again
              </button>
              <Link to="/host/manual" className="btn-ghost">Use the manual form instead</Link>
            </div>
          </div>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-stone-400">
        Demo pipeline: audio → Gemini → structured JSON (one call). If a number is missing, we ask one spoken question.
      </p>
    </div>
  )
}
