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

  const mobileInscripcionClass = ({ isActive }) =>
    `inline-flex items-center justify-center px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full text-[11px] sm:text-xs font-semibold whitespace-nowrap border transition-colors ${
      isActive
        ? 'bg-white text-ucr-blue border-white'
        : 'text-white border-white/80 bg-white/10 hover:bg-white/20'
    }`

  const closeMobileMenu = () => setMenuOpen(false)
  const closeProfileMenu = () => setProfileOpen(false)
  const userInitial = user?.name?.charAt(0)?.toUpperCase() ?? 'U'

  const toggleProfileMenu = () => {
    setProfileOpen((open) => !open)
    setMenuOpen(false)
  }

  const toggleMobileMenu = () => {
    setMenuOpen((open) => !open)
    setProfileOpen(false)
  }

  const profileDropdown = profileOpen && (
    <div
      className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-50"
      role="menu"
    >
      <NavLink
        to="/perfil"
        onClick={closeProfileMenu}
        role="menuitem"
        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-ucr-blue-muted hover:text-ucr-blue transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Mi perfil
      </NavLink>
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          closeProfileMenu()
          logout()
        }}
        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Cerrar sesión
      </button>
    </div>
  )

  return (
    <nav className="bg-ucr-blue shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 min-h-[4.5rem] py-1.5 md:min-h-[4.5rem] md:py-2 lg:min-h-[5rem]">
          {/* Logo UCR */}
          <NavLink
            to="/"
            onClick={() => {
              closeMobileMenu()
              closeProfileMenu()
            }}
            className="flex items-center min-w-0 flex-shrink max-w-[46%] sm:max-w-[54%] md:max-w-none"
          >
            <img
              src={logoUcr}
              alt="Universidad de Costa Rica"
              className="block h-[3.75rem] w-auto min-w-[10rem] max-w-full object-contain object-left sm:h-12 md:h-12 lg:h-14 md:min-w-[9rem] lg:min-w-[10rem]"
            />
          </NavLink>

          {/* Links escritorio */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navItems.map(({ to, label, exact }) => (
              <NavLink key={to} to={to} end={exact} className={linkClass}>
                {label}
              </NavLink>
            ))}
          </div>

          {/* Inscribirse (móvil) + perfil + menú hamburguesa */}
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 flex-shrink-0">
            <NavLink
              to="/inscripciones"
              onClick={() => {
                closeMobileMenu()
                closeProfileMenu()
              }}
              className={({ isActive }) =>
                `md:hidden ${mobileInscripcionClass({ isActive })}`
              }
              title="Realizar inscripción a eventos"
            >
              Inscribirse
            </NavLink>

            <div className="relative">
              <button
                type="button"
                onClick={toggleProfileMenu}
                className="flex items-center gap-2 text-blue-100 hover:text-white transition-colors p-0.5 rounded-full md:rounded md:px-3 md:py-2 hover:bg-white/10 ring-1 ring-white/50 md:ring-0"
                aria-label="Menú de perfil"
                aria-expanded={profileOpen}
                aria-haspopup="menu"
              >
                <div className="w-9 h-9 md:w-8 md:h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {userInitial}
                </div>
                <span className="hidden md:inline text-sm font-medium max-w-[8rem] truncate">
                  {user?.name ?? 'Perfil'}
                </span>
                <svg className="hidden md:block w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {profileDropdown}
            </div>

            <button
              type="button"
              onClick={toggleMobileMenu}
              className="p-2 text-white rounded-lg hover:bg-white/10 md:hidden"
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuOpen}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
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
                onClick={closeMobileMenu}
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
          </div>
        </div>
      )}
    </nav>
  )
}
