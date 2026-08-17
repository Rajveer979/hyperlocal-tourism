import { useState } from 'react'
import { formatTime } from '../../utils/format.js'

const TYPE_STYLE = {
  experience: 'bg-brand-light text-brand-dark border-orange-200',
  poi: 'bg-blue-50 text-blue-700 border-blue-200',
  travel: 'bg-stone-100 text-stone-500 border-stone-200',
}

const TYPE_LABEL = { experience: 'Booked', poi: 'Heritage', travel: 'Travel' }

// F12 — the generated day plan, rendered as a vertical timeline.
// Suggestions can be removed; swaps come with the AI teammate's endpoint.
export default function Timeline({ steps }) {
  const [hidden, setHidden] = useState([])

  const visible = steps.filter((s) => !hidden.includes(s.place + s.time))

  return (
    <ol className="relative space-y-6 border-l-2 border-dashed border-brand/40 pl-6">
      {visible.map((step) => (
        <li key={step.place + step.time} className="relative">
          <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-brand bg-white" />
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-bold text-brand-dark">{formatTime(step.time)}</span>
                <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${TYPE_STYLE[step.type] || TYPE_STYLE.travel}`}>
                  {TYPE_LABEL[step.type] || step.type}
                </span>
              </div>
              <p className="mt-1 font-semibold text-stone-800">{step.place}</p>
              <p className="text-sm text-stone-500">{step.note}</p>
            </div>
            <button
              type="button"
              className="text-xs text-stone-400 hover:text-red-600"
              onClick={() => setHidden((h) => [...h, step.place + step.time])}
            >
              Remove
            </button>
          </div>
        </li>
      ))}
      {hidden.length > 0 && (
        <li>
          <button type="button" className="btn-ghost text-xs" onClick={() => setHidden([])}>
            ↺ Restore removed stops
          </button>
        </li>
      )}
    </ol>
  )
}
