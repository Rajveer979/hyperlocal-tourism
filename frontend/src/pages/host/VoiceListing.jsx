import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import LanguagePicker from '../../components/voice/LanguagePicker.jsx'
import VoiceRecorder from '../../components/voice/VoiceRecorder.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis.js'
import { structureListing } from '../../services/voice.js'

// ============================================================================
// Detailed voice prompts — each includes a short label, a full example
// script the host can read, and a Hindi/vernacular equivalent.
// ============================================================================

const VOICE_PROMPTS = [
  {
    emoji: '🚶',
    label: 'Walking Tour',
    example:
      'I am Rahul and I take people on a walking tour of the old city of Jaipur. It is a 3-hour walk through the pink lanes. I charge ₹500 per person. I am available every morning from 8 to 11.',
    hindi:
      'मैं राहुल हूँ। मैं लोगों को जयपुर के पुराने शहर में वॉकिंग टूर कराता हूँ। यह 3 घंटे की वॉक है गुलाबी गलियों से। मैं ₹500 प्रति व्यक्ति लेता हूँ। मैं सुबह 8 से 11 बजे तक उपलब्ध हूँ।',
    tags: ['name', 'experience', 'duration', 'price', 'availability'],
  },
  {
    emoji: '🍛',
    label: 'Cooking Class',
    example:
      'I am Priya and I teach Rajasthani cooking at my home. The class is 2 hours long and we make dal baati churma and gatte ki sabzi. I charge ₹300 per person, minimum 4 people. I am free on weekends.',
    hindi:
      'मैं प्रिया हूँ। मैं घर पर राजस्थानी खाना सिखाती हूँ। क्लास 2 घंटे की है और हम दाल बाटी चूरमा और गट्टे की सब्ज़ी बनाते हैं। ₹300 प्रति व्यक्ति, कम से कम 4 लोग। मैं वीकेंड्स पर फ्री हूँ।',
    tags: ['name', 'experience', 'duration', 'price', 'capacity', 'availability'],
  },
  {
    emoji: '🎨',
    label: 'Art Workshop',
    example:
      'I am Arjun and I run a block-printing workshop. We use traditional Sanganeri blocks. The session is 3 hours and I charge ₹400 per person. I can take up to 8 people. I am available on Saturdays.',
    hindi:
      'मैं अर्जुन हूँ। मैं ब्लॉक-प्रिंटिंग वर्कशॉप चलाता हूँ। हम सांगानेरी ब्लॉक्स यूज़ करते हैं। सेशन 3 घंटे का है और मैं ₹400 प्रति व्यक्ति लेता हूँ। 8 लोग तक ले सकता हूँ। मैं शनिवार को उपलब्ध हूँ।',
    tags: ['name', 'experience', 'duration', 'price', 'capacity', 'availability'],
  },
  {
    emoji: '🧵',
    label: 'Craft / Tie-Dye',
    example:
      'I am Meera and I teach tie-dye and bandhani. The workshop is 2.5 hours. I charge ₹350 per person. I can host up to 6 people. I am free every Sunday and Wednesday.',
    hindi:
      'मैं मीरा हूँ। मैं टाई-डाई और बांधनी सिखाती हूँ। वर्कशॉप 2.5 घंटे की है। ₹350 प्रति व्यक्ति लेती हूँ। 6 लोग तक होस्ट कर सकती हूँ। मैं हर रविवार और बुधवार को फ्री हूँ।',
    tags: ['name', 'experience', 'duration', 'price', 'capacity', 'availability'],
  },
  {
    emoji: '🍜',
    label: 'Street Food Walk',
    example:
      'I am Imran and I take people on a street food tour. We visit 6 stalls in 2 hours. I charge ₹250 per person. I start at 6 PM near Hawa Mahal. I do this every Friday and Saturday.',
    hindi:
      'मैं इमरान हूँ। मैं लोगों को स्ट्रीट फ़ूड टूर पर ले जाता हूँ। 2 घंटे में 6 स्टॉल्स विज़िट करते हैं। ₹250 प्रति व्यक्ति। मैं हवा महल के पास 6 बजे से शुरू करता हूँ। हर शुक्रवार और शनिवार करता हूँ।',
    tags: ['name', 'experience', 'duration', 'price', 'availability'],
  },
  {
    emoji: '🏛️',
    label: 'Heritage Walk',
    example:
      'I am Sunita and I guide a heritage walk through the fort area. It is a 4-hour walk covering 5 monuments. I charge ₹600 per person. I am available on weekday mornings.',
    hindi:
      'मैं सुनीता हूँ। मैं फ़ोर्ट एरिया में हेरिटेज वॉक गाइड करती हूँ। यह 4 घंटे की वॉक है जिसमें 5 मॉन्यूमेंट्स कवर होते हैं। ₹600 प्रति व्यक्ति। मैं वीकडे सुबह उपलब्ध हूँ।',
    tags: ['name', 'experience', 'duration', 'price', 'availability'],
  },
  {
    emoji: '🎶',
    label: 'Music Session',
    example:
      'I am Kavi and I do a Rajasthani folk music session. It is 1.5 hours of langa and manganiyar songs. I charge ₹400 per person. I can host up to 15 people. I am available every evening.',
    hindi:
      'मैं कवि हूँ। मैं राजस्थानी फ़ोल्क म्यूज़िक सेशन करता हूँ। 1.5 घंटे के लांगा और मंगनियार गाने। ₹400 प्रति व्यक्ति। 15 लोग तक होस्ट कर सकता हूँ। मैं हर शाम उपलब्ध हूँ।',
    tags: ['name', 'experience', 'duration', 'price', 'capacity', 'availability'],
  },
  {
    emoji: '🐘',
    label: 'Village Visit',
    example:
      'I am Ramesh and I take tourists to my village for a half-day experience. We do pottery, watch folk dance, and eat a home-cooked meal. It costs ₹800 per person for 5 hours. I pick up from the city.',
    hindi:
      'मैं रमेश हूँ। मैं टूरिस्ट्स को अपने गाँव में हाफ-डे एक्सपीरियंस के लिए ले जाता हूँ। हम पॉटरी करते हैं, फ़ोल्क देखते हैं, और घर का खाना खाते हैं। ₹800 प्रति व्यक्ति, 5 घंटे। मैं शहर से पिकअप करता हूँ।',
    tags: ['name', 'experience', 'duration', 'price', 'availability'],
  },
]

