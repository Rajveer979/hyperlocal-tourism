import { useState } from 'react'
import { LANGUAGES } from '../../utils/constants.js'

// Shared by ListingReview (voice prefill) and ManualListing (F3 typed fallback).
// `initial` carries the voice-JSON shape (or an empty template).
export default function ListingForm({ initial = {}, onPublish }) {
  const [form, setForm] = useState({
    host_name: initial.host_name || '',
    village_name: initial.village_name || '',
    title: initial.title || '',
    description: initial.description || '',
    price: initial.price || '',
    days: initial.availability?.days || [],
    languages: initial.languages || ['hi'],
    women_hosted: false,
  })

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  const toggleLang = (code) =>
    set({
      languages: form.languages.includes(code)
        ? form.languages.filter((l) => l !== code)
        : [...form.languages, code],
    })

  const submit = (e) => {
    e.preventDefault()
    onPublish({
      ...form,
      price: Number(form.price) || 0,
      availability: {
        days: form.days,
      },
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
      <button type="submit" className="btn-primary w-full">
        Publish listing
      </button>
    </form>
  )
}
