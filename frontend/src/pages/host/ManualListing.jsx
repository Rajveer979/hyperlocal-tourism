import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext.jsx'
import ListingForm from '../../components/host/ListingForm.jsx'
import { createExperience, uploadPhoto } from '../../services/experiences.js'

// F3 — the typed fallback. Always available; voice is never forced.
export default function ManualListing() {
  const navigate = useNavigate()
  const { user } = useApp()
  const [saving, setSaving] = useState(false)

  const publish = async (values) => {
    setSaving(true)
    try {
      const photoFiles = values._photoFiles || []
      const { _photoFiles, ...data } = values
      const created = await createExperience(data, user?.id || 0)
      // Upload photos one by one after listing is created
      for (const file of photoFiles) {
        try {
          await uploadPhoto(created.id, file)
        } catch (e) {
          console.warn('Photo upload failed:', e.message)
        }
      }
      navigate('/host/dashboard', { state: { published: true } })
    } catch (err) {
      alert('Publish failed: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-stone-800">Create a listing manually</h1>
      <p className="mt-1 mb-6 text-sm text-stone-500">
        Prefer typing? Fill the form below. (Voice works too, whenever you like.)
      </p>
      <ListingForm onPublish={publish} saving={saving} />
    </div>
  )
}
