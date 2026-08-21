import { useState } from 'react'
import { hosts, experiences } from '../../data/mockData.js'
import { getUsers } from '../../services/admin.js'
import { useApi } from '../../hooks/useApi.js'
import VerifiedBadge from '../../components/experience/VerifiedBadge.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import { formatDate } from '../../utils/format.js'

// F23 — internal moderation page: verify a host, issue a Panchayat badge,
// hide a listing. Plus the real registered-users list (who logged in).
export default function AdminPanel() {
  const [verified, setVerified] = useState({})
  const [hidden, setHidden] = useState({})
  const { data: users, loading: usersLoading } = useApi(() => getUsers(), [])

  const toggleVerify = (id) => setVerified((v) => ({ ...v, [id]: !v[id] }))
  const toggleHidden = (id) => setHidden((h) => ({ ...h, [id]: !h[id] }))

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-stone-800">Admin moderation</h1>
      <p className="mt-1 text-sm text-stone-500">Verify hosts and issue Panchayat badges — institutional trust on day one.</p>

      <h2 className="mt-8 mb-3 text-lg font-semibold text-stone-800">Users & logins</h2>
      {usersLoading ? (
        <Spinner label="Loading users…" />
      ) : (
        <div className="space-y-2">
          {(users || []).map((u) => (
            <div key={u.id} className="card flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-stone-800">{u.name}</p>
                <p className="truncate text-sm text-stone-500">{u.email}</p>
              </div>
              <div className="flex items-center gap-3 text-sm text-stone-500">
                <Badge color={u.role === 'host' ? 'green' : u.role === 'admin' ? 'blue' : 'stone'}>{u.role}</Badge>
                <span>{u.last_login_at ? `Last login: ${formatDate(u.last_login_at)}` : 'Never logged in'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="mt-8 mb-3 text-lg font-semibold text-stone-800">Hosts</h2>
      <div className="space-y-3">
        {Object.values(hosts).length === 0 ? (
          <p className="card text-sm text-stone-400">No hosts registered yet.</p>
        ) : (
          Object.values(hosts).map((h) => (
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
          ))
        )}
      </div>

      <h2 className="mt-10 mb-3 text-lg font-semibold text-stone-800">Listings</h2>
      <div className="space-y-3">
        {experiences.length === 0 ? (
          <p className="card text-sm text-stone-400">No listings yet.</p>
        ) : (
          experiences.map((e) => (
            <div key={e.id} className="card flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-stone-800">{e.title}</p>
                <p className="text-sm text-stone-500">{e.village_name} · {e.price ? `₹${e.price}` : ''}</p>
              </div>
              <button className={hidden[e.id] ? 'btn-primary' : 'btn-secondary'} onClick={() => toggleHidden(e.id)}>
                {hidden[e.id] ? 'Unhide' : 'Hide listing'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
