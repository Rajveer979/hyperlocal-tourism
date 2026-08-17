import { useState } from 'react'

// F11 — payment is direct UPI to the HOST (near-zero platform cut).
// Demo: simulated — show the QR, mark as paid. Real integration is roadmap.
export default function UpiPayment({ hostName, upiId, amount, onPaid }) {
  const [paid, setPaid] = useState(false)

  return (
    <div className="card space-y-4">
      <h3 className="font-semibold text-stone-800">Pay directly to the host</h3>
      <div className="flex items-center gap-4">
        {/* Simulated QR — the backend will render a real QR later */}
        <div className="flex h-28 w-28 shrink-0 flex-wrap items-center justify-center gap-0.5 rounded-lg border-2 border-dashed border-stone-300 bg-white p-2">
          {Array.from({ length: 81 }).map((_, i) => (
            <span key={i} className={`h-1.5 w-1.5 rounded-[1px] ${(i * 7 + i * i) % 5 === 0 ? 'bg-stone-900' : 'bg-transparent'}`} />
          ))}
        </div>
        <div className="text-sm">
          <p className="text-stone-600">Pay {hostName}</p>
          <p className="font-mono text-stone-700">UPI ID: {upiId}</p>
          <p className="mt-1 text-lg font-bold text-brand-dark">₹{amount}</p>
          <p className="text-xs text-stone-400">100% reaches the host — no platform cut</p>
        </div>
      </div>
      {!paid ? (
        <button type="button" className="btn-primary w-full" onClick={() => setPaid(true)}>
          I have paid (demo)
        </button>
      ) : (
        <button type="button" className="btn-primary w-full" onClick={onPaid}>
          Confirm booking →
        </button>
      )}
    </div>
  )
}
