import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/useAuth'
import logoUcr from '../assets/logo_ucr.png'

const navItems = [
  { to: '/', label: 'Inicio', exact: true },
  { to: '/informacion', label: 'Información' },
  { to: '/tematicas', label: 'Temáticas' },
  { to: '/inscripciones', label: 'Inscripciones' },
  { to: '/cronograma', label: 'Cronograma' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded text-sm font-medium transition-colors ${
      isActive
        ? 'bg-white/20 text-white'
        : 'text-blue-100 hover:bg-white/10 hover:text-white'
    }`

  return (
    <nav className="bg-ucr-blue shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + título */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <img src={logoUcr} alt="UCR" className="h-10 w-auto" />
            <span className="text-white font-bold text-base leading-tight hidden sm:block">
              Simposio XIV
            </span>
          </div>

          {/* Links escritorio */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(({ to, label, exact }) => (
              <NavLink key={to} to={to} end={exact} className={linkClass}>
                {label}
              </NavLink>
            ))}
          </div>

          {/* Perfil / escritorio */}
          <div className="hidden md:flex items-center gap-2 relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 text-blue-100 hover:text-white transition-colors px-3 py-2 rounded hover:bg-white/10"
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
              </div>
              <span className="text-sm font-medium">{user?.name ?? 'Perfil'}</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
                <NavLink
                  to="/perfil"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-ucr-blue-muted hover:text-ucr-blue transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Mi perfil
                </NavLink>
                <button
                  onClick={() => { setProfileOpen(false); logout() }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>

          {/* Botón hamburguesa móvil */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-white rounded hover:bg-white/10"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      {menuOpen && (
        <div className="md:hidden border-t border-blue-700 bg-ucr-blue-dark">
          <div className="px-4 py-3 space-y-1">
            {navItems.map(({ to, label, exact }) => (
              <NavLink
                key={to}
                to={to}
                end={exact}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <hr className="border-blue-700 my-2" />
            <NavLink
              to="/perfil"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded text-sm text-blue-100 hover:bg-white/10 hover:text-white"
            >
              Mi perfil
            </NavLink>
            <button
              onClick={() => { setMenuOpen(false); logout() }}
              className="w-full text-left px-3 py-2 rounded text-sm text-red-300 hover:bg-white/10"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
