import { useEffect, useMemo, useState } from 'react'
import AlertMessage from '../components/ui/AlertMessage'
import EmptyState from '../components/ui/EmptyState'
import LoadingState from '../components/ui/LoadingState'
import { DIAS_SIMPOSIO } from '../constants/eventos'
import { useEventos } from '../hooks/queries/useEventos'
import { getApiErrorMessage } from '../utils/apiErrors'
import { formatHora } from '../utils/date'

// ─── Day column config ────────────────────────────────────────────
const DIAS_META = [
  { value: '1', num: '01', label: 'Día 1', tema: 'FUNDAMENTOS',  numColor: '#21BBEF', lineColor: '#005DA4' },
  { value: '2', num: '02', label: 'Día 2', tema: 'INTELIGENCIA', numColor: '#21BBEF', lineColor: '#21BBEF' },
  { value: '3', num: '03', label: 'Día 3', tema: 'COMUNIDAD',    numColor: '#10B981', lineColor: '#10B981' },
]

function utcDiaMes(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const meses = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC']
  return `${d.getUTCDate()} ${meses[d.getUTCMonth()]}`
}

const DIAS_INFO = DIAS_META.map((m, i) => ({
  ...m,
  fecha: utcDiaMes(DIAS_SIMPOSIO[i]?.fechaReferencia),
}))

// ─── Responsive hook ──────────────────────────────────────────────
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint)
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const handler = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [breakpoint])
  return isMobile
}

// ─── Card color from event ────────────────────────────────────────
function getCardColor(evento) {
  if (evento.areas?.length && evento.areas[0].color) return evento.areas[0].color
  const pal = { apertura: '#10B981', clausura: '#EF4444', taller: '#F59E0B', charla: '#21BBEF' }
  return pal[evento.tipo] ?? '#6366F1'
}

// ─── Event card ───────────────────────────────────────────────────
function EventCard({ evento }) {
  const color = getCardColor(evento)
  const area  = evento.areas?.[0]
  const badge = area?.nombre?.toUpperCase() ?? evento.tipo?.toUpperCase() ?? 'GENERAL'
  const star  = evento.tipo === 'apertura' || evento.tipo === 'clausura'

  const ponente = evento.ponente
  const ponenteNombre = ponente
    ? (ponente.nombre_completo || `${ponente.nombre ?? ''} ${ponente.apellidos ?? ''}`.trim())
    : null
  const ponenteOrg = ponente?.organizacion || ponente?.empresa || ponente?.empresa_nombre || null

  const endTime = evento.horario?.hora_fin ? formatHora(evento.horario.hora_fin) : null
  const durMin  = evento.horario?.hora_inicio && evento.horario?.hora_fin
    ? Math.round((new Date(evento.horario.hora_fin) - new Date(evento.horario.hora_inicio)) / 60000)
    : null
  const aula = evento.horario?.aula
    ? [evento.horario.aula.edificio, evento.horario.aula.numero].filter(Boolean).join(' ')
    : null

  return (
    <div style={{ background: color, borderRadius: 14, padding: '18px 20px 20px', display: 'flex', flexDirection: 'column' }}>
      {/* Badge row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 14 }}>
        <span style={{ fontFamily: "var(--font-pixel)", fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.75)', fontWeight: 700 }}>
          {star && '★ '}{badge}
        </span>
        {endTime && (
          <span style={{ fontFamily: "var(--font-pixel)", fontSize: 13, color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap' }}>
            → {endTime}
          </span>
        )}
      </div>

      {/* Title */}
      <h4 style={{ margin: '0 0 10px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, lineHeight: 1.25, color: '#fff', letterSpacing: '-0.02em' }}>
        {evento.titulo}
      </h4>

      {/* Speaker */}
      {ponenteNombre && (
        <p style={{ margin: 0, fontSize: 16, color: 'rgba(255,255,255,0.75)', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 400 }}>
          {ponenteNombre}{ponenteOrg && <span style={{ opacity: 0.7 }}> · {ponenteOrg}</span>}
        </p>
      )}

      {/* Footer */}
      {(aula || durMin) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.5)', flexShrink: 0 }} />
          <span style={{ fontFamily: "var(--font-pixel)", fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.55)' }}>
            {[aula, durMin ? `${durMin} min` : null].filter(Boolean).join(' · ')}
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Day column header (desktop) ──────────────────────────────────
function DayHeader({ dia }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 2 }}>
        <span style={{ fontFamily: "var(--font-pixel)", fontSize: 28, color: dia.numColor, lineHeight: 1 }}>
          {dia.num}
        </span>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, color: '#fff' }}>
          {dia.label}
        </span>
      </div>
      <p style={{ margin: '0 0 10px', fontFamily: "var(--font-pixel)", fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {dia.fecha} · {dia.tema}
      </p>
      <div style={{ height: 2, background: dia.lineColor, borderRadius: 1 }} />
    </div>
  )
}

// ─── Mobile day tabs ──────────────────────────────────────────────
function MobileDayTabs({ activeDay, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, paddingBottom: 20 }}>
      {DIAS_INFO.map(dia => {
        const active = activeDay === dia.value
        return (
          <button
            key={dia.value}
            type="button"
            onClick={() => onChange(dia.value)}
            style={{
              flex: 1,
              padding: '12px 8px',
              border: 'none',
              borderRadius: 12,
              background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
              cursor: 'pointer',
              transition: 'background 150ms',
              textAlign: 'center',
            }}
          >
            <div style={{ fontFamily: "var(--font-pixel)", fontSize: 22, color: active ? dia.numColor : 'rgba(255,255,255,0.3)', lineHeight: 1, marginBottom: 3 }}>
              {dia.num}
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13, color: active ? '#fff' : 'rgba(255,255,255,0.35)' }}>
              {dia.label}
            </div>
            <div style={{ fontFamily: "var(--font-pixel)", fontSize: 10, color: active ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>
              {dia.fecha}
            </div>
            <div style={{ height: 2, background: active ? dia.lineColor : 'rgba(255,255,255,0.08)', borderRadius: 1, marginTop: 10 }} />
          </button>
        )
      })}
    </div>
  )
}

