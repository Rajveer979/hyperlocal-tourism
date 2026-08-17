import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// Leaflet + OpenStreetMap — free, no API key, no billing (plan decision).
// Children render RouteLayer / ExperiencePin markers inside this container.
export default function MapView({ center, zoom = 8, className = '', children }) {
  return (
    <div className={`overflow-hidden rounded-xl border border-stone-200 ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {children}
      </MapContainer>
    </div>
  )
}
