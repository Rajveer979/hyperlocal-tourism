import { useCallback, useEffect, useRef, useState } from 'react'

// Manages the service worker for offline map tiles.
// Returns { online, cacheSize, caching, cacheCorridor }.
export default function useOfflineMaps() {
  const [online, setOnline] = useState(navigator.onLine)
  const [cacheSize, setCacheSize] = useState(null)
  const [caching, setCaching] = useState(false)
  const swRef = useRef(null)

  // Register service worker
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        swRef.current = reg
        console.log('[SW] Registered:', reg.scope)
      })
      .catch((err) => {
        console.warn('[SW] Registration failed:', err)
      })
  }, [])

  // Track online/offline status
  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  // Check cache size
  const refreshCacheSize = useCallback(async () => {
    try {
      const cache = await caches.open('osm-tiles-v1')
      const keys = await cache.keys()
      setCacheSize(keys.length)
    } catch {
      setCacheSize(null)
    }
  }, [])

  useEffect(() => {
    refreshCacheSize()
  }, [refreshCacheSize])

  // Pre-cache corridor tiles on demand
  const cacheCorridor = useCallback(async () => {
    setCaching(true)
    try {
      // The service worker install event pre-caches, but we can also
      // trigger a manual cache warm by fetching key tiles
      const tiles = []
      for (const z of [9, 11]) {
        const n = Math.pow(2, z)
        for (let x = 0; x < n; x++) {
          for (let y = 0; y < n; y++) {
            const n2 = Math.pow(2, z)
            const lat = (Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n2))) * 180) / Math.PI
            const lng = (x / n2) * 360 - 180
            if (lat >= 21.5 && lat <= 26.5 && lng >= 71.0 && lng <= 75.5) {
              tiles.push(`https://a.tile.openstreetmap.org/${z}/${x}/${y}.png`)
            }
          }
        }
      }

      const cache = await caches.open('osm-tiles-v1')
      let done = 0
      // Fetch in batches of 10 to avoid overwhelming the network
      for (let i = 0; i < tiles.length; i += 10) {
        const batch = tiles.slice(i, i + 10)
        await Promise.allSettled(
          batch.map(async (url) => {
            try {
              const resp = await fetch(url)
              if (resp.ok) await cache.put(url, resp)
            } catch (_) {}
            done++
          })
        )
      }
      await refreshCacheSize()
    } finally {
      setCaching(false)
    }
  }, [refreshCacheSize])

  return { online, cacheSize, caching, cacheCorridor }
}