// ─── Desktop time row ─────────────────────────────────────────────
function TimeRowDesktop({ timeKey, eventosPorDia }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '72px 1fr 1fr 1fr', gap: '0 14px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16, paddingBottom: 8 }}>
      <div style={{ textAlign: 'right', paddingRight: 6, paddingTop: 4 }}>
        <span style={{ fontFamily: "var(--font-pixel)", fontSize: 16, color: '#21BBEF', fontWeight: 700, letterSpacing: '-0.02em' }}>
          {timeKey ?? '—'}
        </span>
      </div>
      {['1', '2', '3'].map(d => (
        <div key={d} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(eventosPorDia[d] ?? []).map(e => (
            <EventCard key={e.id} evento={e} />
          ))}
        </div>
      ))}
    </div>
  )
}

// ─── Mobile time row ──────────────────────────────────────────────
function TimeRowMobile({ timeKey, eventos }) {
  if (!eventos?.length) return null
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '52px 1fr', gap: '0 12px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16, paddingBottom: 8 }}>
      <div style={{ textAlign: 'right', paddingRight: 6, paddingTop: 4 }}>
        <span style={{ fontFamily: "var(--font-pixel)", fontSize: 15, color: '#21BBEF', fontWeight: 700, letterSpacing: '-0.02em' }}>
          {timeKey ?? '—'}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {eventos.map(e => <EventCard key={e.id} evento={e} />)}
      </div>
    </div>
  )
}