const CHECKLIST_ITEMS = [
  { icon: '👋', text: 'Your name', hint: '"मैं राहुल हूँ..."' },
  { icon: '⭐', text: 'What you offer', hint: '"मैं लोगों को वॉकिंग टूर कराता हूँ..."' },
  { icon: '⏱️', text: 'How long it lasts', hint: '"यह 3 घंटे की है..."' },
  { icon: '💰', text: 'How much you charge', hint: '"मैं ₹500 प्रति व्यक्ति लेता हूँ..."' },
  { icon: '👥', text: 'Max people (optional)', hint: '"8 लोग तक ले सकता हूँ..."' },
  { icon: '📅', text: 'When you are free', hint: '"मैं हर शनिवार सुबह उपलब्ध हूँ..."' },
]

const FLOW_STEPS = [
  { step: 1, label: 'Speak', icon: '🎙️' },
  { step: 2, label: 'AI reads', icon: '🤖' },
  { step: 3, label: 'Card ready', icon: '✨' },
]

// ============================================================================
// F1 — THE DEMO MOMENT ⭐
// ============================================================================

const MAX_ROUNDS = 2

export default function VoiceListing() {
  const navigate = useNavigate()
  const [lang, setLang] = useState('hi')
  const [phase, setPhase] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [envelope, setEnvelope] = useState(null)
  const [round, setRound] = useState(0)
  const [expandedPrompt, setExpandedPrompt] = useState(null)
  const { speak, stop: stopSpeech, speaking, supported, voiceAvailable } = useSpeechSynthesis()

  const goToReview = (listing) => {
    sessionStorage.setItem('voice_listing', JSON.stringify(listing))
    navigate('/host/voice/review', { state: { listing } })
  }

  const handleComplete = async ({ wavBlob }) => {
    setPhase('processing')
    try {
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
      {/* ── Header ── */}
      <h1 className="text-2xl font-bold text-stone-800">Create your listing by voice</h1>
      <p className="mt-1 text-sm text-stone-500">
        Speak naturally — what you offer, what you charge, when you're free. We'll turn it into a card you can edit.
      </p>

      {/* ── Flow indicator ── */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {FLOW_STEPS.map((s, i) => (
          <div key={s.step} className="flex items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${
                phase === 'idle' && s.step === 1
                  ? 'bg-brand text-white shadow'
                  : phase === 'processing' && s.step === 2
                    ? 'bg-brand text-white shadow'
                    : 'bg-stone-100 text-stone-400'
              }`}
            >
              {s.icon}
            </div>
            <span className="ml-1 text-xs text-stone-500">{s.label}</span>
            {i < FLOW_STEPS.length - 1 && (
              <span className="mx-2 text-stone-300">→</span>
            )}
          </div>
        ))}
      </div>

      {/* ── Card: voice input ── */}
      <div className="card mt-6">
        <LanguagePicker value={lang} onChange={setLang} />
        {phase !== 'followup' && (
          <VoiceRecorder
            key={round}
            onComplete={handleComplete}
            onError={(msg) => {
              setErrorMsg(msg)
              setPhase('error')
            }}
          />
        )}

        {phase === 'processing' && (
          <div className="mt-4 rounded-lg bg-brand-light p-6 text-center">
            <Spinner
              label={
                envelope
                  ? 'Reading your answer… merging it in'
                  : 'Reading your words… building your listing'
              }
            />
            <p className="mt-2 text-xs text-stone-500">
              This is the moment — voice becomes a card.
            </p>
          </div>
        )}

        {phase === 'followup' && envelope?.question && (
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand-light/50 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-dark">
                  One quick question
                </p>
                <p className="mt-1 text-lg font-semibold text-stone-800">
                  {envelope.question}
                </p>
              </div>
              {supported && (
                <div className="shrink-0 text-right">
                  <button
                    type="button"
                    className="btn-secondary text-sm"
                    onClick={() => (speaking ? stopSpeech() : speak(envelope.question, lang))}
                  >
                    {speaking ? '⏹ Stop' : '🔊 Listen'}
                  </button>
                  {!voiceAvailable(lang) && (
                    <p className="mt-1 max-w-40 text-[11px] leading-tight text-stone-400">
                      {lang === 'hi' ? 'Hindi' : 'This language'} voice not installed on this device
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 rounded-lg border border-stone-200 bg-white p-4">
              <p className="text-center text-sm font-medium text-stone-700">
                🎤 Now answer out loud — tap the mic, say it, tap stop
              </p>
              <p className="mt-1 text-center text-xs text-stone-500">
                जैसे <em>"तीन सौ रुपये"</em> या <em>"आठ घंटे"</em>
              </p>
              <VoiceRecorder
                key={`answer-${round}`}
                onComplete={handleComplete}
                onError={(msg) => {
                  setErrorMsg(msg)
                  setPhase('error')
                }}
              />
            </div>

            <button
              type="button"
              className="btn-ghost text-sm"
              onClick={() => goToReview(envelope.listing)}
            >
              Skip — I'll set it in the form
            </button>
          </div>
        )}

        {phase === 'error' && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p>{errorMsg}</p>
            <div className="mt-3 flex gap-3">
              <button
                className="btn-secondary"
                onClick={() => {
                  setPhase(envelope?.missing?.length ? 'followup' : 'idle')
                  setErrorMsg('')
                }}
              >
                Try again
              </button>
              <Link to="/host/manual" className="btn-ghost">
                Use the manual form instead
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ── What to include guide ── */}
      {phase === 'idle' && (
        <div className="mt-8">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-lg">📋</span>
            <h2 className="text-sm font-semibold text-stone-700">
              What to include when you speak
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {CHECKLIST_ITEMS.map((item) => (
              <div
                key={item.text}
                className="flex flex-col gap-1 rounded-lg bg-stone-50 p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{item.icon}</span>
                  <span className="text-xs font-semibold text-stone-700">
                    {item.text}
                  </span>
                </div>
                <span className="text-[11px] leading-snug text-stone-400 italic">
                  {item.hint}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Example prompts ── */}
      {phase === 'idle' && (
        <div className="mt-8">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-lg">💡</span>
            <h2 className="text-sm font-semibold text-stone-700">
              Tap an example — read it, then speak your own version
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {VOICE_PROMPTS.map((p) => {
              const isExpanded = expandedPrompt === p.label
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setExpandedPrompt(isExpanded ? null : p.label)}
                  className={`group w-full rounded-xl border bg-white p-4 text-left shadow-sm transition-all ${
                    isExpanded
                      ? 'border-brand/50 shadow-md ring-1 ring-brand/20'
                      : 'border-stone-200 hover:border-brand/30 hover:shadow-md'
                  }`}
                >
                  {/* Collapsed header */}
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-light text-xl">
                      {p.emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-stone-800">
                        {p.label}
                      </p>
                      {!isExpanded && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-stone-400">
                          "{p.example}"
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-xs text-stone-400 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    >
                      ▼
                    </span>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="mt-4 space-y-3 border-t border-stone-100 pt-3">
                      {/* English example */}
                      <div>
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                          English example
                        </p>
                        <div className="rounded-lg bg-stone-50 p-3">
                          <p className="text-sm leading-relaxed text-stone-700">
                            "{p.example}"
                          </p>
                        </div>
                      </div>

                      {/* Hindi example */}
                      <div>
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                          हिंदी example
                        </p>
                        <div className="rounded-lg bg-stone-50 p-3">
                          <p className="text-sm leading-relaxed text-stone-700">
                            "{p.hindi}"
                          </p>
                        </div>
                      </div>

                      {/* Tags showing what fields are covered */}
                      <div className="flex flex-wrap gap-1.5">
                        {p.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-brand-light px-2 py-0.5 text-[10px] font-medium text-brand-dark"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <p className="text-center text-[11px] text-stone-400">
                        Now tap the 🎙️ mic and say your own version!
                      </p>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <p className="mt-8 text-center text-xs text-stone-400">
        Demo pipeline: audio → Gemini → structured JSON (one call). If a number is
        missing, we ask one spoken question.
      </p>
    </div>
  )
}
