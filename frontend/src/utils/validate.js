// Email validation — mirrors the backend rules in app/core/validation.py so
// the frontend gives the same friendly message before the API is even hit.

export const EMAIL_ERROR = 'Enter a valid email address (e.g. name@gmail.com)'

// Big providers people actually mistype; the suggestion feature only ever
// offers one of these.
const COMMON_DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'rediffmail.com', 'icloud.com', 'ymail.com']

const LOCAL_RE = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+$/
const LABEL_RE = /^[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/

export function isValidEmail(email) {
  if (!email || email.length > 254) return false
  const at = email.lastIndexOf('@')
  if (at < 1 || at === email.length - 1) return false

  const local = email.slice(0, at)
  const domain = email.slice(at + 1)
  if (local.length > 64) return false
  if (!LOCAL_RE.test(local) || local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false

  const labels = domain.split('.')
  if (labels.length < 2) return false
  if (!labels.every((l) => LABEL_RE.test(l) && l.length <= 63)) return false
  if (!/^[A-Za-z]{2,}$/.test(labels[labels.length - 1])) return false // TLD: letters, 2+
  return true
}

// One-stop check for forms: format rule first, then the hard typo block.
// Invalid emails (or close typos of common providers) return an error
// message; the form must NOT submit while this is non-null.
export function emailError(email) {
  if (!isValidEmail(email)) return EMAIL_ERROR
  const sug = emailSuggestion(email)
  if (sug) return `That email looks like a typo — did you mean ${sug}?`
  return null
}

// "gmial.com" → "gmail.com". Returns the corrected full address or null.
export function emailSuggestion(email) {
  if (!email) return null
  const at = email.lastIndexOf('@')
  if (at < 1) return null
  const local = email.slice(0, at)
  const domain = email.slice(at + 1).toLowerCase()
  if (!domain || COMMON_DOMAINS.includes(domain)) return null

  let best = null
  let bestScore = Infinity
  for (const d of COMMON_DOMAINS) {
    const score = levenshtein(domain, d)
    if (score < bestScore) {
      bestScore = score
      best = d
    }
  }
  // Close enough to be a typo (e.g. gmial.com), far enough from a legit
  // different domain (e.g. example.com should NOT get a suggestion).
  if (best && bestScore <= 2 && bestScore < domain.length / 2) {
    return `${local}@${best}`
  }
  return null
}

function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0))
  for (let i = 0; i <= a.length; i++) dp[i][0] = i
  for (let j = 0; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      )
    }
  }
  return dp[a.length][b.length]
}
