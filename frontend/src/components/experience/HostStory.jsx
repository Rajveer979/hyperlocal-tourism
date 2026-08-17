// F6 — the cheapest emotional upgrade: photo + one line of personal history.
export default function HostStory({ host }) {
  if (!host) return null
  return (
    <div className="card flex items-center gap-4">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-light to-amber-100 text-3xl">
        {host.photo_url ? <img src={host.photo_url} alt={host.name} className="h-full w-full rounded-full object-cover" /> : '👵'}
      </div>
      <div>
        <p className="font-semibold text-stone-800">{host.name}</p>
        <p className="text-sm italic text-stone-500">“{host.story}”</p>
        <p className="mt-1 text-xs text-stone-400">
          {host.village} · UPI: {host.upi_id}
        </p>
      </div>
    </div>
  )
}
