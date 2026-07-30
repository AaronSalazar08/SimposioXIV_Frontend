import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import heroImg from '../assets/hero.jpeg' // reemplazar con foto aérea de la sede
import logoCIE from '../assets/logo_CIE.png'
import logoSimposio from '../assets/logo_Simposio.png'

// ─── Motion preference ────────────────────────────────────────────
const REDUCE = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)

// ─── Easing constants ─────────────────────────────────────────────
const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)'

// ─── Hooks ───────────────────────────────────────────────────────
function useScrollY() {
  const [y, setY] = useState(0)
  useEffect(() => {
    if (REDUCE) return
    let raf = 0
    const on = () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; setY(window.scrollY) }) }
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return y
}

function useInView() {
  const ref = useRef(null)
  const [seen, setSeen] = useState(REDUCE)
  useEffect(() => {
    if (REDUCE) return
    const el = ref.current; if (!el) return
    let done = false, raf = 0
    const cleanup = () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll) }
    const check = () => {
      if (done || !el) return
      const r = el.getBoundingClientRect()
      if (r.top < window.innerHeight * 0.9 && r.bottom > -40) { done = true; setSeen(true); cleanup() }
    }
    const onScroll = () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; check() }) }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    check()
    return cleanup
  }, [])
  return [ref, seen]
}

function useParallax(speed = 0.12) {
  const ref = useRef(null)
  const [off, setOff] = useState(0)
  useEffect(() => {
    if (REDUCE) return
    let raf = 0
    const on = () => {
      if (raf) return; raf = requestAnimationFrame(() => {
        raf = 0; const el = ref.current; if (!el) return
        const r = el.getBoundingClientRect()
        setOff(-(r.top + r.height / 2 - window.innerHeight / 2) * speed)
      })
    }
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on); on()
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on) }
  }, [speed])
  return [ref, off]
}

function useVW() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440)
  useEffect(() => {
    let raf = 0
    const on = () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; setW(window.innerWidth) }) }
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return w
}

// ─── Animation primitives ─────────────────────────────────────────
function Lines({ lines, delay = 0, dur = 0.95, lineStyle }) {
  const [ref, seen] = useInView()
  return (
    <span ref={ref} style={{ display: 'block' }}>
      {lines.map((ln, i) => (
        <span key={i} style={{ display: 'block', overflow: 'hidden', paddingBottom: '0.06em' }}>
          <span style={{
            display: 'block',
            transform: seen ? 'translateY(0)' : 'translateY(115%)',
            opacity: seen ? 1 : 0,
            transition: REDUCE ? 'none' : `transform ${dur}s ${EASE_OUT} ${delay + i * 0.09}s, opacity ${dur}s ease ${delay + i * 0.09}s`,
            ...lineStyle,
          }}>{ln}</span>
        </span>
      ))}
    </span>
  )
}

function Fade({ children, delay = 0, y = 20, style, className }) {
  const [ref, seen] = useInView()
  return (
    <div ref={ref} className={className} style={{
      transform: seen ? 'translateY(0)' : `translateY(${y}px)`,
      opacity: seen ? 1 : 0,
      transition: REDUCE ? 'none' : `transform 0.85s ${EASE_OUT} ${delay}s, opacity 0.85s ease ${delay}s`,
      ...style,
    }}>{children}</div>
  )
}

// ─── Data ─────────────────────────────────────────────────────────
const TRACKS = [
  { n: '01', name: 'OPT – Área de Tendencias de Gestión de la Informática en las Organizaciones', blurb: 'Estrategia, gobierno de TI y administración de proyectos y servicios tecnológicos.', color: '#21BBEF' },
  { n: '02', name: 'OPT – Área de Tendencias de Desarrollo de Software', blurb: 'Ingeniería, arquitecturas modernas y buenas prácticas para construir software de calidad.', color: '#3B82F6' },
  { n: '03', name: 'OPT – Área de Tendencia de Ingeniería de Datos', blurb: 'Modelado, procesamiento y aprovechamiento de datos para la toma de decisiones.', color: '#F59E0B' },
  { n: '04', name: 'OPT – Área de Tendencias de Arquitectura e Infraestructura de Sistemas Computacionales', blurb: 'Redes, cómputo en la nube y sistemas distribuidos: la base que sostiene todo lo demás.', color: '#EF4444' },
  { n: '05', name: 'Conocimientos Básicos para la Informática', blurb: 'Los fundamentos matemáticos, lógicos y técnicos que sostienen toda la carrera.', color: '#10B981' },
  { n: '06', name: 'Humanística', blurb: 'Comunicación, ética y cultura: las habilidades humanas que dan sentido a la tecnología.', color: '#8B5CF6' },
]

