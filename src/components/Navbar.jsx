import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/useAuth'
import logoUcr from '../assets/logo_ucr.png'

const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)'

const publicNavItems = [
  { to: '/', label: 'Inicio', exact: true },
]

const authNavItems = [
  { to: '/tematicas', label: 'Temáticas' },
  { to: '/agenda', label: 'Agenda' },
  { to: '/inscripciones', label: 'Inscripciones' },
  { to: '/cronograma', label: 'Cronograma' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    let raf = 0
    const on = () => {
      if (raf) return
      raf = requestAnimationFrame(() => { raf = 0; setScrolled(window.scrollY > 40) })
    }
    window.addEventListener('scroll', on, { passive: true })
    on()
    return () => window.removeEventListener('scroll', on)
  }, [])

  const navItems = user ? [...publicNavItems, ...authNavItems] : publicNavItems
  const userInitial = user?.name?.charAt(0)?.toUpperCase() ?? 'U'

  const closeMobileMenu = () => setMenuOpen(false)
  const closeProfileMenu = () => setProfileOpen(false)

  const toggleProfileMenu = () => { setProfileOpen(o => !o); setMenuOpen(false) }
  const toggleMobileMenu  = () => { setMenuOpen(o => !o); setProfileOpen(false) }

  /* ── Profile dropdown ── */
  const profileDropdown = profileOpen && (
    <div
      role="menu"
      style={{
        position: 'absolute', right: 0, top: 'calc(100% + 10px)', width: 230,
        background: '#fff', borderRadius: 14,
        boxShadow: '0 12px 40px -4px rgba(0,0,0,0.18), 0 4px 16px -2px rgba(0,0,0,0.10)',
        border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden',
        animation: 'slide-down 0.28s cubic-bezier(0.16,1,0.3,1) both',
        zIndex: 200,
      }}
    >
      <div style={{ padding: '14px 18px', background: 'linear-gradient(135deg, #EBF3FA 0%, #F5F9FE 100%)', borderBottom: '1px solid rgba(0,93,164,0.1)' }}>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#005DA4', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.name ?? 'Usuario'}
        </p>
        <p style={{ margin: '3px 0 0', fontSize: 15, color: '#6B7280', fontFamily: 'var(--font-mono-stack)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.email ?? ''}
        </p>
      </div>
      <NavLink
        to="/perfil"
        onClick={closeProfileMenu}
        role="menuitem"
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 18px', fontSize: 16, color: '#374151', textDecoration: 'none', transition: `background ${EASE_OUT} 150ms` }}
        onMouseEnter={e => e.currentTarget.style.background = '#EBF3FA'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Mi perfil
      </NavLink>
      <button
        type="button"
        role="menuitem"
        onClick={() => { closeProfileMenu(); logout() }}
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 18px', width: '100%', border: 'none', background: 'transparent', fontSize: 16, color: '#DC2626', cursor: 'pointer', borderTop: '1px solid rgba(0,0,0,0.06)', transition: `background 150ms` }}
        onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Cerrar sesión
      </button>
    </div>
  )

  return (
    <nav
      aria-label="Navegación principal"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 120,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        padding: '22px clamp(24px, 4vw, 60px)',
        background: scrolled ? 'rgba(5,7,14,0.72)' : 'transparent',
        backdropFilter: scrolled ? 'blur(28px) saturate(160%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(28px) saturate(160%)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
        transition: `background 250ms ${EASE_OUT}, border-color 250ms ${EASE_OUT}`,
      }}
    >

      {/* Logo */}
      <NavLink
        to="/"
        onClick={() => { closeMobileMenu(); closeProfileMenu() }}
        style={{ display: 'flex', alignItems: 'center', gap: 18, textDecoration: 'none', flexShrink: 0 }}
      >
        <img
          src={logoUcr}
          alt="Universidad de Costa Rica"
          style={{ height: 58, width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.95 }}
        />
        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 5 }}>
          <span style={{ fontFamily: 'var(--font-mono-stack)', fontSize: 16, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#21BBEF', lineHeight: 1 }}>
            Simposio · CIE
          </span>
          <span style={{ fontFamily: 'var(--font-mono-stack)', fontSize: 15, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', lineHeight: 1 }}>
            XIV Edición · Guanacaste
          </span>
        </div>
      </NavLink>

      {/* Desktop nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, justifyContent: 'center' }} className="nav-links-desktop">
        {navItems.map(({ to, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            onClick={() => { closeMobileMenu(); closeProfileMenu() }}
            style={({ isActive }) => ({
              display: 'inline-flex', alignItems: 'center',
              padding: '11px 20px',
              fontFamily: 'var(--font-body)', fontSize: 17, fontWeight: 500,
              whiteSpace: 'nowrap',
              borderRadius: 9999, textDecoration: 'none',
              color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
              background: isActive ? 'rgba(255,255,255,0.07)' : 'transparent',
              transition: `color 150ms, background 150ms`,
            })}
            onMouseEnter={e => { if (e.currentTarget.getAttribute('aria-current') !== 'page') { e.currentTarget.style.color = '#fff' } }}
            onMouseLeave={e => { if (e.currentTarget.getAttribute('aria-current') !== 'page') { e.currentTarget.style.color = 'rgba(255,255,255,0.5)' } }}
          >
            {label}
          </NavLink>
        ))}
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {user ? (
          <>
            {/* Inscripciones — mobile quick link */}
            <NavLink
              to="/inscripciones"
              onClick={() => { closeMobileMenu(); closeProfileMenu() }}
              style={({ isActive }) => ({
                display: 'none',
                alignItems: 'center', justifyContent: 'center',
                padding: '7px 16px', borderRadius: 9999,
                fontFamily: 'var(--font-mono-stack)', fontSize: 15, fontWeight: 600,
                letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                textDecoration: 'none',
                background: isActive ? '#fff' : 'rgba(255,255,255,0.1)',
                color: isActive ? '#002F58' : '#fff',
                border: '1px solid rgba(255,255,255,0.3)',
              })}
              className="nav-mobile-ins"
            >
              Inscripciones
            </NavLink>

            {/* Profile button */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={toggleProfileMenu}
                aria-label="Menú de perfil"
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  padding: '9px 14px 9px 9px',
                  background: profileOpen ? 'rgba(255,255,255,0.12)' : 'transparent',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 9999, cursor: 'pointer',
                  transition: `background 150ms, border-color 150ms`,
                  color: '#fff',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)' }}
                onMouseLeave={e => { if (!profileOpen) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' } }}
              >
                {/* Avatar */}
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(135deg, rgba(33,187,239,0.55), rgba(0,93,164,0.85))',
                  boxShadow: profileOpen ? '0 0 0 2px #21BBEF' : '0 0 0 1.5px rgba(255,255,255,0.25)',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: '#fff',
                  flexShrink: 0, transition: 'box-shadow 150ms',
                }}>
                  {userInitial}
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 500, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  className="nav-username">
                  {user.name}
                </span>
                <svg
                  style={{ width: 15, height: 15, flexShrink: 0, transition: `transform 200ms ${EASE_OUT}`, transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden
                  className="nav-chevron"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {profileDropdown}
            </div>
          </>
        ) : (
          /* Unauthenticated — botón de acceso */
          <NavLink
            to="/login"
            onClick={() => { closeMobileMenu(); closeProfileMenu() }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 28px', borderRadius: 9999,
              fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600,
              letterSpacing: '-0.01em', textDecoration: 'none', whiteSpace: 'nowrap',
              background: '#21BBEF', color: '#02070E',
              boxShadow: '0 0 24px rgba(33,187,239,0.3)',
              transition: `background 150ms, box-shadow 150ms`,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#44C9F3'; e.currentTarget.style.boxShadow = '0 0 32px rgba(33,187,239,0.45)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#21BBEF'; e.currentTarget.style.boxShadow = '0 0 24px rgba(33,187,239,0.3)' }}
          >
            Iniciar sesión
            <span style={{ fontFamily: 'var(--font-mono-stack)', fontSize: 16 }}>→</span>
          </NavLink>
        )}

        {/* Hamburger — mobile */}
        <button
          type="button"
          onClick={toggleMobileMenu}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
          style={{
            display: 'none',
            width: 52, height: 52, borderRadius: 9999,
            border: '1px solid rgba(255,255,255,0.18)',
            background: 'rgba(255,255,255,0.05)',
            color: '#fff', cursor: 'pointer',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            transition: 'background 150ms',
          }}
          className="nav-burger"
        >
          <span style={{ position: 'relative', display: 'inline-block', width: 20, height: 14 }}>
            <span style={{ position: 'absolute', left: 0, right: 0, top: menuOpen ? 6 : 0, height: 2, background: '#fff', borderRadius: 2, transform: menuOpen ? 'rotate(45deg)' : 'none', transition: `all 250ms ${EASE_OUT}` }} />
            <span style={{ position: 'absolute', left: 0, right: 0, top: 6, height: 2, background: '#fff', borderRadius: 2, opacity: menuOpen ? 0 : 1, transition: 'opacity 200ms' }} />
            <span style={{ position: 'absolute', left: 0, right: 0, top: menuOpen ? 6 : 12, height: 2, background: '#fff', borderRadius: 2, transform: menuOpen ? 'rotate(-45deg)' : 'none', transition: `all 250ms ${EASE_OUT}` }} />
          </span>
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          style={{
            position: 'absolute', top: '100%', left: 0, right: 0,
            background: 'rgba(5,7,14,0.96)',
            backdropFilter: 'blur(28px) saturate(160%)',
            WebkitBackdropFilter: 'blur(28px) saturate(160%)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            padding: '8px clamp(20px,3.4vw,48px) 18px',
            display: 'flex', flexDirection: 'column', gap: 2,
            animation: `slide-down 0.28s ${EASE_OUT} both`,
            zIndex: 110,
          }}
        >
          {navItems.map(({ to, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              onClick={closeMobileMenu}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center',
                padding: '14px 14px',
                fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em',
                borderRadius: 10, textDecoration: 'none',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              })}
            >
              {label}
            </NavLink>
          ))}
          {!user && (
            <NavLink
              to="/login"
              onClick={closeMobileMenu}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                marginTop: 10, padding: '14px 14px', borderRadius: 10,
                fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em',
                background: '#21BBEF', color: '#02070E', textDecoration: 'none',
              }}
            >
              Iniciar sesión →
            </NavLink>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 767px) {
          .nav-links-desktop { display: none !important; }
          .nav-burger { display: inline-flex !important; }
          .nav-mobile-ins { display: inline-flex !important; }
          .nav-username, .nav-chevron { display: none !important; }
        }
      `}</style>
    </nav>
  )
}
