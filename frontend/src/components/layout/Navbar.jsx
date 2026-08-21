import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext.jsx'
import LanguageSwitcher from './LanguageSwitcher.jsx'

export default function Navbar() {
  const { user, logout, t } = useApp()
  const navigate = useNavigate()

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
          {/* Search hidden for hosts */}
          {user?.role !== 'host' && (
            <NavLink to="/search" className={linkCls}>
              🔍 Search
            </NavLink>
          )}
          {/* Traveller bookings */}
          {user?.role === 'traveller' && (
            <NavLink to="/bookings" className={linkCls}>
              📋 My Bookings
            </NavLink>
          )}
          {/* Host navigation */}
          {user?.role === 'host' && (
            <>
              <NavLink to="/host/bookings" className={linkCls}>
                📋 New Bookings
              </NavLink>
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
