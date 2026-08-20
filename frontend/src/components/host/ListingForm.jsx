import { useState, useRef } from 'react'
import { LANGUAGES } from '../../utils/constants.js'

// Shared by ListingReview (voice prefill) and ManualListing (F3 typed fallback).
// `initial` carries the voice-JSON shape (or an empty template).
export default function ListingForm({ initial = {}, onPublish, saving = false }) {
  const [form, setForm] = useState({
    host_name: initial.host_name || '',
    village_name: initial.village_name || '',
    title: initial.title || '',
    description: initial.description || '',
    price: initial.price || '',
    days: initial.availability?.days || [],
    languages: initial.languages || ['hi'],
    women_hosted: false,
    photos: initial.photos || [],
  })

  const [previewUrls, setPreviewUrls] = useState([])
  const fileInputRef = useRef(null)

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  const toggleLang = (code) =>
    set({
      languages: form.languages.includes(code)
        ? form.languages.filter((l) => l !== code)
        : [...form.languages, code],
    })

  const handlePhotos = (files) => {
    const newPhotos = [...form.photos]
    const newPreviews = [...previewUrls]
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue
      // Store the File object for upload, keep a preview URL
      newPhotos.push(file)
      newPreviews.push(URL.createObjectURL(file))
    }
    set({ photos: newPhotos })
    setPreviewUrls(newPreviews)
  }

  const removePhoto = (index) => {
    const newPhotos = form.photos.filter((_, i) => i !== index)
    const newPreviews = previewUrls.filter((_, i) => i !== index)
    set({ photos: newPhotos })
    setPreviewUrls(newPreviews)
  }

  const submit = (e) => {
    e.preventDefault()
    // Separate File objects from URL strings
    const photoFiles = form.photos.filter((p) => p instanceof File)
    const photoUrls = form.photos.filter((p) => typeof p === 'string')
    onPublish({
      ...form,
      price: Number(form.price) || 0,
      availability: {
        days: form.days,
      },
      _photoFiles: photoFiles,     // frontend-only, for upload after create
      photos: photoUrls,           // URLs only go to the API
    })
  }

  return (
    <form onSubmit={submit} className="card space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Host name</label>
          <input className="input" placeholder="e.g. Kamlaben" value={form.host_name} onChange={(e) => set({ host_name: e.target.value })} />
        </div>
        <div>
          <label className="label">Village / town</label>
          <input className="input" placeholder="e.g. Himmatnagar" value={form.village_name} onChange={(e) => set({ village_name: e.target.value })} />
        </div>
      </div>
      <div>
        <label className="label">Title *</label>
        <input className="input" value={form.title} onChange={(e) => set({ title: e.target.value })} required />
      </div>
      <div>
        <label className="label">Description *</label>
        <textarea
          className="input min-h-28"
          value={form.description}
          onChange={(e) => set({ description: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="label">Price (₹)</label>
        <input type="number" min="0" className="input" value={form.price} onChange={(e) => set({ price: e.target.value })} />
      </div>

      {/* ── Photo upload (F5) ──────────────────────────────────────────── */}
      <div>
        <label className="label">Photos</label>
        <p className="mb-2 text-xs text-stone-400">Add photos of your experience — the first photo becomes the cover.</p>

        {/* Preview grid */}
        {previewUrls.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {previewUrls.map((url, i) => (
              <div key={i} className="relative h-20 w-20 overflow-hidden rounded-lg border border-stone-200">
                <img src={url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white shadow"
                >
                  ✕
                </button>
                {i === 0 && (
                  <span className="absolute bottom-0 left-0 w-full bg-black/60 text-center text-[10px] text-white">Cover</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Upload area */}
        <div
          className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 py-6 text-stone-400 transition-colors hover:border-brand hover:bg-brand-light/30"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
          onDrop={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handlePhotos(Array.from(e.dataTransfer.files))
          }}
        >
          <span className="text-2xl">📷</span>
          <p className="mt-1 text-sm">Click or drag photos here</p>
          <p className="text-xs">JPG, PNG — up to 5 MB each</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            handlePhotos(Array.from(e.target.files))
            e.target.value = '' // reset so same file can be re-selected
          }}
        />
      </div>

      <div>
        <label className="label">Languages I speak</label>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => toggleLang(l.code)}
              className={`rounded-lg border px-3 py-1.5 text-sm ${
                form.languages.includes(l.code) ? 'border-brand bg-brand-light text-brand-dark' : 'border-stone-300 text-stone-500'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-stone-600">
        <input type="checkbox" className="h-4 w-4 accent-brand" checked={form.women_hosted} onChange={(e) => set({ women_hosted: e.target.checked })} />
        I run this experience as a women-hosted offering
      </label>
      <button type="submit" className="btn-primary w-full" disabled={saving}>
        {saving ? 'Publishing…' : 'Publish listing'}
      </button>
    </form>
  )
}
