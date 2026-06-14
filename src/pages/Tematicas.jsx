export default function Tematicas() {
  return (
    <div>
      <section style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(145deg, #010810, #001020 40%, #001a38 70%, #002650)', padding: 'calc(clamp(36px,6vh,56px) + 96px) clamp(20px,4vw,56px) clamp(32px,5vh,48px)', marginTop: -96 }}>
        <div className="aurora-a" style={{ position: 'absolute', top: '-40%', left: '-6%', width: '46vw', height: '46vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(33,187,239,0.22), transparent 64%)', filter: 'blur(24px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)', backgroundSize: '60px 60px', WebkitMaskImage: 'radial-gradient(70% 90% at 30% 0%, #000, transparent)', maskImage: 'radial-gradient(70% 90% at 30% 0%, #000, transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 1180, margin: '0 auto' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontFamily: "'Space Mono', monospace", fontSize: 'clamp(13px,1.3vw,15px)', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#7DDAF5' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#21BBEF', flexShrink: 0 }} />
            Áreas · XIV Edición
          </span>
          <h1 style={{ margin: '14px 0 0', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 'clamp(1.9rem,4.5vw,3.5rem)', lineHeight: 0.97, letterSpacing: '-0.04em', color: '#fff' }}>
            Temáticas del Simposio
          </h1>
          <p style={{ margin: '16px 0 0', fontSize: 'clamp(0.9rem,1.2vw,1.05rem)', lineHeight: 1.6, color: 'rgba(255,255,255,0.5)', maxWidth: '52ch' }}>
            Las líneas de investigación y áreas de conocimiento que se abordarán durante los tres días del evento.
          </p>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, background: 'linear-gradient(90deg, transparent, #21BBEF 40%, #005DA4 70%, transparent)' }} />
      </section>

      <div style={{ background: '#F8FAFD', minHeight: '60vh', padding: 'clamp(40px,6vh,64px) clamp(20px,4vw,56px) clamp(64px,10vh,100px)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, background: 'rgba(0,93,164,0.06)', border: '1px solid rgba(0,93,164,0.1)' }}>
            <svg style={{ width: 32, height: 32, color: 'rgba(0,93,164,0.35)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p style={{ fontSize: 'clamp(0.95rem,1.2vw,1.05rem)', fontWeight: 600, color: '#374151', margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>Temáticas disponibles próximamente.</p>
          <p style={{ fontSize: 'clamp(0.9rem,1.2vw,1.05rem)', color: 'rgba(0,93,164,0.45)', margin: '8px 0 0' }}>Esta sección se conectará a la API cuando esté disponible.</p>
        </div>
      </div>
    </div>
  )
}
