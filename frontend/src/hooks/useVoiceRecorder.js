import { useEffect, useRef, useState } from 'react'
import { blobToWav } from '../utils/audio.js'

// ============================================================================
// F1 — microphone capture hook
// ----------------------------------------------------------------------------
// status: idle | recording | processing | done | error
// start()  → requests mic, begins MediaRecorder
// stop()   → stops, transcodes WebM → WAV (16 kHz mono), resolves { wavBlob }
// The WAV blob is what services/voice.structureListing() sends to Gemini.
// ============================================================================

export function useVoiceRecorder() {
  const [status, setStatus] = useState('idle')
  const [durationSec, setDurationSec] = useState(0)
  const [error, setError] = useState(null)

  const recorderRef = useRef(null)
  const streamRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const durationRef = useRef(0)

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const stopTracks = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  useEffect(() => {
    return () => {
      clearTimer()
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop()
      }
      stopTracks()
    }
  }, [])

  const start = async () => {
    setError(null)
    setDurationSec(0)
    durationRef.current = 0
    chunksRef.current = []
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : ''
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorderRef.current = rec
      rec.start()
      setStatus('recording')
      timerRef.current = setInterval(() => {
        durationRef.current += 1
        setDurationSec(durationRef.current)
      }, 1000)
    } catch (e) {
      console.error('Mic error:', e)
      setError('Microphone unavailable or permission denied. Please allow mic access, or use the manual form instead.')
      setStatus('error')
    }
  }

  // Resolves with { wavBlob, webmBlob, durationSec } once transcode completes
  const stop = () =>
    new Promise((resolve, reject) => {
      const rec = recorderRef.current
      if (!rec || rec.state === 'inactive') {
        reject(new Error('No active recording'))
        return
      }
      clearTimer()
      setStatus('processing')
      rec.onstop = async () => {
        try {
          const webmBlob = new Blob(chunksRef.current, { type: rec.mimeType || 'audio/webm' })
          const wavBlob = await blobToWav(webmBlob)
          stopTracks()
          setStatus('done')
          resolve({ wavBlob, webmBlob, durationSec: durationRef.current })
        } catch (e) {
          console.error('Transcode error:', e)
          stopTracks()
          setError('Could not process the recording. Please try again or use the manual form.')
          setStatus('error')
          reject(e)
        }
      }
      rec.stop()
    })

  const reset = () => {
    setStatus('idle')
    setError(null)
    setDurationSec(0)
    durationRef.current = 0
  }

  return { status, durationSec, error, start, stop, reset }
}
