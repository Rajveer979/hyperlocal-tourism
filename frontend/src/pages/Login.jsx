import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { DEMO_CREDENTIALS } from '../utils/constants.js'

// F22 — demo only. Hardcoded logins per the plan; no signup flow on stage.
export default function Login() {
  const { login } = useApp()
  const navigate = useNavigate()
  const [role, setRole] = useState('host')
  const [username, setUsername] = useState(DEMO_CREDENTIALS.host.username)
  const [password, setPassword] = useState(DEMO_CREDENTIALS.host.password)

  const submit = (e) => {
    e.preventDefault()
    const u = login(role)
    navigate(u.role === 'admin' ? '/admin' : u.role === 'host' ? '/host/dashboard' : '/')
  }

  const pick = (r) => {
    setRole(r)
    setUsername(DEMO_CREDENTIALS[r].username)
    setPassword(DEMO_CREDENTIALS[r].password)
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="card">
        <h1 className="text-2xl font-bold text-stone-800">Login</h1>
        <p className="mt-1 text-sm text-stone-500">Demo accounts — one tap, no signup flow on stage.</p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {['host', 'traveller', 'admin'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => pick(r)}
              className={`rounded-lg border px-3 py-2 text-sm capitalize ${
                role === r ? 'border-brand bg-brand-light font-semibold text-brand-dark' : 'border-stone-300 text-stone-600'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <label className="label">Username</label>
            <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary w-full">Login</button>
        </form>
      </div>
    </div>
  )
}
