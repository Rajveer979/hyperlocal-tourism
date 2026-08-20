import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext.jsx'
import useOfflineMaps from '../../hooks/useOfflineMaps.js'
import LanguageSwitcher from './LanguageSwitcher.jsx'

export default function Navbar() {
  const { user, logout, t } = useApp()
  const navigate = useNavigate()
  const { online, cacheSize, caching, cacheCorridor } = useOfflineMaps()
  const [showCachePanel, setShowCachePanel] = useState(false)

  const linkCls = ({ isActive }) =>
    `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
      isActive ? 'bg-brand-light text-brand-dark' : 'text-stone-600 hover:text-brand-dark'
    }`

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-brand-dark">
          <span className="text-2xl">🏡</span>
          Hyperlocal Tourism
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink to="/" className={linkCls} end>
            {t('nav_home')}
          </NavLink>
          <NavLink to="/search" className={linkCls}>
            🔍 Search
          </NavLink>
          {user && (
            <NavLink to="/bookings" className={linkCls}>
              📋 My Bookings
            </NavLink>
          )}
          {user?.role === 'host' && (
            <>
              <NavLink to="/host" className={linkCls}>
                {t('nav_host')}
              </NavLink>
              <NavLink to="/host/dashboard" className={linkCls}>
                {t('nav_dashboard')}
              </NavLink>
            </>
          )}
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={linkCls}>
              Admin
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          {/* Offline map status indicator */}
          <div className="relative">
            <button
              onClick={() => setShowCachePanel(!showCachePanel)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                online
                  ? 'bg-green-50 text-green-700 hover:bg-green-100'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
              title={online ? 'Online — map tiles stream from network' : 'Offline — using cached tiles'}
            >
              <span className={`h-2 w-2 rounded-full ${online ? 'bg-green-500' : 'bg-amber-500'}`} />
              {online ? 'Online' : 'Offline'}
              {cacheSize != null && cacheSize > 0 && (
                <span className="ml-1 text-[10px] opacity-70">({cacheSize} tiles)</span>
              )}
            </button>

            {showCachePanel && (
              <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-stone-200 bg-white p-4 shadow-lg">
                <h3 className="mb-2 text-sm font-semibold text-stone-800">🗺️ Offline Maps</h3>
                <p className="mb-3 text-xs text-stone-500">
                  Cache corridor tiles so the map works without network.
                </p>
                <div className="mb-3 flex items-center justify-between text-xs text-stone-600">
                  <span>Status: {online ? '🟢 Online' : '🟠 Offline'}</span>
                  <span>{cacheSize ?? 0} tiles cached</span>
                </div>
                <button
                  onClick={cacheCorridor}
                  disabled={caching}
                  className="w-full rounded-lg bg-brand px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
                >
                  {caching ? '⏳ Caching tiles…' : '⬇️ Download Corridor Tiles'}
                </button>
                {!online && (
                  <p className="mt-2 text-[10px] text-amber-600">
                    You are offline. Cached tiles will be used for the map.
                  </p>
                )}
              </div>
            )}
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-stone-500 sm:inline">
                {user.name} · {user.role}
              </span>
              <button className="btn-secondary" onClick={handleLogout}>
                {t('nav_logout')}
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-primary">
              {t('nav_login')}
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
