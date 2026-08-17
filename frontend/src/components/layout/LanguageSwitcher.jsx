import { useApp } from '../../context/AppContext.jsx'

// UI language for shared chrome (nav, hero). Page content stays English for
// now — full UI translation is a later pass per the amended plan.
export default function LanguageSwitcher() {
  const { lang, setLang } = useApp()
  return (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value)}
      className="rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-sm text-stone-600 focus:border-brand focus:outline-none"
      aria-label="UI language"
    >
      <option value="en">EN</option>
      <option value="hi">हिंदी</option>
      <option value="gu">ગુજરાતી</option>
    </select>
  )
}
