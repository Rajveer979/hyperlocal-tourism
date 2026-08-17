import { LANGUAGES } from '../../utils/constants.js'

// The language the HOST speaks in — the recording language, not the UI language.
// Demo default: Hindi (hi), per the team decision.
const RECORDING_LANGS = ['hi', 'gu', 'mr', 'ta', 'bn', 'en']

export default function LanguagePicker({ value, onChange }) {
  return (
    <div>
      <label className="label">I will speak in</label>
      <select
        className="input w-48"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Recording language"
      >
        {RECORDING_LANGS.map((code) => {
          const l = LANGUAGES.find((x) => x.code === code)
          return (
            <option key={code} value={code}>
              {l?.label || code}
            </option>
          )
        })}
      </select>
    </div>
  )
}
