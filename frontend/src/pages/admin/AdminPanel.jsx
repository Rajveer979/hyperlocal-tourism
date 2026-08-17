import { useState } from 'react'
import { hosts, experiences } from '../../data/mockData.js'
import VerifiedBadge from '../../components/experience/VerifiedBadge.jsx'
import Badge from '../../components/ui/Badge.jsx'

// F23 — internal moderation page: verify a host, issue a Panchayat badge,
// hide a listing. All mock state for the demo.
export default function AdminPanel() {
  const [verified, setVerified] = useState({})
  const [hidden, setHidden] = useState({})

  const toggleVerify = (id) => setVerified((v) => ({ ...v, [id]: !v[id] }))
  const toggleHidden = (id) => setHidden((h) => ({ ...h, [id]: !h[id] }))

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-stone-800">Admin moderation</h1>
      <p className="mt-1 text-sm text-stone-500">Verify hosts and issue Panchayat badges — institutional trust on day one.</p>

      <h2 className="mt-8 mb-3 text-lg font-semibold text-stone-800">Hosts</h2>
      <div className="space-y-3">
        {Object.values(hosts).map((h) => (
          <div key={h.id} className="card flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-stone-800">{h.name}</p>
              <p className="text-sm text-stone-500">{h.village} · {h.languages_spoken.join(', ')}</p>
              {verified[h.id] || h.verified_by ? (
                <div className="mt-1"><VerifiedBadge org={h.verified_by || 'Gram Panchayat'} /></div>
              ) : (
                <Badge color="stone">Unverified</Badge>
              )}
            </div>
            <button className={verified[h.id] ? 'btn-secondary' : 'btn-primary'} onClick={() => toggleVerify(h.id)}>
              {verified[h.id] ? 'Revoke badge' : 'Verify + issue badge'}
            </button>
          </div>
        ))}
      </div>

      <h2 className="mt-10 mb-3 text-lg font-semibold text-stone-800">Listings</h2>
      <div className="space-y-3">
        {experiences.map((e) => (
          <div key={e.id} className="card flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-stone-800">{e.title}</p>
              <p className="text-sm text-stone-500">{e.village_name} · {e.category}</p>
            </div>
            <button className={hidden[e.id] ? 'btn-primary' : 'btn-secondary'} onClick={() => toggleHidden(e.id)}>
              {hidden[e.id] ? 'Unhide' : 'Hide listing'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
