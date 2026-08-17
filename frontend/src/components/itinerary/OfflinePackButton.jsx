import { buildOfflinePack, savePackLocally } from '../../services/offline.js'
import Button from '../ui/Button.jsx'

// F15 — the demo moment: turn off Wi-Fi, the pack still opens.
export default function OfflinePackButton({ booking, experience, itinerary, host }) {
  const handleDownload = () => {
    const pack = buildOfflinePack({ booking, experience, itinerary, host })
    savePackLocally(pack)
  }
  return (
    <Button variant="secondary" onClick={handleDownload}>
      📥 Download offline pack
    </Button>
  )
}
