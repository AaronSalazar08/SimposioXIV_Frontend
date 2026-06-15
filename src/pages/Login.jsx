import { useState } from 'react'
import { useAuth } from '../context/useAuth'
import AlertMessage from '../components/ui/AlertMessage'
import Spinner from '../components/ui/Spinner'
import { getApiErrorMessage } from '../utils/apiErrors'
import logoUcr from '../assets/logo_ucr.png'

const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)'

const INFO_BLOCKS = [
  ['05–07', 'AGO 2026'],
  ['Liberia,', 'Guanacaste'],
  ['Sede', 'UCR · SG-CIE'],
]

function EyeIcon() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  )
}

function DarkInput({ extraStyle, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      {...props}
      style={{
        width: '100%',
        padding: '14px 16px',
        background: 'rgba(255,255,255,0.05)',
        border: `1px solid ${focused ? 'rgba(33,187,239,0.5)' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 12,
        color: '#fff',
        fontSize: 15,
        outline: 'none',
        transition: `border-color 200ms ${EASE_OUT}, box-shadow 200ms ${EASE_OUT}`,
        fontFamily: "'Space Grotesk', sans-serif",
        boxSizing: 'border-box',
        boxShadow: focused ? '0 0 0 3px rgba(33,187,239,0.1)' : 'none',
        ...extraStyle,
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  )
}

export default function Login() {
  const { login } = useAuth()
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Credenciales inválidas. Intente de nuevo.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="login-root"
      style={{
        minHeight: '100svh',
        display: 'flex',
        background: 'linear-gradient(145deg, #010810 0%, #001020 35%, #001a38 65%, #002650 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{`
        .login-left   { display: flex !important; }
        .login-div    { display: block !important; }
        .login-mob    { display: none !important; }
        .login-right  { justify-content: center; }
        .login-inner  { max-width: 420px; }
        .login-dark-input::placeholder { color: rgba(255,255,255,0.28); }
        @media (max-width: 860px) {
          .login-left  { display: none !important; }
          .login-div   { display: none !important; }
          .login-mob   { display: flex !important; }
          .login-right { justify-content: flex-start; padding-top: clamp(32px,8vw,56px) !important; }
          .login-inner { max-width: 480px; }
        }
      `}</style>

      {/* Aurora blobs */}
      <div className="aurora-a" style={{ position: 'absolute', top: '-40%', left: '-25%', width: '62vw', height: '62vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(33,187,239,0.22), transparent 62%)', filter: 'blur(26px)', pointerEvents: 'none' }} />
      <div className="aurora-b" style={{ position: 'absolute', bottom: '-26%', right: '-12%', width: '58vw', height: '58vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,74,135,0.5), transparent 64%)', filter: 'blur(30px)', pointerEvents: 'none' }} />

      {/* Grid overlay */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)', backgroundSize: '64px 64px', WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 35% 40%, #000 30%, transparent)', maskImage: 'radial-gradient(ellipse 80% 70% at 35% 40%, #000 30%, transparent)', pointerEvents: 'none' }} />

      {/* Top / bottom accent stripes */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent 0%, #21BBEF 40%, #005DA4 70%, transparent 100%)', pointerEvents: 'none', zIndex: 2 }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent 0%, #21BBEF 40%, #005DA4 70%, transparent 100%)', pointerEvents: 'none', zIndex: 2 }} />

      {/* ── LEFT PANEL (desktop) ── */}
      <div
        className="login-left"
        style={{
          flex: '0 0 55%',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 'clamp(32px,5vw,64px)',
          position: 'relative',
        }}
      >
        {/* Ghost wordmark */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', left: '50%', top: '50%',
            transform: 'translate(-50%, -50%)',
            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
            fontSize: 'min(24vw,20rem)', lineHeight: 0.8,
            color: 'rgba(255,255,255,0.025)', letterSpacing: '-0.05em',
            whiteSpace: 'nowrap', pointerEvents: 'none', userSelect: 'none',
          }}
        >
          SIMPOSIO
        </div>

        {/* Top logo row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative' }}>
          <img src={logoUcr} alt="Universidad de Costa Rica" style={{ height: 'auto', width: '30%', objectFit: 'contain' }} />
          <div style={{ width: 1, height: 30, background: 'rgba(255,255,255,0.2)' }} />
          <span style={{ fontFamily: "var(--font-pixel)", fontSize: 17, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
            Simposio de<br />Informática Empresarial
          </span>
        </div>

        {/* Center branding */}
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: "var(--font-pixel)", fontSize: 'clamp(17px,1vw,19px)', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7DDAF5', marginBottom: 28 }}>
            <span style={{ width: 28, height: 1, background: '#21BBEF', display: 'inline-block', flexShrink: 0 }} />
            XIV Edición · Informática Empresarial
          </div>

          <h1 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 'clamp(2.4rem,5vw,5.2rem)', lineHeight: 0.92, letterSpacing: '-0.045em', color: '#fff' }}>
            El futuro<br />se construye<br />
            en{' '}<span style={{ color: '#21BBEF', fontSize: '1.06em' }}>Guanacaste.</span>
          </h1>

          <div style={{ marginTop: 36, display: 'flex', gap: 28, flexWrap: 'wrap' }}>
            {INFO_BLOCKS.map(([k, v]) => (
              <div key={k} style={{ borderLeft: '2px solid rgba(33,187,239,0.3)', paddingLeft: 14 }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 'clamp(1.05rem,1.7vw,1.5rem)', color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{k}</div>
                <div style={{ fontFamily: "var(--font-pixel)", fontSize: 17, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.38)', marginTop: 5 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom footer note */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#21BBEF', flexShrink: 0 }} />
          <span style={{ fontFamily: "var(--font-pixel)", fontSize: 17, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            UCR · SG-CIE · 05–07 Ago 2026
          </span>
        </div>
      </div>

      {/* Vertical divider */}
      <div
        className="login-div"
        style={{ width: 1, flexShrink: 0, background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.08) 15%, rgba(255,255,255,0.08) 85%, transparent)', alignSelf: 'stretch' }}
      />

      {/* ── RIGHT PANEL ── */}
      <div
        className="login-right"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 'clamp(32px,5vw,64px) clamp(24px,4vw,56px)',
          position: 'relative',
        }}
      >
        {/* Mobile-only header */}
        <div
          className="login-mob"
          style={{ width: '100%', marginBottom: 36, flexDirection: 'row', alignItems: 'center', gap: 14 }}
        >
          <img src={logoUcr} alt="UCR" style={{ height: 'auto', width: '50%', objectFit: 'contain' }} />
          <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.2)' }} />
          <span style={{ fontFamily: "var(--font-pixel)", textAlign: 'center', fontSize: 16, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>
            XIV Simposio de<br />Informática Empresarial
          </span>
        </div>

        {/* Form card */}
        <div className="animate-fade-in-up login-inner" style={{ width: '100%' }}>

          {/* Heading */}
          <div style={{ marginBottom: 36 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: "var(--font-pixel)", fontSize: 17, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#21BBEF', marginBottom: 14 }}>
              <span style={{ width: 18, height: 1, background: 'currentColor', display: 'inline-block', flexShrink: 0 }} />
              Sistema de gestión
            </span>
            <h2 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 'clamp(1.9rem,3.2vw,2.6rem)', lineHeight: 0.96, letterSpacing: '-0.04em', color: '#fff' }}>
              Iniciar sesión
            </h2>
            <p style={{ margin: '12px 0 0', fontSize: 15, color: 'rgba(255,255,255,0.38)', lineHeight: 1.55, fontFamily: "'Space Grotesk', sans-serif" }}>
              Ingresá con tus credenciales universitarias para continuar.
            </p>
          </div>

          <AlertMessage message={error} />

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Identifier */}
            <div>
              <label
                htmlFor="identifier"
                style={{ display: 'block', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 8, letterSpacing: '0.01em' }}
              >
                Carnet o correo electrónico
              </label>
              <DarkInput
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                required
                value={form.identifier}
                onChange={handleChange}
                placeholder="B12345 o usuario@ucr.ac.cr"
                className="login-dark-input"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                style={{ display: 'block', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 8, letterSpacing: '0.01em' }}
              >
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <DarkInput
                  id="password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="login-dark-input"
                  extraStyle={{ paddingRight: 48 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.32)', padding: 4, display: 'flex', alignItems: 'center', lineHeight: 1, transition: 'color 150ms' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.32)'}
                >
                  {showPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '4px 0' }} />

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: 54,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: 16,
                letterSpacing: '-0.01em',
                color: '#010810',
                background: '#21BBEF',
                border: 'none',
                borderRadius: 12,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.75 : 1,
                transition: `all 200ms ${EASE_OUT}`,
                boxShadow: '0 0 32px rgba(33,187,239,0.22), 0 4px 14px rgba(0,0,0,0.2)',
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = '#44C9F3'; e.currentTarget.style.boxShadow = '0 0 44px rgba(33,187,239,0.38), 0 4px 14px rgba(0,0,0,0.2)' } }}
              onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = '#21BBEF'; e.currentTarget.style.boxShadow = '0 0 32px rgba(33,187,239,0.22), 0 4px 14px rgba(0,0,0,0.2)' } }}
            >
              {loading ? (
                <><Spinner size="md" />Ingresando...</>
              ) : (
                <>Ingresar<span style={{ fontFamily: "var(--font-pixel)", fontSize: 23, marginLeft: 6 }}>→</span></>
              )}
            </button>
          </form>

          <p style={{ marginTop: 36, textAlign: 'center', fontFamily: "var(--font-pixel)", fontSize: 17, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.05em', textTransform: 'uppercase', lineHeight: 1.8 }}>
            © {new Date().getFullYear()} Universidad de Costa Rica
          </p>
        </div>
      </div>
    </div>
  )
}
