import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { Link } from 'react-router-dom'
import { formatINR } from '../../utils/format.js'

// Custom divIcon — avoids the classic Leaflet default-icon bundler bug.
function pinIcon(emoji, price) {
  return L.divIcon({
    className: '',
    html: `<div class="flex flex-col items-center">
        <div class="flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs font-bold shadow-md ring-1 ring-stone-200">
          <span>${emoji}</span><span>${price}</span>
        </div>
        <div class="h-0 w-0 border-x-8 border-t-8 border-x-transparent border-t-white drop-shadow"></div>
      </div>`,
    iconSize: [64, 34],
    iconAnchor: [32, 34],
    popupAnchor: [0, -34],
  })
}

export default function ExperiencePin({ experience }) {
  if (!experience.lat || !experience.lng) return null
  const cat = experience.category === 'food' ? '🍲' : experience.category === 'craft' ? '🎨' : '🏛️'
  const icon = pinIcon(cat, formatINR(experience.price))
  return (
    <Marker position={[experience.lat, experience.lng]} icon={icon}>
      <Popup>
        <div className="w-44">
          <p className="font-semibold">{experience.title}</p>
          <p className="text-xs text-stone-500">{experience.village_name}</p>
          <Link to={`/experience/${experience.id}`} className="mt-1 inline-block text-xs font-semibold text-brand-dark">
            View listing →
          </Link>
        </div>
      </Popup>
    </Marker>
  )
}
