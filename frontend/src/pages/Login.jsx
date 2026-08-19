import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { emailError, emailSuggestion } from '../utils/validate.js'

// F22 — login / signup (demo accounts kept as one-tap shortcuts;
// real accounts work against the backend).
export default function Login() {
  const { login, signup } = useApp()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')

  // login state
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // signup state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [role, setRole] = useState('traveller')

  const [busy, setBusy] = useState(false)
  const [filterRole, setFilterRole] = useState(null)
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const afterAuth = (u) => navigate(u.role === 'admin' ? '/admin' : u.role === 'host' ? '/host/dashboard' : '/')

  const pickRole = (role) => {
    setFilterRole(role)
    setError(null)
  }

  const submitLogin = async (e) => {
    e.preventDefault()
    setError(null)
    if (!filterRole) {
      setError('Select a role first — tap Host, Traveller, or Admin.')
      return
    }
    setBusy(true)
    try {
      afterAuth(await login(username, password, filterRole))
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  const submitSignup = async (e) => {
    e.preventDefault()
    const err = emailError(email)
    if (err) {
      setFieldErrors({ email: err })
      return
    }
    setFieldErrors({})
    setBusy(true); setError(null)
    try {
      afterAuth(await signup({ name, email: email.trim(), phone, password: signupPassword, role, language_preference: 'hi' }))
    } catch (err) {
      setError(err.message || 'Signup failed')
    } finally {
      setBusy(false)
    }
  }

  const tab = (m, label) => (
    <button
      type="button"
      onClick={() => { setMode(m); setError(null) }}
      className={`rounded-lg border px-3 py-2 text-sm font-medium capitalize ${
        mode === m ? 'border-brand bg-brand-light text-brand-dark' : 'border-stone-300 text-stone-600'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="card">
        <h1 className="text-2xl font-bold text-stone-800">
          {mode === 'login' ? 'Login' : 'Create account'}
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          {mode === 'login'
            ? 'Hosts and travellers both sign in here.'
            : 'Join as a host or a traveller — takes 30 seconds.'}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {tab('login', 'Login')}
          {tab('signup', 'Sign up')}
        </div>

        {mode === 'login' && (
          <>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {['host', 'traveller', 'admin'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => pickRole(r)}
                  className={`rounded-lg border px-3 py-2 text-sm capitalize ${
                    filterRole === r ? 'border-brand bg-brand-light font-semibold text-brand-dark' : 'border-stone-300 text-stone-600'
                  }`}
                >
                  {r === 'traveller' ? '🧳 Traveller' : r === 'host' ? '🏡 Host' : '🛡️ Admin'}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-stone-400">
              {filterRole
                ? `Only ${filterRole} accounts can log in now.`
                : 'Select one of the three roles to log in, then enter your email and password.'}
            </p>

            <form onSubmit={submitLogin} className="mt-5 space-y-4">
              <div>
                <label className="label">Email</label>
                <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="off" />
              </div>
              <div>
                <label className="label">Password</label>
                <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="off" />
              </div>
              <p className="text-xs text-stone-400">Forgot password?</p>
              <button type="submit" className="btn-primary w-full" disabled={busy}>{busy ? 'Logging in…' : 'Login'}</button>
            </form>
          </>
        )}

        {mode === 'signup' && (
          <form onSubmit={submitSignup} className="mt-5 space-y-4" noValidate>
            <div>
              <label className="label">Full name</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className={`input ${fieldErrors.email ? 'border-red-400' : ''}`}
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors({}) }}
                placeholder="name@gmail.com"
                required
              />
              {emailSuggestion(email) && (
                <p className="mt-1 text-xs text-stone-500">
                  Did you mean{' '}
                  <button type="button" className="text-brand-dark font-medium underline" onClick={() => setEmail(emailSuggestion(email))}>
                    {emailSuggestion(email)}
                  </button>
                  ?
                </p>
              )}
              {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
            </div>
            <div>
              <label className="label">Phone (optional)</label>
              <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="label">Password (min 6 characters)</label>
              <input type="password" className="input" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} minLength={6} required />
            </div>
            <div>
              <label className="label">I am a…</label>
              <div className="grid grid-cols-2 gap-2">
                {['traveller', 'host'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`rounded-lg border px-3 py-2 text-sm capitalize ${role === r ? 'border-brand bg-brand-light font-semibold text-brand-dark' : 'border-stone-300 text-stone-600'}`}
                  >
                    {r === 'traveller' ? '🧳 Traveller' : '🏡 Host'}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
          </form>
        )}

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  )
}
