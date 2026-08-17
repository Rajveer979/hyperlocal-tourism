export default function Badge({ color = 'stone', children, className = '' }) {
  const colors = {
    stone: 'bg-stone-100 text-stone-600 border-stone-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    orange: 'bg-brand-light text-brand-dark border-orange-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${colors[color]} ${className}`}
    >
      {children}
    </span>
  )
}
