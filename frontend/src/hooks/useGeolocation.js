import { useCallback, useEffect, useRef, useState } from 'react'

// Browser geolocation hook.
// Returns { lat, lng, loading, error, supported, refresh }.
// watch=true keeps position updated as user moves.
export default function useGeolocation({ watch = false } = {}) {
  const [pos, setPos] = useState({ lat: null, lng: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const watchId = useRef(null)
  const supported = typeof navigator !== 'undefined' && 'geolocation' in navigator

  const handleSuccess = useCallback((crd) => {
    setPos({ lat: crd.latitude, lng: crd.longitude })
    setLoading(false)
    setError(null)
  }, [])

  const handleError = useCallback((err) => {
    setLoading(false)
    setError(err.message || 'Location access denied')
  }, [])

  const refresh = useCallback(() => {
    if (!supported) return
    setLoading(true)
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    })
  }, [supported, handleSuccess, handleError])

  useEffect(() => {
    if (!supported) {
      setLoading(false)
      setError('Geolocation not supported')
      return
    }
    refresh()

    if (watch) {
      watchId.current = navigator.geolocation.watchPosition(handleSuccess, handleError, {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 120000,
      })
    }

    return () => {
      if (watchId.current != null) {
        navigator.geolocation.clearWatch(watchId.current)
      }
    }
  }, [supported, watch]) // eslint-disable-line react-hooks/exhaustive-deps

  return { ...pos, loading, error, supported, refresh }
}
