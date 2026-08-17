import { useState } from 'react'
import { CATEGORIES, LANGUAGES } from '../../utils/constants.js'

// F16 language-match · F17 women-hosted · F21 keyword + category filters
export default function FilterBar({ onChange }) {
  const [filters, setFilters] = useState({ category: 'all', maxPrice: '', womenHosted: false, language: 'all', q: '' })

  const update = (patch) => {
    const next = { ...filters, ...patch }
    setFilters(next)
    onChange(next)
  }

  return (
    <div className="card flex flex-wrap items-end gap-3">
      <div>
        <label className="label">Category</label>
        <select className="input w-44" value={filters.category} onChange={(e) => update({ category: e.target.value })}>
          <option value="all">All</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.emoji} {c.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Max price (₹)</label>
        <input
          type="number"
          min="0"
          className="input w-32"
          placeholder="e.g. 500"
          value={filters.maxPrice}
          onChange={(e) => update({ maxPrice: e.target.value })}
        />
      </div>
      <div>
        <label className="label">Language spoken</label>
        <select className="input w-40" value={filters.language} onChange={(e) => update({ language: e.target.value })}>
          <option value="all">Any</option>
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </div>
      <label className="flex cursor-pointer items-center gap-2 pb-2 text-sm text-stone-600">
        <input
          type="checkbox"
          className="h-4 w-4 accent-brand"
          checked={filters.womenHosted}
          onChange={(e) => update({ womenHosted: e.target.checked })}
        />
        👩 Women-hosted only
      </label>
      <div className="ml-auto">
        <label className="label">Search</label>
        <input
          type="text"
          className="input w-56"
          placeholder="village, food, pottery…"
          value={filters.q}
          onChange={(e) => update({ q: e.target.value })}
        />
      </div>
    </div>
  )
}
