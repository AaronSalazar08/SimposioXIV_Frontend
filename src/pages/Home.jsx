import { Link } from 'react-router-dom'
import { Particles, ParticlesProvider } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import { useAuth } from '../context/useAuth'
import logoUcr from '../assets/logo_ucr.png'

const initEngine = async (engine) => loadSlim(engine)

const PARTICLE_OPTIONS = {
  background: { color: { value: 'transparent' } },
  fpsLimit: 60,
  particles: {
    color: { value: '#ffffff' },
    links: {
      color: '#ffffff',
      distance: 110,
      enable: true,
      opacity: 0.2,
      width: 0.6,
    },
    move: {
      direction: 'none',
      enable: true,
      outModes: { default: 'bounce' },
      speed: 0.55,
      random: true,
    },
    number: {
      density: { enable: true, area: 900 },
      value: 70,
    },
    opacity: { value: { min: 0.2, max: 0.5 } },
    shape: { type: 'circle' },
    size: { value: { min: 1, max: 2 } },
  },
  detectRetina: true,
}

function buildGearPath(teeth, rOuter, rInner, rHole) {
  const step     = (Math.PI * 2) / teeth
  const rootHalf = step * 0.42
  const tipHalf  = step * 0.28
  const f = n => n.toFixed(2)
  const pts = []
  for (let i = 0; i < teeth; i++) {
    const a = i * step
    pts.push(
      `${f(rInner * Math.cos(a - rootHalf))},${f(rInner * Math.sin(a - rootHalf))}`,
      `${f(rOuter * Math.cos(a - tipHalf))},${f(rOuter * Math.sin(a - tipHalf))}`,
      `${f(rOuter * Math.cos(a + tipHalf))},${f(rOuter * Math.sin(a + tipHalf))}`,
      `${f(rInner * Math.cos(a + rootHalf))},${f(rInner * Math.sin(a + rootHalf))}`,
    )
  }
  const outline = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p}`).join(' ') + ' Z'
  const hole    = `M${f(rHole)},0 A${f(rHole)},${f(rHole)} 0 1 0 ${f(-rHole)},0 A${f(rHole)},${f(rHole)} 0 1 0 ${f(rHole)},0`
  return `${outline} ${hole}`
}

function buildHexPoints(r) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = i * Math.PI / 3
    return `${(r * Math.cos(a)).toFixed(1)},${(r * Math.sin(a)).toFixed(1)}`
  }).join(' ')
}

const GEAR_L = buildGearPath(14, 72, 56, 16)
const GEAR_M = buildGearPath( 9, 43, 33, 11)
const GEAR_S = buildGearPath( 6, 28, 22,  8)
const HEX_L  = buildHexPoints(10)
const HEX_M  = buildHexPoints( 7)
const HEX_S  = buildHexPoints( 5)

const STATS = [
  { value: 'XIV',        label: 'Edición',                 accent: true },
  { value: 'UCR',        label: 'Universidad de Costa Rica'             },
  { value: 'Guanacaste', label: 'Sede Regional'                         },
  { value: '+ 10 años',  label: 'Historia del simposio'                 },
]

const TEMAS = [
  {
    title: 'Inteligencia Artificial',
    desc: 'Machine learning, deep learning y aplicaciones empresariales impulsadas por IA.',
    borderColor: 'border-blue-400',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
  },
  {
    title: 'Ciberseguridad',
    desc: 'Protección de activos digitales, amenazas emergentes y estrategias de defensa organizacional.',
    borderColor: 'border-red-400',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    title: 'Análisis de Datos',
    desc: 'Big data, visualización, business intelligence y toma de decisiones basada en datos.',
    borderColor: 'border-green-400',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    title: 'Transformación Digital',
    desc: 'Estrategias para digitalizar procesos, modelos de negocio e innovación organizacional.',
    borderColor: 'border-purple-400',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    title: 'Automatización de Procesos',
    desc: 'RPA, workflows inteligentes y optimización de procesos empresariales con tecnología.',
    borderColor: 'border-amber-400',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495" />
      </svg>
    ),
  },
  {
    title: 'Innovación Empresarial',
    desc: 'Modelos de negocio digitales, startups tecnológicas y ecosistemas de innovación en Guanacaste.',
    borderColor: 'border-teal-400',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
  },
]

const NAV_CARDS = [
  {
    title: 'Información',
    description: 'Conoce los detalles generales del simposio, fechas y lugar del evento.',
    to: '/informacion',
    color: 'bg-ucr-blue',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Temáticas',
    description: 'Explora los temas y áreas de investigación que se abordarán en el simposio.',
    to: '/tematicas',
    color: 'bg-ucr-blue-light',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: 'Inscripciones',
    description: 'Regístrate como participante o ponente para el simposio.',
    to: '/inscripciones',
    color: 'bg-ucr-blue-dark',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    title: 'Cronograma',
    description: 'Consulta el programa completo de actividades y horarios del evento.',
    to: '/cronograma',
    color: 'bg-ucr-blue-darker',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
]

const ABOUT_FEATURES = [
  {
    title: 'Para todos',
    desc: 'Estudiantes, docentes e investigadores',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
  {
    title: 'Académico',
    desc: 'Conferencias, talleres e investigación',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
  },
  {
    title: 'Guanacaste',
    desc: 'Sede Regional UCR, Costa Rica',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
  },
  {
    title: 'Certificado',
    desc: 'Reconocimiento oficial de la UCR',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
  },
]

function CircuitGrid() {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="cg" x="0" y="0" width="72" height="72" patternUnits="userSpaceOnUse">
          <path d="M0 0 H72 V72" fill="none" stroke="white" strokeWidth="0.4" strokeOpacity="0.09" />
          <line x1="36" y1="0"  x2="36" y2="72" stroke="white" strokeWidth="0.3" strokeOpacity="0.06" />
          <line x1="0"  y1="36" x2="72" y2="36" stroke="white" strokeWidth="0.3" strokeOpacity="0.06" />
          <circle cx="0"  cy="0"  r="2"   fill="white" fillOpacity="0.18" />
          <circle cx="72" cy="72" r="2"   fill="white" fillOpacity="0.18" />
          <circle cx="36" cy="36" r="3.5" fill="none" stroke="white" strokeWidth="0.9" strokeOpacity="0.14" />
          <circle cx="36" cy="0"  r="1.4" fill="white" fillOpacity="0.13" />
          <circle cx="0"  cy="36" r="1.4" fill="white" fillOpacity="0.13" />
          <circle cx="72" cy="36" r="1.4" fill="white" fillOpacity="0.13" />
          <circle cx="36" cy="72" r="1.4" fill="white" fillOpacity="0.13" />
        </pattern>
      </defs>
      <rect x="-200" y="-200" width="3000" height="3000" fill="url(#cg)">
        <animateTransform
          attributeName="transform"
          type="translate"
          from="0 0"
          to="72 72"
          dur="16s"
          repeatCount="indefinite"
          calcMode="linear"
        />
      </rect>

      <circle r="2.5" fill="rgba(255,255,255,0.7)">
        <animateMotion path="M-60,72 H1600" dur="3.5s" repeatCount="indefinite" calcMode="linear" />
        <animate attributeName="opacity" values="0;1;0" dur="3.5s" repeatCount="indefinite" />
      </circle>
      <circle r="1.8" fill="rgba(255,255,255,0.6)">
        <animateMotion path="M-60,216 H1600" dur="5s" begin="2s" repeatCount="indefinite" calcMode="linear" />
        <animate attributeName="opacity" values="0;1;0" dur="5s" begin="2s" repeatCount="indefinite" />
      </circle>
      <circle r="2" fill="rgba(255,255,255,0.55)">
        <animateMotion path="M144,-60 V900" dur="4.5s" begin="0.8s" repeatCount="indefinite" calcMode="linear" />
        <animate attributeName="opacity" values="0;1;0" dur="4.5s" begin="0.8s" repeatCount="indefinite" />
      </circle>
      <circle r="1.5" fill="rgba(255,255,255,0.5)">
        <animateMotion path="M-60,360 H1600" dur="6s" begin="3.5s" repeatCount="indefinite" calcMode="linear" />
        <animate attributeName="opacity" values="0;1;0" dur="6s" begin="3.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

function ParticleBg() {
  return (
    <>
      <CircuitGrid />
      <ParticlesProvider init={initEngine}>
        <Particles
          id="hero-particles"
          className="absolute inset-0 w-full h-full"
          style={{ pointerEvents: 'none' }}
          options={PARTICLE_OPTIONS}
        />
      </ParticlesProvider>
    </>
  )
}

function GearsGraphic() {
  return (
    <svg
      viewBox="0 0 400 310"
      className="w-full max-w-sm"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <line x1="135" y1="160" x2="250" y2="160"
        stroke="white" strokeWidth="0.6" strokeOpacity="0.15" strokeDasharray="3 3" />
      <line x1="250" y1="160" x2="250" y2="231"
        stroke="white" strokeWidth="0.6" strokeOpacity="0.15" strokeDasharray="3 3" />

      <circle cx="135" cy="160" r="76" fill="none" stroke="white" strokeWidth="1">
        <animate attributeName="r"             values="72;86;72" dur="3s" repeatCount="indefinite" />
        <animate attributeName="strokeOpacity" values="0.2;0;0.2" dur="3s" repeatCount="indefinite" />
      </circle>

      <g transform="translate(135, 160)">
        <g>
          <animateTransform attributeName="transform" type="rotate"
            from="0 0 0" to="360 0 0" dur="24s" repeatCount="indefinite" calcMode="linear" />
          <path d={GEAR_L} fillRule="evenodd"
            fill="rgba(255,255,255,0.14)" stroke="white" strokeWidth="0.9" strokeOpacity="0.5" />
        </g>
        <polygon points={HEX_L} fill="rgba(255,255,255,0.45)" />
        <circle cx="0" cy="0" r="5" fill="rgba(255,255,255,0.6)" />
      </g>

      <g transform="translate(250, 160)">
        <g>
          <animateTransform attributeName="transform" type="rotate"
            from="0 0 0" to="-360 0 0" dur="14s" repeatCount="indefinite" calcMode="linear" />
          <path d={GEAR_M} fillRule="evenodd"
            fill="rgba(255,255,255,0.11)" stroke="white" strokeWidth="0.9" strokeOpacity="0.45" />
        </g>
        <polygon points={HEX_M} fill="rgba(255,255,255,0.45)" />
        <circle cx="0" cy="0" r="3.5" fill="rgba(255,255,255,0.6)" />
      </g>

      <g transform="translate(250, 231)">
        <g>
          <animateTransform attributeName="transform" type="rotate"
            from="0 0 0" to="360 0 0" dur="8s" repeatCount="indefinite" calcMode="linear" />
          <path d={GEAR_S} fillRule="evenodd"
            fill="rgba(255,255,255,0.09)" stroke="white" strokeWidth="0.9" strokeOpacity="0.4" />
        </g>
        <polygon points={HEX_S} fill="rgba(255,255,255,0.45)" />
        <circle cx="0" cy="0" r="2.5" fill="rgba(255,255,255,0.6)" />
      </g>
    </svg>
  )
}

function SectionHeading({ eyebrow, title }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-1 w-8 rounded-full bg-amber-400" />
        <span className="text-ucr-blue text-xs font-bold uppercase tracking-widest">{eyebrow}</span>
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold text-ucr-blue-darker">{title}</h2>
    </div>
  )
}

export default function Home() {
  const { user } = useAuth()

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-ucr-navy via-ucr-blue to-ucr-blue-light">
        <ParticleBg />

        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)',
            transform: 'translate(35%, -40%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
            transform: 'translate(-40%, 40%)',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          <div className="flex-1 text-white">
            <div className="flex items-center gap-3 mb-7">
              <img src={logoUcr} alt="UCR" className="h-14 w-auto drop-shadow-md" />
              <div className="border-l border-white/30 pl-3">
                <p className="text-white/90 text-xs font-semibold uppercase tracking-wider leading-tight">
                  Universidad de Costa Rica
                </p>
                <p className="text-white/60 text-xs leading-tight mt-0.5">Sede Regional de Guanacaste</p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 text-sm border bg-white/10 border-white/25">
              <span className="font-black text-base text-amber-300">XIV</span>
              <span className="text-white/75 font-medium">Edición · Sede de Guanacaste</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-none mb-4 tracking-tight">
              Simposio de<br />
              <span className="text-amber-300">Informática</span>{' '}
              <span className="text-white">Empresarial</span>
            </h1>

            <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-8 max-w-xl">
              Reflexión, investigación e innovación tecnológica para estudiantes, docentes
              y profesionales del sector empresarial de Costa Rica.
            </p>

            {user && (
              <p className="text-blue-200 text-sm mb-6">
                Bienvenido de nuevo,{' '}
                <span className="font-bold text-white">{user.name}</span> — nos alegra tenerte aquí.
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <Link
                to="/inscripciones"
                className="bg-amber-400 text-ucr-navy font-bold px-7 py-3 rounded-xl text-sm transition-all hover:scale-105 active:scale-95"
              >
                Inscribirse ahora
              </Link>
              <Link
                to="/cronograma"
                className="font-semibold px-7 py-3 rounded-xl text-sm text-white border border-white/30 transition-all hover:bg-white/10"
              >
                Ver cronograma →
              </Link>
            </div>
          </div>

          <div className="flex-shrink-0 w-full max-w-[280px] sm:max-w-xs opacity-85 hidden sm:block">
            <GearsGraphic />
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-100">
            {STATS.map(({ value, label, accent }) => (
              <div key={label} className="py-5 px-4 text-center">
                <p className={`font-black text-xl sm:text-2xl ${accent ? 'text-amber-400' : 'text-ucr-blue-dark'}`}>
                  {value}
                </p>
                <p className="text-gray-500 text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <SectionHeading
              eyebrow="Acerca del evento"
              title="¿Qué es el Simposio de Informática Empresarial?"
            />
            <p className="text-gray-600 leading-relaxed mb-4">
              El Simposio de Informática Empresarial es el evento académico anual organizado por la carrera de{' '}
              <strong className="text-ucr-blue-dark">Informática Empresarial de la UCR</strong>. Reúne a estudiantes,
              docentes, investigadores y profesionales del sector tecnológico y empresarial para reflexionar,
              compartir experiencias y explorar las últimas tendencias en la aplicación de las tecnologías de la
              información en entornos organizacionales.
            </p>
            <p className="text-gray-600 leading-relaxed">
              En esta <strong className="text-ucr-blue-dark">XIV edición</strong>, organizada en la{' '}
              <strong className="text-ucr-blue-dark">Sede Regional de Guanacaste</strong>, se ofrecerá una
              agenda diversa con conferencias magistrales, talleres interactivos y presentaciones de investigación
              estudiantil y docente que fomentan el pensamiento crítico, la innovación y la colaboración
              interdisciplinaria.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {ABOUT_FEATURES.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col items-start gap-2"
              >
                <div className="text-ucr-blue">{icon}</div>
                <p className="font-semibold text-ucr-blue-darker text-sm">{title}</p>
                <p className="text-gray-500 text-xs leading-snug">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ucr-blue-muted py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Áreas temáticas" title="Temas del simposio" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEMAS.map(({ title, desc, icon, borderColor }) => (
              <div
                key={title}
                className={`bg-white rounded-xl p-5 border-l-4 ${borderColor} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-ucr-blue mt-0.5 flex-shrink-0">{icon}</div>
                  <div>
                    <h3 className="font-bold text-ucr-blue-darker text-sm mb-1">{title}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <SectionHeading eyebrow="Secciones" title="Explora el simposio" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {NAV_CARDS.map(({ title, description, icon, to, color }) => (
            <Link
              key={title}
              to={to}
              className="group bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col"
            >
              <div className={`${color} p-5 flex items-center gap-3 text-white`}>
                {icon}
                <span className="font-semibold text-base">{title}</span>
              </div>
              <div className="p-4 flex-1">
                <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
              </div>
              <div className="px-4 pb-4">
                <span className="text-ucr-blue text-xs font-medium group-hover:underline">Ver más →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="bg-ucr-navy border-t border-white/10 text-white/60 text-xs text-center py-6">
        <span className="font-semibold text-white/80">XIV Simposio de Informática Empresarial</span>
        {' · '}Universidad de Costa Rica · Sede Regional de Guanacaste
      </footer>
    </div>
  )
}