const DAYS = [
  { n: '01', day: 'Miércoles 05 Ago', theme: 'Llegada', bg: '#05070E', fg: '#fff', dot: '#21BBEF', kw: ['Check-in · Hotel Las Espuelas', 'Traslado a la UCR', 'Cena + Actividad Deportiva'], lead: 'El día de la llegada: nos instalamos en el Hotel Las Espuelas, nos trasladamos al campus y arrancamos juntos con cena y deporte.' },
  { n: '02', day: 'Jueves 06 Ago', theme: 'Talleres', bg: '#004A87', fg: '#fff', dot: '#21BBEF', kw: ['IA aplicada', 'Ciberseguridad & firma digital', 'Datos, software & transformación digital'], lead: 'El día de los talleres: experiencias prácticas en inteligencia artificial, ciberseguridad y transformación digital.' },
  { n: '03', day: 'Viernes 07 Ago', theme: 'Cierre', bg: '#21BBEF', fg: '#05070E', dot: '#002F58', kw: ['Datos & infraestructura', 'Actualización de reacreditación', 'Clausura & reconocimientos'], lead: 'El día de cierre: talleres de datos e infraestructura, la actualización del proceso de reacreditación y la ceremonia de clausura y reconocimientos.' },
]

const NUMS = [
  ['44', 'Ponentes', ''],
  ['31', 'Ponencias', ''],
  ['03', 'Días', ''],
]

const MARQUEE_WORDS = ['INTELIGENCIA ARTIFICIAL', 'CLOUD', 'DATOS', 'CIBERSEGURIDAD', 'PRODUCTO', 'GUANACASTE 2026']

// ─── Shared style fragments ───────────────────────────────────────
const GLASS_CARD = {
  display: 'flex', flexDirection: 'column', gap: 4,
  padding: '18px 20px', borderRadius: 16,
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
}

// ─── Chapter eyebrow ─────────────────────────────────────────────
function ChapterTag({ n, label, color = '#21BBEF' }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12, fontFamily: "var(--font-pixel)", fontSize: 'clamp(19px,1.3vw,21px)', letterSpacing: '0.18em', textTransform: 'uppercase', color }}>
      <span>({n})</span>
      <span style={{ width: 26, height: 1, background: 'currentColor', opacity: 0.5 }} />
      {label}
    </span>
  )
}

