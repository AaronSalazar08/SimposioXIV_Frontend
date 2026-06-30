import { useAuth } from '../context/useAuth'

export default function Perfil() {
  const { user, logout } = useAuth()
  const initial = user?.name?.charAt(0)?.toUpperCase() ?? 'U'

  return (
    <div>
      <section
        className="pt-[120px] md:pt-[140px]"
        style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(145deg, #010810, #001020 40%, #001a38 70%, #002650)', paddingLeft: 'clamp(20px,4vw,56px)', paddingRight: 'clamp(20px,4vw,56px)', paddingBottom: 'clamp(36px,5vh,52px)', marginTop: -96 }}
      >
        <div className="aurora-a" style={{ position: 'absolute', top: '-40%', left: '-6%', width: '46vw', height: '46vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(33,187,239,0.22), transparent 64%)', filter: 'blur(24px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)', backgroundSize: '60px 60px', WebkitMaskImage: 'radial-gradient(70% 90% at 30% 0%, #000, transparent)', maskImage: 'radial-gradient(70% 90% at 30% 0%, #000, transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 1180, margin: '0 auto' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontFamily: "var(--font-pixel)", fontSize: 'clamp(18px,1.3vw,20px)', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#7DDAF5' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#21BBEF', flexShrink: 0 }} />
            Estudiante · UCR
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 18, flexWrap: 'wrap' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 28, color: '#fff', letterSpacing: '-0.02em', background: 'linear-gradient(135deg, rgba(33,187,239,0.55), rgba(0,93,164,0.85))', boxShadow: '0 0 0 3px rgba(33,187,239,0.3), 0 0 0 6px rgba(33,187,239,0.08)' }}>
              {initial}
            </div>
            <div>
              <h1 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 'clamp(1.9rem,4.5vw,3.5rem)', lineHeight: 0.97, letterSpacing: '-0.04em', color: '#fff' }}>
                {user?.name ?? '—'}
              </h1>
              <p style={{ margin: '8px 0 0', fontFamily: "var(--font-pixel)", fontSize: 'clamp(0.85rem,1.1vw,0.95rem)', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.04em' }}>
                {user?.email ?? '—'}
              </p>
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, background: 'linear-gradient(90deg, transparent, #21BBEF 40%, #005DA4 70%, transparent)' }} />
      </section>

      <div style={{ background: '#F8FAFD', padding: 'clamp(32px,5vh,52px) clamp(20px,4vw,56px) clamp(64px,10vh,100px)' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(0,93,164,0.1)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 28px', borderBottom: '1px solid rgba(0,93,164,0.07)' }}>
              <p style={{ margin: '0 0 16px', fontFamily: "var(--font-pixel)", fontSize: 19, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(0,93,164,0.5)', fontWeight: 700 }}>
                Información de la cuenta
              </p>
              <dl style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { label: 'Nombre completo', value: user?.name },
                  { label: 'Correo electrónico', value: user?.email },
                ].map(({ label, value }, i, arr) => (
                  <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '14px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(0,93,164,0.06)' : 'none' }}>
                    <dt style={{ fontSize: 19, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(0,93,164,0.5)', fontFamily: "var(--font-pixel)" }}>{label}</dt>
                    <dd style={{ fontSize: 16, color: '#111827', fontWeight: 500, margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>{value ?? '—'}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div style={{ padding: '16px 28px' }}>
              <button
                onClick={logout}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: 15, fontWeight: 600, borderRadius: 10, border: '1px solid rgba(244,63,94,0.3)', background: 'transparent', color: '#be123c', cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", transition: 'background 150ms' }}
                onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <svg style={{ width: 15, height: 15 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