// ─── Cinematic page header ────────────────────────────────────────
function AgendaHeader({ totalEventos }) {
  return (
    <section
      className="pt-[120px] md:pt-[140px]"
      style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(145deg, #010810, #001020 40%, #001a38 70%, #002650)', paddingLeft: 'clamp(20px,4vw,56px)', paddingRight: 'clamp(20px,4vw,56px)', paddingBottom: 'clamp(32px,5vh,48px)', marginTop: -96 }}
    >
      <div style={{ position: 'absolute', top: '-40%', left: '-6%', width: '46vw', height: '46vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(33,187,239,0.22), transparent 64%)', filter: 'blur(24px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)', backgroundSize: '60px 60px', WebkitMaskImage: 'radial-gradient(70% 90% at 30% 0%, #000, transparent)', maskImage: 'radial-gradient(70% 90% at 30% 0%, #000, transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', maxWidth: 1180, margin: '0 auto' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontFamily: "var(--font-pixel)", fontSize: 'clamp(18px,1.3vw,20px)', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#7DDAF5' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#21BBEF', flexShrink: 0 }} />
          Programa · 05–07 Agosto 2026
        </span>
        <h1 style={{ margin: '14px 0 0', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 'clamp(1.9rem,4.5vw,3.5rem)', lineHeight: 0.97, letterSpacing: '-0.04em', color: '#fff' }}>
          Todo lo que podrás encontrar<br /><span style={{ color: '#21BBEF' }}>va a pasar.</span>
        </h1>
        <p style={{ margin: '16px 0 0', fontSize: 'clamp(0.9rem,1.2vw,1.05rem)', lineHeight: 1.6, color: 'rgba(255,255,255,0.5)', maxWidth: '52ch' }}>
          El programa completo del Simposio organizado por día y hora — charlas, talleres, ponentes y espacios.
          {totalEventos > 0 && <> <span style={{ color: 'rgba(255,255,255,0.75)' }}>{totalEventos} actividades</span> en tres días.</>}
        </p>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, background: 'linear-gradient(90deg, transparent, #21BBEF 40%, #005DA4 70%, transparent)' }} />
    </section>
  )
}

// Extrae "HH:MM" en UTC desde un ISO string
function isoToHHMM(iso) {
  if (!iso) return null
  const d = new Date(iso)
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
}

// ─── Main ─────────────────────────────────────────────────────────
export default function Agenda() {
  const isMobile = useIsMobile()
  const [activeDay, setActiveDay] = useState('1')

  const { data, isLoading, error: queryError } = useEventos({})
  const allEventos = useMemo(() => data ?? [], [data])

  const error = queryError ? getApiErrorMessage(queryError, 'No se pudo cargar el programa.') : ''

  // Slots de hora únicos (HH:MM), ordenados — sin importar en qué día caen
  const timeSlots = useMemo(() => {
    const times = new Set()
    for (const e of allEventos) {
      const t = isoToHHMM(e.horario?.hora_inicio)
      if (t) times.add(t)
    }
    return [...times].sort()
  }, [allEventos])

  // Grid: 'HH:MM' -> { '1': [events], '2': [events], '3': [events] }
  const grid = useMemo(() => {
    const map = {}
    for (const e of allEventos) {
      const t = isoToHHMM(e.horario?.hora_inicio)
      const d = String(e.horario?.numero_dia ?? '')
      if (!t || !d) continue
      if (!map[t]) map[t] = {}
      if (!map[t][d]) map[t][d] = []
      map[t][d].push(e)
    }
    return map
  }, [allEventos])

  const px = 'clamp(16px,4vw,56px)'

  return (
    <div style={{ background: '#060E1C' }}>
      <AgendaHeader totalEventos={allEventos.length} />

      <div style={{ padding: `0 ${px} clamp(64px,10vh,100px)` }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>

          <AlertMessage message={error} />

          {isLoading ? (
            <LoadingState message="Cargando programa…" />
          ) : timeSlots.length === 0 ? (
            <EmptyState
              icon="calendar"
              title="No hay actividades en el programa."
              description="El programa estará disponible próximamente."
            />
          ) : isMobile ? (
            /* ── Vista mobile: tabs + columna única ── */
            <div>
              <div style={{ position: 'sticky', top: 80, zIndex: 40, background: '#060E1C', paddingTop: 20 }}>
                <MobileDayTabs activeDay={activeDay} onChange={setActiveDay} />
              </div>
              <div>
                {timeSlots.map(t => (
                  <TimeRowMobile
                    key={t}
                    timeKey={t}
                    eventos={grid[t]?.[activeDay]}
                  />
                ))}
                {timeSlots.every(t => !grid[t]?.[activeDay]?.length) && (
                  <EmptyState
                    icon="calendar"
                    title="Sin actividades este día."
                    description="Seleccioná otro día para ver el programa."
                  />
                )}
              </div>
            </div>
          ) : (
            /* ── Vista desktop: grid 3 columnas ── */
            <div>
              <div style={{
                position: 'sticky', top: 134, zIndex: 40,
                background: '#060E1C',
                display: 'grid',
                gridTemplateColumns: '72px 1fr 1fr 1fr',
                gap: '0 14px',
                paddingTop: 28,
                paddingBottom: 4,
              }}>
                <div />
                {DIAS_INFO.map(d => <DayHeader key={d.value} dia={d} />)}
              </div>
              <div style={{ paddingTop: 8 }}>
                {timeSlots.map(t => (
                  <TimeRowDesktop key={t} timeKey={t} eventosPorDia={grid[t] ?? {}} />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
