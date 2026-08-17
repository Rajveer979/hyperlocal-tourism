import { useMemo, useState } from 'react'
import { formatTime } from '../../utils/format.js'

// F11 — pick a date, a slot from the host's availability, and group size.
export default function SlotPicker({ availability, capacity, onChange }) {
  const [date, setDate] = useState('')
  const [slot, setSlot] = useState('')
  const [groupSize, setGroupSize] = useState(1)

  const today = useMemo(() => new Date().toISOString().split('T')[0], [])
  const slots = availability?.slots || []

  const update = (patch) => {
    const next = { date: patch.date ?? date, slot: patch.slot ?? slot, groupSize: patch.groupSize ?? groupSize }
    setDate(next.date)
    setSlot(next.slot)
    setGroupSize(next.groupSize)
    onChange?.(next)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="label">Date</label>
        <input type="date" min={today} className="input" value={date} onChange={(e) => update({ date: e.target.value })} />
      </div>
      <div>
        <label className="label">Time slot</label>
        <div className="flex flex-wrap gap-2">
          {slots.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => update({ slot: s })}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                slot === s ? 'border-brand bg-brand-light text-brand-dark' : 'border-stone-300 bg-white text-stone-600 hover:border-brand'
              }`}
            >
              {formatTime(s)}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label">Group size (max {capacity || 8})</label>
        <div className="flex items-center gap-3">
          <button type="button" className="btn-secondary px-3" onClick={() => update({ groupSize: Math.max(1, groupSize - 1) })}>
            −
          </button>
          <span className="w-8 text-center font-semibold">{groupSize}</span>
          <button
            type="button"
            className="btn-secondary px-3"
            onClick={() => update({ groupSize: Math.min(capacity || 8, groupSize + 1) })}
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}
