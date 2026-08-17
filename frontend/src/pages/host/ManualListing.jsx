import { useNavigate } from 'react-router-dom'
import ListingForm from '../../components/host/ListingForm.jsx'

// F3 — the typed fallback. Always available; voice is never forced.
export default function ManualListing() {
  const navigate = useNavigate()

  const publish = (values) => {
    console.log('Publishing manual listing:', values)
    navigate('/host/dashboard', { state: { published: true } })
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-stone-800">Create a listing manually</h1>
      <p className="mt-1 mb-6 text-sm text-stone-500">
        Prefer typing? Fill the form below. (Voice works too, whenever you like.)
      </p>
      <ListingForm onPublish={publish} />
    </div>
  )
}
