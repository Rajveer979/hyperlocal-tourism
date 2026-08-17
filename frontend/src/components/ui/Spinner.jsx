export default function Spinner({ label }) {
  return (
    <div className="flex items-center justify-center gap-2 text-stone-500">
      <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-stone-300 border-t-brand" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  )
}
