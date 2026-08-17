// F20 — "What's included" checklist
export default function IncludedList({ included }) {
  if (!included) return null
  const items = [
    { key: 'meal', label: 'Meal' },
    { key: 'materials', label: 'Materials' },
    { key: 'transport', label: 'Transport' },
    { key: 'toilet', label: 'Toilet available' },
    { key: 'wheelchair', label: 'Wheelchair accessible' },
  ]
  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {items.map(({ key, label }) => (
        <li key={key} className="flex items-center gap-2 text-sm text-stone-600">
          <span className={included[key] ? 'text-green-600' : 'text-stone-300'}>
            {included[key] ? '✓' : '✗'}
          </span>
          {label}
        </li>
      ))}
    </ul>
  )
}
