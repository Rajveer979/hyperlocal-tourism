import { createContext, useContext, useMemo, useState } from 'react'
import en from '../i18n/en.json'
import hi from '../i18n/hi.json'
import gu from '../i18n/gu.json'

const translations = { en, hi, gu }

// Demo users (hardcoded per the plan — F22). Real auth comes with the backend.
export const DEMO_USERS = {
  host: { name: 'Kamlaben', role: 'host', phone: '+91 98765 43210' },
  traveller: { name: 'Aarav', role: 'traveller', phone: '+91 91234 56780' },
  admin: { name: 'Admin', role: 'admin', phone: '+91 90000 00000' },
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('app_user') || 'null')
    } catch {
      return null
    }
  })
  const [lang, setLangState] = useState(() => localStorage.getItem('app_lang') || 'en')

  const login = (role) => {
    const u = DEMO_USERS[role] || null
    setUser(u)
    localStorage.setItem('app_user', JSON.stringify(u))
    return u
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('app_user')
  }

  const setLang = (code) => {
    setLangState(code)
    localStorage.setItem('app_lang', code)
  }

  const t = (key) => translations[lang]?.[key] ?? translations.en[key] ?? key

  const value = useMemo(
    () => ({ user, login, logout, lang, setLang, t }),
    [user, lang, t],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}
