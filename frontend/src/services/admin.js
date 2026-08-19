// ============================================================================
// Admin service (F23) — currently: the users list (with last login).
// Mock mode combines the demo accounts + locally-signed-up accounts so the
// admin page works with zero backend.
// ============================================================================

import { isLive, request, delay } from './api.js'

const DEMO_USERS = [
  { id: 1, name: 'Kamlaben', email: 'host@demo', role: 'host' },
  { id: 7, name: 'Aarav', email: 'traveller@demo', role: 'traveller' },
  { id: 8, name: 'Admin', email: 'admin@demo', role: 'admin' },
]

function lastLogin(email) {
  return localStorage.getItem(`mock_last_login_${email}`) || null
}

function mockUsers() {
  let users = DEMO_USERS.map((u) => ({ ...u, last_login_at: lastLogin(u.email) }))
  try {
    const signedUp = JSON.parse(localStorage.getItem('mock_users') || '[]')
    users = users.concat(signedUp.map(({ password, ...u }) => ({ ...u, last_login_at: lastLogin(u.email) })))
  } catch {
    // ignore corrupt local storage
  }
  return users.sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
}

export async function getUsers() {
  if (!isLive('admin')) {
    await delay(250)
    return mockUsers()
  }
  return request('/admin/users')
}
