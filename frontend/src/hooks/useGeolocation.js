import { useEffect, useState } from 'react'

// Optional helper — not required for the demo. Used by Explore to center the
// map on the traveller if they allow it.
export function useGeolocation() {
  const [position, setPosition] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation not supported')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => setError(err.message),
      { timeout: 5000 },
    )
  }, [])

  return { position, error }
}
