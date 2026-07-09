import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/useAuth'
import logoUcr from '../assets/logo_ucr.png'

const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)'

const publicNavItems = [
  { to: '/', label: 'Inicio', exact: true },
]

const authNavItems = [
  { to: '/agenda', label: 'Agenda' },
  { to: '/inscripciones', label: 'Inscripciones' },
]

export default function Navbar({ bannerOffset = 0 }) {
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

  const navItems = user ? [...publicNavItems, ...authNavItems] : []
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
        position: 'absolute', right: 0, top: 'calc(100% + 10px)', width: 248,
        background: 'rgba(5,7,14,0.96)',
        backdropFilter: 'blur(28px) saturate(160%)',
        WebkitBackdropFilter: 'blur(28px) saturate(160%)',
        borderRadius: 16,
        boxShadow: '0 20px 56px -8px rgba(0,0,0,0.55), 0 4px 16px -2px rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.09)', overflow: 'hidden',
        animation: 'slide-down 0.28s cubic-bezier(0.16,1,0.3,1) both',
        zIndex: 200,
      }}
    >
      {/* Header */}
      <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(33,187,239,0.55), rgba(0,93,164,0.85))', boxShadow: '0 0 0 1.5px rgba(33,187,239,0.35)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: '#fff' }}>
            {userInitial}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name ?? 'Usuario'}
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-mono-stack)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email ?? ''}
            </p>
          </div>
        </div>
      </div>

      {/* Mi perfil */}
      <NavLink
        to="/perfil"
        onClick={closeProfileMenu}
        role="menuitem"
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 18px', fontSize: 15, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', transition: 'background 150ms, color 150ms', fontFamily: 'var(--font-display)' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
      >
        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden style={{ opacity: 0.5 }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Mi perfil
      </NavLink>

      {/* Mi Cronograma */}
      <div style={{ padding: '5px 10px 8px' }}>
        <NavLink
          to="/micronograma"
          onClick={closeProfileMenu}
          role="menuitem"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '11px 12px', fontSize: 15, fontWeight: 600, color: '#21BBEF', textDecoration: 'none', borderRadius: 10, background: 'rgba(33,187,239,0.08)', border: '1px solid rgba(33,187,239,0.2)', transition: 'background 150ms, border-color 150ms', fontFamily: 'var(--font-display)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(33,187,239,0.15)'; e.currentTarget.style.borderColor = 'rgba(33,187,239,0.4)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(33,187,239,0.08)'; e.currentTarget.style.borderColor = 'rgba(33,187,239,0.2)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Mi Cronograma
          </div>
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden style={{ opacity: 0.5, flexShrink: 0 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </NavLink>
      </div>

      {/* Cerrar sesión */}
      <button
        type="button"
        role="menuitem"
        onClick={() => { closeProfileMenu(); logout() }}
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 18px', width: '100%', border: 'none', borderTop: '1px solid rgba(255,255,255,0.07)', background: 'transparent', fontSize: 15, color: '#F87171', cursor: 'pointer', transition: 'background 150ms', fontFamily: 'var(--font-display)' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden style={{ opacity: 0.7 }}>
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
        position: 'fixed', top: bannerOffset, left: 0, right: 0, zIndex: 120,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        padding: 'clamp(10px,2vh,22px) clamp(16px, 4vw, 60px)',
        background: scrolled ? 'rgba(5,7,14,0.72)' : 'transparent',
        backdropFilter: scrolled ? 'blur(25px) saturate(160%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(25px) saturate(160%)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
        transition: `background 250ms ${EASE_OUT}, border-color 250ms ${EASE_OUT}`,
      }}
    >

      {/* Logo */}
      <NavLink
        to="/"
        onClick={() => { closeMobileMenu(); closeProfileMenu() }}
        style={{ display: 'flex', width: '50%', alignItems: 'center', gap: 18, textDecoration: 'none', flexShrink: 0 }}
        className="nav-logo-link"
      >
        <img
          src={logoUcr}
          alt="Universidad de Costa Rica"
          style={{ objectFit: 'contain', opacity: 0.95 }}
          className="nav-logo-img"
        />
        <div style={{ width: '100%', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 5 }}
          className="nav-logo-text">
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
                  padding: '5px',
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
            className="nav-login-btn"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 18px', borderRadius: 9999,
              fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600,
              letterSpacing: '-0.01em', textDecoration: 'none', whiteSpace: 'nowrap',
              background: '#21BBEF', color: '#02070E',
              boxShadow: '0 0 24px rgba(33,187,239,0.3)',
              transition: `background 150ms, box-shadow 150ms`,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#44C9F3'; e.currentTarget.style.boxShadow = '0 0 32px rgba(33,187,239,0.45)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#21BBEF'; e.currentTarget.style.boxShadow = '0 0 24px rgba(33,187,239,0.3)' }}
          >
            Iniciar sesión
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
          {(user ? navItems : [{ to: '/agenda', label: 'Agenda' }]).map(({ to, label, exact }) => (
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

        </div>
      )}

      <style>{`
        .nav-logo-img { height: 72px; width: auto; }

        @media (max-width: 767px) {
          .nav-links-desktop  { display: none !important; }
          .nav-burger         { display: inline-flex !important; }
          .nav-mobile-ins     { display: none !important; }
          .nav-username, .nav-chevron { display: none !important; }

          /* Logo compacto en mobile */
          .nav-logo-img       { height: 52px !important; width: auto !important; }
          .nav-logo-link      { width: auto !important; gap: 10px !important; }
          .nav-logo-text      { padding-left: 10px !important; gap: 3px !important; }
          .nav-logo-text span:first-child  { font-size: 13px !important; letter-spacing: 0.1em !important; }
          .nav-logo-text span:last-child   { display: none !important; }

          /* Botón login compacto para que quepa junto al hamburger */
          .nav-login-btn      { padding: 9px 12px !important; font-size: 13px !important; }
        }

        @media (max-width: 400px) {
          .nav-logo-text { display: none !important; }
        }
      `}</style>
    </nav>
  )
}
