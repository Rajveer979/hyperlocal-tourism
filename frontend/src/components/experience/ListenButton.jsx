import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis.js'

// F14 — voice OUT. Reads the listing aloud in the listing's language.
export default function ListenButton({ text, language = 'hi', label = 'Listen to this listing' }) {
  const { speak, stop, speaking, supported } = useSpeechSynthesis()
  if (!supported) return null
  return (
    <button
      type="button"
      className={speaking ? 'btn-secondary' : 'btn-ghost'}
      onClick={() => (speaking ? stop() : speak(text, language))}
    >
      {speaking ? '⏹ Stop' : '🔊'} {label}
    </button>
  )
}
