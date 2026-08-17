import { useCallback, useEffect, useRef, useState } from 'react'
import { TTS_VOICE_LANG } from '../utils/constants.js'

// ============================================================================
// F14 — "Listen to this listing" (voice OUT — completes the accessibility story)
// Browser SpeechSynthesis API: free, no key, works offline for most voices.
// ============================================================================

export function useSpeechSynthesis() {
  const [speaking, setSpeaking] = useState(false)
  const [supported] = useState(() => typeof window !== 'undefined' && 'speechSynthesis' in window)
  const voiceRef = useRef(null)

  useEffect(() => {
    if (!supported) return
    const loadVoices = () => {
      window.speechSynthesis.getVoices()
    }
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
    return () => {
      window.speechSynthesis.cancel()
    }
  }, [supported])

  const speak = useCallback(
    (text, lang = 'hi') => {
      if (!supported || !text) return
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      const voiceLang = TTS_VOICE_LANG[lang] || 'hi-IN'
      const voices = window.speechSynthesis.getVoices()
      const voice = voices.find((v) => v.lang.replace('_', '-') === voiceLang) || null
      if (voice) utterance.voice = voice
      else utterance.lang = voiceLang
      utterance.rate = 0.95
      utterance.onend = () => setSpeaking(false)
      utterance.onerror = () => setSpeaking(false)
      setSpeaking(true)
      window.speechSynthesis.speak(utterance)
    },
    [supported],
  )

  const stop = useCallback(() => {
    if (supported) window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [supported])

  return { speak, stop, speaking, supported }
}
