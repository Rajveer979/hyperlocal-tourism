import { formatDate, formatTime, formatINR } from '../../utils/format.js'

export default function BookingSummary({ experience, slot, groupSize }) {
  return (
    <div className="card space-y-1 text-sm text-stone-600">
      <p className="font-semibold text-stone-800">{experience.title}</p>
      <p>📍 {experience.village_name} · {experience.host?.name}</p>
      {slot?.date && slot?.slot && (
        <p>
          🗓 {formatDate(slot.date)} at {formatTime(slot.slot)}
        </p>
      )}
      <p>👥 {slot?.groupSize || groupSize || 1} person(s)</p>
      <p className="text-base font-bold text-brand-dark">{formatINR((experience.price || 0) * (slot?.groupSize || groupSize || 1))}</p>
    </div>
  )
}
