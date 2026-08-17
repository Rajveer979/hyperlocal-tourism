import Badge from '../ui/Badge.jsx'

// F7 — institutional trust instead of review volume
export default function VerifiedBadge({ org }) {
  if (!org) return null
  return (
    <Badge color="green">
      <span aria-hidden>🛡️</span> Verified by {org}
    </Badge>
  )
}
