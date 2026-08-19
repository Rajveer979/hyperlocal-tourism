import { createContext, useContext, useMemo, useState } from 'react'
import en from '../i18n/en.json'
import hi from '../i18n/hi.json'
import gu from '../i18n/gu.json'
import { login as apiLogin, signup as apiSignup } from '../services/auth.js'

const translations = { en, hi, gu }

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

  // Persist token + user from any auth payload ({token, role, user}).
  const storeSession = (payload) => {
    localStorage.setItem('app_token', payload.token)
    localStorage.setItem('app_user', JSON.stringify(payload.user))
    setUser(payload.user)
    return payload.user
  }

  // expectedRole (optional): when set, the logged-in account MUST be that
  // role — otherwise the login is rejected (used by the demo role chips).
  const login = async (username, password, expectedRole = null) => {
    const payload = await apiLogin(username, password)
    if (expectedRole && payload.user.role !== expectedRole) {
      throw new Error(`Only ${expectedRole} accounts can log in here — tap the chip again to remove the filter.`)
    }
    return storeSession(payload)
  }

  const signup = async (data) => {
    const payload = await apiSignup(data)
    return storeSession(payload)
  }

  const logout = () => {
    localStorage.removeItem('app_token')
    localStorage.removeItem('app_user')
    setUser(null)
  }

  const setLang = (code) => {
    setLangState(code)
    localStorage.setItem('app_lang', code)
  }

  const t = (key) => translations[lang]?.[key] ?? translations.en[key] ?? key

  const value = useMemo(
    () => ({ user, login, signup, logout, lang, setLang, t }),
    [user, lang, t],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}
