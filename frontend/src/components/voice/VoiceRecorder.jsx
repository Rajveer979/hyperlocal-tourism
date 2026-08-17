import { useEffect } from 'react'
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder.js'

// F1 — tap the mic, speak in your own language. `onComplete` receives the WAV
// blob (ready for services/voice.structureListing) — the parent owns the
// "processing → card appears" moment.
export default function VoiceRecorder({ onComplete, onError }) {
  const { status, durationSec, error, start, stop, reset } = useVoiceRecorder()

  useEffect(() => {
    if (error) onError?.(error)
  }, [error, onError])

  const handleStop = async () => {
    try {
      const { wavBlob, durationSec: secs } = await stop()
      onComplete?.({ wavBlob, durationSec: secs })
    } catch (e) {
      onError?.(e.message || 'Recording failed')
    }
  }

  const fmt = (s) => `0:${String(Math.floor(s / 60))}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <button
        type="button"
        onClick={status === 'recording' ? handleStop : start}
        disabled={status === 'processing'}
        className={`relative flex h-28 w-28 items-center justify-center rounded-full text-5xl shadow-lg transition-transform ${
          status === 'recording'
            ? 'animate-pulse bg-red-100 ring-8 ring-red-200'
            : 'bg-brand-light ring-8 ring-brand/20 hover:scale-105'
        }`}
        aria-label={status === 'recording' ? 'Stop recording' : 'Start recording'}
      >
        {status === 'recording' ? '⏹' : '🎙️'}
      </button>

      <div className="text-center">
        {status === 'idle' && <p className="text-sm text-stone-500">Tap the mic and describe your experience — food, craft, walk, anything.</p>}
        {status === 'recording' && <p className="font-mono text-lg font-bold text-red-600">{fmt(durationSec)}</p>}
        {status === 'processing' && <p className="text-sm text-stone-500">Processing your words…</p>}
        {status === 'done' && <p className="text-sm text-green-700">Recording captured ✓</p>}
      </div>

      {status !== 'idle' && status !== 'recording' && (
        <button type="button" className="btn-ghost text-sm" onClick={reset}>
          ↺ Record again
        </button>
      )}
    </div>
  )
}
