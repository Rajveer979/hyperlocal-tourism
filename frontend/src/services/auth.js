// ============================================================================
// Auth service (F22) — signup, login, forgot/reset password.
// MOCK_MODE (default): accounts live in localStorage so the app runs with
// zero backend. Live mode: calls the FastAPI endpoints frozen in the contract.
// Demo logins work in both modes (seeded server-side, hardcoded client-side).
// ============================================================================

import { isLive, request, delay } from './api.js'
import { DEMO_CREDENTIALS } from '../utils/constants.js'

const MOCK_USERS_KEY = 'mock_users'
const MOCK_RESET_KEY = 'mock_reset_tokens' // { token: email }

// Demo account profiles (match the seeded backend users + DEMO_CREDENTIALS).
const DEMO_PROFILES = {
  'host@demo': { name: 'Kamlaben', role: 'host' },
  'traveller@demo': { name: 'Aarav', role: 'traveller' },
  'admin@demo': { name: 'Admin', role: 'admin' },
}

function getMockUsers() {
  try {
    return JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]')
  } catch {
    return []
  }
}

function saveMockUsers(users) {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users))
}

function getMockResets() {
  try {
    return JSON.parse(localStorage.getItem(MOCK_RESET_KEY) || '{}')
  } catch {
    return {}
  }
}

function mockDemoUser(username, password) {
  const profile = DEMO_PROFILES[username]
  const creds = profile && DEMO_CREDENTIALS[profile.role]
  if (!profile || !creds || password !== creds.password) return null
  return {
    token: `mock-${Date.now()}`,
    role: profile.role,
    user: { id: profile.role === 'traveller' ? 7 : profile.role === 'host' ? 1 : 8, name: profile.name, email: username, role: profile.role },
  }
}

// Remember logins locally so the mock users list can show "who logged in".
function markMockLogin(email) {
  localStorage.setItem(`mock_last_login_${email}`, new Date().toISOString())
}

export async function login(username, password) {
  if (!isLive('auth')) {
    await delay(300)
    const demo = mockDemoUser(username, password)
    if (demo) {
      markMockLogin(demo.user.email)
      return demo
    }
    const u = getMockUsers().find((u) => u.email === username && u.password === password)
    if (!u) throw new Error('Invalid email or password')
    const { password: _pw, ...safe } = u
    markMockLogin(u.email)
    return { token: `mock-${Date.now()}`, role: u.role, user: safe }
  }
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export async function signup(data) {
  if (!isLive('auth')) {
    await delay(400)
    const users = getMockUsers()
    if (users.some((u) => u.email === data.email)) throw new Error('An account with this email already exists')
    const user = {
      id: Date.now(),
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      role: data.role,
      language_preference: data.language_preference || 'hi',
    }
    users.push({ ...user, password: data.password })
    saveMockUsers(users)
    return { token: `mock-${Date.now()}`, role: user.role, user }
  }
  return request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}


