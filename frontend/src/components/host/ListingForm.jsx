import { useState } from 'react'
import { CATEGORIES, LANGUAGES, WEEK_DAYS } from '../../utils/constants.js'

// Shared by ListingReview (voice prefill) and ManualListing (F3 typed fallback).
// `initial` carries the voice-JSON shape (or an empty template).
export default function ListingForm({ initial = {}, onPublish }) {
  const [form, setForm] = useState({
    host_name: initial.host_name || '',
    village_name: initial.village_name || '',
    title: initial.title || '',
    description: initial.description || '',
    category: initial.category || 'food',
    price: initial.price || '',
    duration_minutes: initial.duration_minutes || '',
    capacity: initial.capacity || '',
    village_name: initial.village_name || '',
    days: initial.availability?.days || [],
    slots: (initial.availability?.slots || []).join(', '),
    max_per_slot: initial.availability?.max_per_slot || 8,
    languages: initial.languages || ['hi'],
    women_hosted: false,
  })

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  const toggleDay = (day) =>
    set({ days: form.days.includes(day) ? form.days.filter((d) => d !== day) : [...form.days, day] })

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
      duration_minutes: Number(form.duration_minutes) || 60,
      capacity: Number(form.capacity) || 6,
      availability: {
        days: form.days,
        slots: form.slots.split(',').map((s) => s.trim()).filter(Boolean),
        max_per_slot: Number(form.max_per_slot) || 8,
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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <label className="label">Category</label>
          <select className="input" value={form.category} onChange={(e) => set({ category: e.target.value })}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Price (₹)</label>
          <input type="number" min="0" className="input" value={form.price} onChange={(e) => set({ price: e.target.value })} />
        </div>
        <div>
          <label className="label">Duration (min)</label>
          <input type="number" min="15" className="input" value={form.duration_minutes} onChange={(e) => set({ duration_minutes: e.target.value })} />
        </div>
        <div>
          <label className="label">Capacity</label>
          <input type="number" min="1" className="input" value={form.capacity} onChange={(e) => set({ capacity: e.target.value })} />
        </div>
      </div>
      <div>
        <label className="label">Available days</label>
        <div className="flex flex-wrap gap-2">
          {WEEK_DAYS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => toggleDay(d)}
              className={`rounded-lg border px-3 py-1.5 text-sm ${
                form.days.includes(d) ? 'border-brand bg-brand-light text-brand-dark' : 'border-stone-300 text-stone-500'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Time slots (comma-separated, e.g. 10:00, 13:00)</label>
          <input className="input" value={form.slots} onChange={(e) => set({ slots: e.target.value })} />
        </div>
        <div>
          <label className="label">Max per slot</label>
          <input type="number" min="1" className="input" value={form.max_per_slot} onChange={(e) => set({ max_per_slot: e.target.value })} />
        </div>
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
