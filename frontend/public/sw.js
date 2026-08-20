// Service Worker — Offline Map Tiles for F9 Explore
// -------------------------------------------------
// Caches OpenStreetMap tiles for the Ahmedabad-Udaipur corridor so the map
// works without network. Tiles are fetched on-demand and cached permanently
// in the Cache API (CDN-friendly: OSM allows tile caching per their TOU).
//
// Coverage: zoom levels 7-12 covering lat 22.5-25.5, lng 72.0-74.5
// (the full corridor with generous padding).

const CACHE_NAME = 'osm-tiles-v1'
const TILE_PATTERN = /tile\.openstreetmap\.org/

// Corridor bounds for the Ahmedabad-Udaipur route
const BOUNDS = { latMin: 22.5, latMax: 25.5, lngMin: 72.0, lngMax: 74.5 }
const ZOOM_MIN = 7
const ZOOM_MAX = 12

// Convert tile x,y,z to lat/lng (slippy map math)
function tileToLatLng(x, y, z) {
  const n = Math.pow(2, z)
  const lat = (Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n))) * 180) / Math.PI
  const lng = (x / n) * 360 - 180
  return { lat, lng }
}

function isInCorridor(x, y, z) {
  if (z < ZOOM_MIN || z > ZOOM_MAX) return false
  const center = tileToLatLng(x, y, z)
  return (
    center.lat >= BOUNDS.latMin - 1 &&
    center.lat <= BOUNDS.latMax + 1 &&
    center.lng >= BOUNDS.lngMin - 1 &&
    center.lng <= BOUNDS.lngMax + 1
  )
}

// Install: warm the cache with corridor tiles at key zoom levels
self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Pre-cache a small set at zoom 9 (good overview) and 11 (village detail)
      for (const z of [9, 11]) {
        const n = Math.pow(2, z)
        for (let x = 0; x < n; x++) {
          for (let y = 0; y < n; y++) {
            if (isInCorridor(x, y, z)) {
              const url = `https://a.tile.openstreetmap.org/${z}/${x}/${y}.png`
              try {
                await cache.add(url)
              } catch (_) {
                // Network fail during install is OK — tiles will be fetched on-demand
              }
            }
          }
        }
      }
    })
  )
})

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch: cache-first for corridor tiles, network-first for everything else
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Only intercept OSM tile requests
  if (!TILE_PATTERN.test(url.hostname)) return

  // Parse z/x/y from the URL path
  const parts = url.pathname.split('/')
  const z = parseInt(parts[1])
  const x = parseInt(parts[2])
  const y = parseInt(parts[3])

  // Only cache tiles within our corridor
  if (!isInCorridor(x, y, z)) return

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200) return response

        // Clone before caching (response body can only be consumed once)
        const toCache = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, toCache)
        })
        return response
      }).catch(() => {
        // Offline + not in cache: return a transparent 1x1 PNG
        return new Response(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQABNjN9GQAAAABJRU5ErkJggg==',
          {
            headers: { 'Content-Type': 'image/png' },
            status: 200,
          }
        )
      })
    })
  )
})
