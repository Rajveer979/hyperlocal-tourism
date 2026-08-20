import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

const guideIcon = L.divIcon({
  className: '',
  html: `<div style="background:#3b82f6;color:white;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:12px;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)">🧭</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

export default function GuidePin({ guide }) {
  return (
    <Marker position={[guide.lat, guide.lng]} icon={guideIcon}>
      <Popup>
        <div className="min-w-[180px] text-sm">
          <p className="font-semibold text-stone-800">{guide.name}</p>
          <p className="text-xs text-stone-500">{guide.specialty}</p>
          <p className="text-xs text-amber-600">⭐ {guide.rating} · {guide.experience_count} tours</p>
          <p className="mt-1 text-xs text-stone-400">📍 {guide.village_name}</p>
        </div>
      </Popup>
    </Marker>
  )
}
