export default function FindGuideButton({ active, onClick, guideCount, loading }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? 'bg-blue-600 text-white shadow-md'
          : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
      }`}
    >
      🧭 {loading ? 'Loading…' : active ? `Hide Guides` : `Find a Guide`}
      {!loading && guideCount > 0 && !active && (
        <span className="rounded-full bg-blue-200 px-1.5 text-[10px] font-bold text-blue-800">
          {guideCount}
        </span>
      )}
    </button>
  )
}