// ─── HERO ─────────────────────────────────────────────────────────
function Hero({ user }) {
  const t = useScrollY()
  const fade = Math.max(0, 1 - t / 620)

  return (
    <section style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', background: 'linear-gradient(145deg, #010810 0%, #001020 35%, #001a38 65%, #002650 100%)', display: 'flex', flexDirection: 'column' }}>
      {/* Aurora blobs */}
      <div className="aurora-a" style={{ position: 'absolute', top: '-40%', left: '-25%', width: '62vw', height: '62vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(33,187,239,0.28), transparent 62%)', filter: 'blur(26px)', transform: `translateY(${t * 0.12}px)`, pointerEvents: 'none' }} />
      <div className="aurora-b" style={{ position: 'absolute', bottom: '-26%', right: '-12%', width: '58vw', height: '58vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,74,135,0.55), transparent 64%)', filter: 'blur(30px)', transform: `translateY(${t * -0.08}px)`, pointerEvents: 'none' }} />

      {/* Masked grid */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)', backgroundSize: '64px 64px', WebkitMaskImage: 'radial-gradient(80% 70% at 50% 32%, #000, transparent)', maskImage: 'radial-gradient(80% 70% at 50% 32%, #000, transparent)', transform: `translateY(${t * 0.05}px)`, pointerEvents: 'none' }} />

      {/* Ghost wordmark */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%,calc(-50% + ${t * -0.1}px))`, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 'min(30vw,26rem)', lineHeight: 0.8, color: 'rgba(255,255,255,0.025)', letterSpacing: '-0.05em', whiteSpace: 'nowrap', pointerEvents: 'none' }}>SIMPOSIO</div>

      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 1560, width: '100%', margin: '0 auto', padding: '80px clamp(20px,4vw,56px) 0' }}>

        {/* Kicker */}
        <Fade delay={0.08} style={{ marginBottom: 'clamp(20px,3vh,38px)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 11, fontFamily: "var(--font-pixel)", fontSize: 'clamp(19px,1.3vw,21px)', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7DDAF5' }}>
            <span style={{ width: 30, height: 1, background: '#21BBEF' }} />
            XIV Edición · Informática Empresarial
          </span>
        </Fade>

        {/* Headline */}
        <h1 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 'clamp(2.2rem, 8.6vw, 8.6rem)', lineHeight: 0.92, letterSpacing: '-0.045em', color: '#fff' }}>
          <Lines lines={[
            'El futuro',
            'se construye',
            <span key="c">en <span style={{ color: '#21BBEF', fontSize: '1.06em' }}>Guanacaste.</span></span>,
          ]} />
        </h1>

        {user && (
          <Fade delay={0.55} style={{ marginTop: 14 }}>
            <span style={{ fontFamily: "var(--font-pixel)", fontSize: 30, color: 'rgba(33,187,239,0.8)', letterSpacing: '0.04em' }}>
              Bienvenido de nuevo, <strong style={{ color: '#fff' }}>{user.name}</strong>
            </span>
          </Fade>
        )}

        {/* CTAs */}
        <Fade delay={0.62} style={{ marginTop: 'clamp(28px,4vh,42px)' }}>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Link to="/inscripciones" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, height: 58, padding: '0 30px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 'clamp(0.95rem,1.2vw,1.1rem)', borderRadius: 9999, background: '#21BBEF', color: '#05070E', border: '1px solid transparent', textDecoration: 'none', transition: `all 200ms ${EASE_OUT}`, boxShadow: '0 0 32px rgba(33,187,239,0.35)' }}
              onMouseEnter={e => e.currentTarget.style.background = '#44C9F3'}
              onMouseLeave={e => e.currentTarget.style.background = '#21BBEF'}>
              Reservar mi lugar <span style={{ fontFamily: "var(--font-pixel)" }}>→</span>
            </Link>
            <Link to="/agenda" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, height: 58, padding: '0 30px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 'clamp(0.95rem,1.2vw,1.1rem)', borderRadius: 9999, background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', textDecoration: 'none', transition: `all 200ms ${EASE_OUT}` }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              Ver Agenda
            </Link>
          </div>
        </Fade>


      </div>

      {/* Bottom bar */}
      <div style={{ position: 'relative', borderTop: '1px solid rgba(255,255,255,0.08)', opacity: fade }}>
        <div style={{ maxWidth: 1560, margin: '0 auto', padding: '20px clamp(20px,4vw,56px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontFamily: "var(--font-pixel)", fontSize: 'clamp(18px,1.3vw,21px)', letterSpacing: '0.08em', color: '#fff' }}>SIMPOSIO DE INFORMÁTICA EMPRESARIAL <span style={{ color: 'rgba(255,255,255,0.4)' }}>· UCR · SG-CIE</span></span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: "var(--font-pixel)", fontSize: 20, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
            Deslizá para descubrir <span className="scroll-cue" style={{ display: 'inline-block' }}>↓</span>
          </span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, background: 'linear-gradient(90deg, transparent 0%, #21BBEF 40%, #005DA4 70%, transparent 100%)' }} />
    </section>
  )
}

// ─── MANIFESTO ────────────────────────────────────────────────────
function Manifesto() {
  const ref = useRef(null)
  const [p, setP] = useState(REDUCE ? 1 : 0)
  const text = 'Cada año, el Simposio reúne a estudiantes y docentes para repensar la tecnología que mueve a Costa Rica. No es un evento más: es donde nace la próxima generación de talento.'
  const words = text.split(' ')

  useEffect(() => {
    if (REDUCE) return
    let raf = 0
    const on = () => {
      if (raf) return; raf = requestAnimationFrame(() => {
        raf = 0; const el = ref.current; if (!el) return
        const r = el.getBoundingClientRect(); const vh = window.innerHeight
        const passed = (vh * 0.82) - r.top
        setP(Math.max(0, Math.min(1, passed / (r.height * 0.72))))
      })
    }
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on); on()
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on) }
  }, [])

  const lit = p * (words.length + 5)
  return (
    <section style={{ position: 'relative', background: '#05070E', padding: 'clamp(100px,20vh,220px) clamp(20px,4vw,56px)', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '70vw', height: '40vh', background: 'radial-gradient(ellipse, rgba(33,187,239,0.12), transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ marginBottom: 'clamp(28px,5vh,56px)' }}><ChapterTag n="01" label="El simposio" /></div>
        <p ref={ref} style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, fontSize: 'clamp(1.7rem,4.6vw,3.7rem)', lineHeight: 1.22, letterSpacing: '-0.02em' }}>
          {words.map((w, i) => {
            const o = Math.max(0.12, Math.min(1, lit - i))
            const accent = /Costa|Rica|talento\.|tecnología/.test(w)
            return <span key={i} style={{ color: accent && o > 0.85 ? '#21BBEF' : '#fff', opacity: o, transition: 'opacity 0.1s linear, color 0.3s ease' }}>{w} </span>
          })}
        </p>
      </div>
    </section>
  )
}

// ─── TRACKS ───────────────────────────────────────────────────────
function Tracks() {
  const [hover, setHover] = useState(-1)
  return (
    <section style={{ position: 'relative', background: '#F8FAFD', padding: 'clamp(90px,16vh,180px) clamp(20px,4vw,56px)', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1560, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 24, marginBottom: 'clamp(40px,7vh,72px)' }}>
          <div>
            <div style={{ marginBottom: 22 }}><ChapterTag n="02" label="Tendencias del plan de estudios" color="#005DA4" /></div>
            <h2 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 'clamp(2.2rem,6vw,4.8rem)', lineHeight: 0.96, letterSpacing: '-0.04em', color: '#05070E' }}>
              <Lines lines={['Seis tendencias', <span key="b">para pensar el <span style={{ color: '#005DA4' }}>futuro.</span></span>]} />
            </h2>
          </div>
          <Fade delay={0.2} style={{ maxWidth: '34ch' }}>
            <p style={{ margin: 0, fontSize: 'clamp(1rem,1.4vw,1.2rem)', lineHeight: 1.55, color: '#6B7280' }}>
              El nuevo plan de estudios de Informática Empresarial se organiza en seis tendencias que recorren toda la cadena del software empresarial — de la infraestructura al impacto humano.
            </p>
          </Fade>
        </div>

        <div onMouseLeave={() => setHover(-1)} style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
          {TRACKS.map((tk, i) => {
            const on = hover === i
            return (
              <Fade key={tk.n} delay={i * 0.05}>
                <div onMouseEnter={() => setHover(i)}
                  style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr) auto', alignItems: 'center', gap: 'clamp(16px,3vw,44px)', padding: 'clamp(20px,3.2vh,34px) clamp(8px,1.5vw,20px)', borderBottom: '1px solid rgba(0,0,0,0.08)', background: on ? '#fff' : 'transparent', boxShadow: on ? '0 4px 24px rgba(0,0,0,0.07)' : 'none', borderRadius: on ? 12 : 0, transform: on ? 'translateX(6px)' : 'none', transition: `all 0.4s ${EASE_OUT}` }}>
                  <span style={{ fontFamily: "var(--font-pixel)", fontSize: 'clamp(19px,1.3vw,22px)', color: on ? tk.color : 'rgba(0,0,0,0.25)', width: 30, transition: 'color 0.3s' }}>{tk.n}</span>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 'clamp(1.4rem,3.4vw,2.6rem)', lineHeight: 1.02, letterSpacing: '-0.03em', color: '#05070E' }}>{tk.name}</h3>
                    <p style={{ margin: '8px 0 0', fontSize: 'clamp(0.9rem,1.1vw,1rem)', color: '#6B7280', maxHeight: on ? 60 : 0, opacity: on ? 1 : 0, overflow: 'hidden', transition: `all 0.45s ${EASE_OUT}` }}>{tk.blurb}</p>
                  </div>
                  <span style={{ width: 12, height: 12, borderRadius: '50%', background: tk.color, flexShrink: 0, boxShadow: on ? `0 0 0 6px ${tk.color}22` : 'none', transition: 'box-shadow 0.3s' }} />
                </div>
              </Fade>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── DAYS ─────────────────────────────────────────────────────────
function Days() {
  const wrapRef = useRef(null); const trackRef = useRef(null)
  const [x, setX] = useState(0); const [idx, setIdx] = useState(0)
  const vw = useVW()
  const stack = REDUCE || vw < 900

  useEffect(() => {
    if (REDUCE || stack) return
    let raf = 0
    const on = () => {
      if (raf) return; raf = requestAnimationFrame(() => {
        raf = 0; const wrap = wrapRef.current, track = trackRef.current; if (!wrap || !track) return
        const r = wrap.getBoundingClientRect(); const vh = window.innerHeight
        const scrollable = wrap.offsetHeight - vh
        const passed = Math.min(Math.max(-r.top, 0), scrollable)
        const prog = scrollable > 0 ? passed / scrollable : 0
        const maxX = Math.max(0, track.scrollWidth - window.innerWidth)
        setX(prog * maxX)
        setIdx(Math.min(DAYS.length - 1, Math.round(prog * (DAYS.length - 1))))
      })
    }
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on); on()
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on) }
  }, [stack])

  const panels = DAYS.map((d) => (
    <article key={d.n} style={{ width: '100vw', minHeight: stack ? 'auto' : '100vh', flex: 'none', background: d.bg, color: d.fg, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${d.fg === '#fff' ? 'rgba(255,255,255,0.04)' : 'rgba(5,7,14,0.05)'} 1px,transparent 1px),linear-gradient(90deg,${d.fg === '#fff' ? 'rgba(255,255,255,0.04)' : 'rgba(5,7,14,0.05)'} 1px,transparent 1px)`, backgroundSize: '64px 64px' }} />
      <div aria-hidden="true" style={{ position: 'absolute', top: '50%', left: '3vw', transform: 'translateY(-50%)', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 'min(62vh,32rem)', lineHeight: 0.8, color: d.fg === '#fff' ? 'rgba(255,255,255,0.06)' : 'rgba(5,7,14,0.08)', letterSpacing: '-0.05em', pointerEvents: 'none' }}>{d.n}</div>
      <div style={{ position: 'relative', maxWidth: 1560, width: '100%', margin: '0 auto', padding: stack ? 'clamp(64px,10vh,100px) clamp(20px,5vw,80px)' : '0 clamp(20px,5vw,80px)', display: 'grid', gridTemplateColumns: stack ? '1fr' : '1fr 1fr', gap: 'clamp(24px,5vw,80px)', alignItems: 'center' }}>
        <div>
          <span style={{ fontFamily: "var(--font-pixel)", fontSize: 'clamp(18px,1.3vw,21px)', letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.75 }}>Día {d.n} · {d.day}</span>
          <h3 style={{ margin: '14px 0 0', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 'clamp(2.6rem,7.4vw,6.8rem)', lineHeight: 0.9, letterSpacing: '-0.04em' }}>{d.theme}</h3>
          <p style={{ margin: '24px 0 0', fontSize: 'clamp(1rem,1.5vw,1.35rem)', lineHeight: 1.5, maxWidth: '34ch', opacity: 0.86 }}>{d.lead}</p>
        </div>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, borderTop: `1px solid ${d.fg === '#fff' ? 'rgba(255,255,255,0.16)' : 'rgba(5,7,14,0.18)'}` }}>
          {d.kw.map((k, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 'clamp(16px,2.4vh,26px) 0', borderBottom: `1px solid ${d.fg === '#fff' ? 'rgba(255,255,255,0.16)' : 'rgba(5,7,14,0.18)'}` }}>
              <span style={{ fontFamily: "var(--font-pixel)", fontSize: 19, opacity: 0.6, width: 22 }}>{String(i + 1).padStart(2, '0')}</span>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: d.dot, flexShrink: 0 }} />
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, fontSize: 'clamp(1.2rem,2.4vw,2rem)', letterSpacing: '-0.02em' }}>{k}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  ))

  if (stack) {
    return <section style={{ background: '#05070E' }}>{panels}</section>
  }
  return (
    <section ref={wrapRef} style={{ height: '340vh', position: 'relative', background: '#05070E' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
        <div ref={trackRef} style={{ display: 'flex', height: '100%', transform: `translate3d(${-x}px,0,0)`, willChange: 'transform' }}>{panels}</div>
        <div style={{ position: 'absolute', bottom: 34, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 10, zIndex: 5 }}>
          {DAYS.map((_, i) => (
            <span key={i} style={{ width: i === idx ? 30 : 9, height: 9, borderRadius: 9, background: i === idx ? (idx === 2 ? '#002F58' : '#21BBEF') : (idx === 2 ? 'rgba(5,7,14,0.3)' : 'rgba(255,255,255,0.28)'), transition: `all 0.4s ${EASE_OUT}` }} />
          ))}
        </div>
        <span style={{ position: 'absolute', top: 'calc(50% - min(31vh,16rem) - 14px)', left: '50%', transform: 'translateX(-50%)', fontFamily: "var(--font-pixel)", fontSize: 20, letterSpacing: '0.2em', textTransform: 'uppercase', color: idx === 2 ? 'rgba(5,7,14,0.55)' : 'rgba(255,255,255,0.35)', zIndex: 5, pointerEvents: 'none' }}>(03) — Tres días</span>
      </div>
    </section>
  )
}

// ─── NUMBERS ──────────────────────────────────────────────────────
function Numbers() {
  return (
    <section style={{ background: '#fff', padding: 'clamp(90px,16vh,180px) clamp(20px,4vw,56px)' }}>
      <div style={{ maxWidth: 1560, margin: '0 auto' }}>
        <div style={{ marginBottom: 'clamp(40px,7vh,80px)' }}><ChapterTag n="04" label="En números" color="#005DA4" /></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'clamp(28px,4vw,56px)' }}>
          {NUMS.map(([n, t, d], i) => (
            <Fade key={i} delay={i * 0.08}>
              <div style={{ borderTop: '2px solid #05070E', paddingTop: 22 }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 'clamp(4rem,9vw,8.5rem)', lineHeight: 0.84, letterSpacing: '-0.05em', color: '#05070E' }}>{n}</div>
                <div style={{ marginTop: 18, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 'clamp(1.1rem,1.5vw,1.35rem)', color: '#1a1a2e' }}>{t}</div>
                <div style={{ marginTop: 6, fontSize: 'clamp(0.85rem,1vw,0.95rem)', color: '#6B7280', lineHeight: 1.5 }}>{d}</div>
              </div>
            </Fade>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── VENUE ────────────────────────────────────────────────────────
function Venue() {
  const [imgRef, imgOff] = useParallax(0.16)
  return (
    <section style={{ position: 'relative', overflow: 'hidden', background: '#05070E', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      {/* Aerial photo */}
      <div ref={imgRef} style={{ position: 'absolute', inset: '-12% 0', transform: `translateY(${imgOff}px)`, pointerEvents: 'none' }}>
        <img src={heroImg} alt="Vista aérea · Sede de Guanacaste, UCR" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%', display: 'block' }} />
      </div>
      {/* Gradient overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(5,7,14,0.94) 0%, rgba(5,7,14,0.4) 45%, rgba(5,7,14,0.72) 100%)', pointerEvents: 'none' }} />

      {/* TOP: chapter tag */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 1560, margin: '0 auto', padding: 'clamp(48px,10vh,120px) clamp(20px,4vw,56px) 0' }}>
        <ChapterTag n="05" label="La sede" />
      </div>

      {/* BOTTOM: título + info */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 1560, margin: '0 auto', padding: '0 clamp(20px,4vw,56px) clamp(48px,8vh,80px)' }}>
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:items-end" style={{ gap: 'clamp(20px,4vw,64px)' }}>
          <h2 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 'clamp(2.8rem,8vw,7rem)', lineHeight: 0.9, letterSpacing: '-0.045em', color: '#fff' }}>
            <Lines lines={['Liberia,', <span key="b"><span style={{ color: '#21BBEF' }}>Guanacaste.</span></span>]} />
          </h2>
          <Fade delay={0.2}>
            <p style={{ margin: 0, fontSize: 'clamp(0.95rem,1.4vw,1.2rem)', lineHeight: 1.65, color: 'rgba(255,255,255,0.65)' }}>
              La Sede de Guanacaste de la UCR — entre el calor del Pacífico y una comunidad universitaria que crece. Un campus pensado para encontrarse, crear y celebrar la tecnología hecha en Costa Rica.
            </p>
            <div style={{ marginTop: 26, display: 'flex', gap: 'clamp(18px,4vw,28px)', flexWrap: 'wrap' }}>
              {[['A 3.5 h', 'de San José'], ['Aeropuerto', 'LIR · 25 min'], ['Agosto', 'Verano seco']].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 'clamp(1.1rem,1.8vw,1.6rem)', color: '#fff', letterSpacing: '-0.02em' }}>{k}</div>
                  <div style={{ fontFamily: "var(--font-pixel)", fontSize: 'clamp(13px,1.5vw,20px)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{v}</div>
                </div>
              ))}
            </div>
          </Fade>
        </div>
      </div>
    </section>
  )
}

// ─── MARQUEE ──────────────────────────────────────────────────────
function Marquee() {
  const row = [...MARQUEE_WORDS, ...MARQUEE_WORDS]
  return (
    <div style={{ background: '#05070E', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', padding: '22px 0' }}>
      <div className="marquee-run" style={{ display: 'flex', whiteSpace: 'nowrap', width: 'max-content' }}>
        {row.map((w, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 30, paddingRight: 30, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, fontSize: 'clamp(1.1rem,2vw,1.8rem)', letterSpacing: '-0.01em', color: i % 2 ? '#21BBEF' : 'rgba(255,255,255,0.45)' }}>
            {w}<span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.7em' }}>✳</span>
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── ORGANIZAN ────────────────────────────────────────────────────
function Organizers() {
  return (
    <section style={{ background: '#fff', padding: 'clamp(72px,13vh,140px) clamp(20px,4vw,56px)', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', textAlign: 'center' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12, fontFamily: "var(--font-pixel)", fontSize: 'clamp(19px,1.3vw,21px)', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#005DA4', marginBottom: 'clamp(45px,6vh,73px)' }}>
          <span style={{ width: 26, height: 1, background: 'currentColor', opacity: 0.5 }} />
          Organizado por
          <span style={{ width: 26, height: 1, background: 'currentColor', opacity: 0.5 }} />
        </span>
        <Fade>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(40px,8vw,100px)', flexWrap: 'wrap' }}>
            <img src={logoSimposio} alt="XIV Simposio de Informática Empresarial" style={{ width: 'clamp(260px,34vw,420px)', height: 'auto', objectFit: 'contain', display: 'block' }} />
            <span className="org-divider" style={{ width: 1, height: 200, background: 'rgba(0,0,0,0.12)' }} />
            <img src={logoCIE} alt="Carrera de Informática Empresarial · Sede de Guanacaste" style={{ width: 'clamp(300px,38vw,500px)', height: 'auto', objectFit: 'contain', display: 'block' }} />
          </div>
        </Fade>
      </div>
      <style>{`@media (max-width: 720px){ .org-divider{ display:none !important; } }`}</style>
    </section>
  )
}


// ─── FOOTER ───────────────────────────────────────────────────────
function HomeFooter() {
  return (
    <footer style={{ position: 'relative', overflow: 'hidden', background: '#05070E', borderTop: '1px solid rgba(255,255,255,0.12)', padding: 'clamp(64px,9vh,100px) clamp(20px,4vw,56px) 40px' }}>
      <div aria-hidden="true" style={{ position: 'absolute', left: '-2vw', bottom: '-12vh', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 'min(34vw,26rem)', lineHeight: 0.8, color: 'rgba(255,255,255,0.03)', letterSpacing: '-0.05em', pointerEvents: 'none' }}>UCR</div>
      <div style={{ position: 'relative', maxWidth: 1560, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 48, justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ maxWidth: 420 }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 'clamp(2rem,4vw,3.2rem)', letterSpacing: '-0.04em', color: '#fff', lineHeight: 0.95 }}>
              Nos vemos en<br /><span className="ed" style={{ color: '#21BBEF' }}>Guanacaste.</span>
            </div>
            <p style={{ margin: '22px 0 0', fontSize: 17, lineHeight: 1.7, color: 'rgba(255,255,255,0.72)', maxWidth: 380 }}>
              XIV Simposio de Informática Empresarial · Carrera de Informática Empresarial, Sede de Guanacaste, Universidad de Costa Rica.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'clamp(32px,5vw,72px)', flexWrap: 'wrap' }}>
            <FooterCol title="Evento" links={[['Información', '/informacion'], ['Cronograma', '/cronograma']]} />
            <FooterCol title="Asistentes" links={[['Inscripciones', '/inscripciones'], ['Mi perfil', '/perfil']]} />
          </div>
        </div>
        <div style={{ marginTop: 'clamp(53px,8vh,85px)', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, alignItems: 'center', fontFamily: "var(--font-pixel)", fontSize: 19, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          <span>© 2026 Universidad de Costa Rica</span>
          <span>Liberia, Guanacaste · 05–07 AGO 2026</span>
        </div>
        <CreditsRow />
      </div>
    </footer>
  )
}

// ─── Credits ──────────────────────────────────────────────────────
const CREDITOS = [
  { rol: 'Coordinador', nombre: 'Mag. César Laravanegas', email: 'cesar.laravanegas@ucr.ac.cr' },
  { rol: 'Diseño web', nombre: 'Estudiante Aaron Salazar Mata', email: 'aaron.salazarmata@ucr.ac.cr' },
  { rol: 'Diseño gráfico', nombre: 'Estudiante Gerardo Rojas Ramos', email: 'gerardo.rojasramos@ucr.ac.cr' },
  { rol: 'Infraestructura', nombre: 'Lic. Iván Chavarría Cubero', email: 'ivan.chavarriacubero@ucr.ac.cr' },
]

function CreditsRow() {
  return (
    <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexWrap: 'wrap', gap: '10px 32px' }}>
      {CREDITOS.map(({ rol, nombre, email }) => (
        <div key={email} style={{ fontSize: 13, lineHeight: 1.5, color: 'rgba(255,255,255,0.4)' }}>
          <span style={{ textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.3)' }}>{rol}:</span>{' '}
          <span style={{ color: 'rgba(255,255,255,0.55)' }}>{nombre}</span>{' '}
          <a href={`mailto:${email}`} style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.color = '#21BBEF'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
            {email}
          </a>
        </div>
      ))}
    </div>
  )
}

function FooterCol({ title, links }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
      <span style={{ fontFamily: "var(--font-pixel)", fontSize: 20, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#21BBEF', marginBottom: 6 }}>{title}</span>
      {links.map(([l, to]) => (
        <Link key={l} to={to} style={{ fontSize: 17, color: 'rgba(255,255,255,0.72)', textDecoration: 'none', transition: 'color 150ms' }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.72)'}>{l}</Link>
      ))}
    </div>
  )
}

// ─── Responsive hide utility ──────────────────────────────────────
// The floating hero cards are hidden on narrow screens via the hero-cards class below.
// No Tailwind needed — handled inline via the conditional render.

// ─── MAIN ─────────────────────────────────────────────────────────
export default function Home() {
  const { user } = useAuth()
  return (
    <div>
      <Hero user={user} />
      <Manifesto />
      <Tracks />
      <Days />
      <Numbers />
      <Venue />
      <Marquee />
      <Organizers />
      <HomeFooter />
    </div>
  )
}
