import { useMemo, useState } from 'react'
import AlertMessage from '../components/ui/AlertMessage'
import EmptyState from '../components/ui/EmptyState'
import LoadingState from '../components/ui/LoadingState'
import { DIAS_SIMPOSIO, TIPO_LABELS } from '../constants/eventos'
import { useEventos } from '../hooks/queries/useEventos'
import { getApiErrorMessage } from '../utils/apiErrors'
import { formatHora } from '../utils/date'
import { groupEventosPorFranjaHoraria } from '../utils/eventoGrouping'

// ─── Tipo accent colors ───────────────────────────────────────────
const TIPO_DOT = { apertura: '#10B981', clausura: '#EF4444', taller: '#F59E0B', charla: '#21BBEF' }
const TIPO_BG  = { apertura: 'rgba(16,185,129,0.1)', clausura: 'rgba(239,68,68,0.1)', taller: 'rgba(245,158,11,0.1)', charla: 'rgba(33,187,239,0.1)' }
const TIPO_FG  = { apertura: '#065F46', clausura: '#991B1B', taller: '#92400E', charla: '#0C4A6E' }

// ─── Cinematic page header ────────────────────────────────────────
function AgendaHeader({ totalEventos }) {
  return (
    <section style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(145deg, #010810, #001020 40%, #001a38 70%, #002650)', padding: 'calc(clamp(36px,6vh,56px) + 96px) clamp(20px,4vw,56px) clamp(32px,5vh,48px)', marginTop: -96 }}>
      <div className="aurora-a" style={{ position: 'absolute', top: '-40%', left: '-6%', width: '46vw', height: '46vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(33,187,239,0.22), transparent 64%)', filter: 'blur(24px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)', backgroundSize: '60px 60px', WebkitMaskImage: 'radial-gradient(70% 90% at 30% 0%, #000, transparent)', maskImage: 'radial-gradient(70% 90% at 30% 0%, #000, transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', maxWidth: 1180, margin: '0 auto' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontFamily: "'Space Mono', monospace", fontSize: 'clamp(13px,1.3vw,15px)', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#7DDAF5' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#21BBEF', flexShrink: 0 }} />
          Programa · 3 Días
        </span>
        <h1 style={{ margin: '14px 0 0', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 'clamp(1.9rem,4.5vw,3.5rem)', lineHeight: 0.97, letterSpacing: '-0.04em', color: '#fff' }}>
          Todo lo que podrás encontrar<br /><span className="ed" style={{ color: '#21BBEF' }}>va a pasar.</span>
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

// ─── Day switcher tabs ────────────────────────────────────────────
const DAY_LABELS = { '': 'Todos', '1': 'Día 1', '2': 'Día 2', '3': 'Día 3' }
const DAY_DATES  = { '': '',      '1': '12 Oct', '2': '13 Oct', '3': '14 Oct' }

function DayTabs({ active, onChange, countPerDay }) {
  const tabs = [{ value: '' }, ...DIAS_SIMPOSIO.map(d => ({ value: d.value }))]
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
      {tabs.map(({ value }) => {
        const on = active === value
        const count = value ? countPerDay[value] ?? 0 : null
        return (
          <button key={value} type="button" onClick={() => onChange(value)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 36, padding: '0 16px', border: `1px solid ${on ? '#05070E' : 'rgba(0,0,0,0.12)'}`, background: on ? '#05070E' : '#fff', color: on ? '#fff' : '#374151', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15, borderRadius: 9999, cursor: 'pointer', transition: 'all 150ms', whiteSpace: 'nowrap' }}>
            {DAY_LABELS[value]}
            {DAY_DATES[value] && <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, opacity: on ? 0.6 : 0.5 }}>· {DAY_DATES[value]}</span>}
            {count !== null && (
              <span style={{ fontSize: 13, fontFamily: "'Space Mono', monospace", background: on ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.07)', color: on ? '#fff' : '#6B7280', borderRadius: 9999, padding: '1px 6px', marginLeft: 1 }}>{count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ─── Area filter chip ─────────────────────────────────────────────
function AreaChip({ label, color, selected, onClick }) {
  return (
    <button type="button" onClick={onClick}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 32, padding: '0 14px', cursor: 'pointer', border: `1px solid ${selected ? color : 'rgba(0,0,0,0.1)'}`, background: selected ? color : '#fff', color: selected ? '#fff' : '#374151', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, fontSize: 15, borderRadius: 9999, transition: 'all 150ms', flexShrink: 0, boxShadow: selected ? `0 0 0 3px ${color}33` : 'none' }}>
      {!selected && <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />}
      {label}
    </button>
  )
}

// ─── Rich event card (read-only) ──────────────────────────────────
function EventoCard({ evento }) {
  const tipo = evento.tipo
  const tipoLabel = TIPO_LABELS[tipo] ?? tipo
  const dot   = TIPO_DOT[tipo]  ?? '#64748B'
  const tipoBg = TIPO_BG[tipo]  ?? 'rgba(100,116,139,0.1)'
  const tipoFg = TIPO_FG[tipo]  ?? '#334155'

  const horaInicio = formatHora(evento.horario?.hora_inicio)
  const horaFin    = formatHora(evento.horario?.hora_fin)
  const durMin = evento.horario?.hora_inicio && evento.horario?.hora_fin
    ? Math.round((new Date(evento.horario.hora_fin) - new Date(evento.horario.hora_inicio)) / 60000)
    : null

  const ponenteNombre = evento.ponente
    ? (evento.ponente.nombre_completo || `${evento.ponente.nombre} ${evento.ponente.apellidos}`)
    : null

  return (
    <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', transition: 'box-shadow 200ms, transform 200ms' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.09)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'none' }}>

      {/* Accent bar */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${dot}, transparent)` }} />

      <div style={{ padding: '16px 18px 18px' }}>
        {/* Tipo + areas */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 10 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', padding: '3px 9px', borderRadius: 9999, background: tipoBg, color: tipoFg }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: dot, flexShrink: 0 }} />
            {tipoLabel}
          </span>
          {evento.areas?.map(a => (
            <span key={a.id} style={{ fontSize: 14, fontWeight: 600, padding: '3px 9px', borderRadius: 9999, background: a.color || '#64748B', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{a.nombre}</span>
          ))}
        </div>

        {/* Title */}
        <h4 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 'clamp(0.95rem,1.3vw,1.1rem)', lineHeight: 1.25, letterSpacing: '-0.015em', color: '#111827' }}>
          {evento.titulo}
        </h4>

        {/* Description */}
        {evento.descripcion && (
          <p style={{ margin: '8px 0 0', fontSize: 15, lineHeight: 1.55, color: '#6B7280', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {evento.descripcion}
          </p>
        )}

        {/* Metadata row */}
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexWrap: 'wrap', gap: '8px 20px' }}>
          {ponenteNombre && (
            <MetaItem icon={
              <svg style={{ width: 12, height: 12 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            }>{ponenteNombre}</MetaItem>
          )}
          {evento.horario?.aula && (
            <MetaItem icon={
              <svg style={{ width: 12, height: 12 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            }>Aula {evento.horario.aula.numero} · {evento.horario.aula.edificio}</MetaItem>
          )}
          {durMin && (
            <MetaItem icon={
              <svg style={{ width: 12, height: 12 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            }>{durMin} min</MetaItem>
          )}
          {evento.cupos_disponibles != null && (
            <MetaItem icon={
              <svg style={{ width: 12, height: 12 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            } color={evento.tiene_capacidad_disponible ? '#059669' : '#DC2626'}>
              {evento.cupos_disponibles} cupos
            </MetaItem>
          )}
        </div>
      </div>
    </div>
  )
}

function MetaItem({ icon, children, color = '#6B7280' }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 14, color, fontFamily: "'Space Grotesk', sans-serif" }}>
      <span style={{ color: '#005DA4', flexShrink: 0 }}>{icon}</span>
      {children}
    </span>
  )
}

// ─── Franja horaria section ───────────────────────────────────────
function FranjaSection({ grupo }) {
  const hora     = grupo.hora_inicio ? formatHora(grupo.hora_inicio) : '—'
  const horaFin  = grupo.hora_fin    ? formatHora(grupo.hora_fin)    : null
  const durMin   = grupo.hora_inicio && grupo.hora_fin
    ? Math.round((new Date(grupo.hora_fin) - new Date(grupo.hora_inicio)) / 60000) : null

  return (
    <div>
      {/* Franja header */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 14 }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 15, color: '#111827', letterSpacing: '-0.02em' }}>{hora}{horaFin && <span style={{ fontWeight: 400, color: '#9CA3AF' }}> – {horaFin}</span>}</span>
        {durMin && <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 14, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{durMin} min</span>}
        {grupo.eventos.length > 1 && (
          <span style={{ fontSize: 14, fontFamily: "'Space Mono', monospace", color: '#F59E0B', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 9999, padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {grupo.eventos.length} paralelos
          </span>
        )}
        <span style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.07)', marginLeft: 4 }} />
      </div>

      {/* Cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 380px), 1fr))', gap: 12 }}>
        {grupo.eventos.map(e => <EventoCard key={e.id} evento={e} />)}
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────
export default function Agenda() {
  const [filtroDia,  setFiltroDia]  = useState('')
  const [filtroArea, setFiltroArea] = useState(null) // { id, nombre, color } | null

  // All events — used to derive the full area list
  const allQuery      = useEventos({})
  // Filtered events — what we actually display
  const filtradosQuery = useEventos({
    dia:     filtroDia   || undefined,
    area_id: filtroArea?.id ?? undefined,
  })

  const allEventos      = useMemo(() => allQuery.data      ?? [], [allQuery.data])
  const eventosFiltrados = useMemo(() => filtradosQuery.data ?? [], [filtradosQuery.data])

  const loading = filtradosQuery.isLoading || (filtroDia === '' && filtroArea === null && allQuery.isLoading)
  const error   = filtradosQuery.error
    ? getApiErrorMessage(filtradosQuery.error, 'No se pudo cargar el programa.')
    : ''

  // Unique areas derived from the full event list
  const areas = useMemo(() => {
    const map = new Map()
    for (const e of allEventos) {
      for (const a of (e.areas ?? [])) {
        if (!map.has(a.id)) map.set(a.id, a)
      }
    }
    return [...map.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  }, [allEventos])

  // Count per day from the full (area-filtered if active) list for tab badges
  const countPerDay = useMemo(() => {
    const source = filtroArea
      ? eventosFiltrados   // if area filter active, counts from filtered set
      : allEventos
    return source.reduce((acc, e) => {
      const d = String(e.horario?.numero_dia ?? '')
      if (d) acc[d] = (acc[d] ?? 0) + 1
      return acc
    }, {})
  }, [allEventos, eventosFiltrados, filtroArea])

  const franjas = useMemo(() => groupEventosPorFranjaHoraria(eventosFiltrados), [eventosFiltrados])

  const handleDia = (v)  => { setFiltroDia(v) }
  const handleArea = (a) => { setFiltroArea(prev => prev?.id === a.id ? null : a) }

  return (
    <div>
      <AgendaHeader totalEventos={allEventos.length} />

      <div style={{ background: '#F8FAFD', minHeight: '60vh', padding: '0 clamp(20px,4vw,56px) clamp(64px,10vh,100px)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>

          {/* ── Sticky toolbar ── */}
          <div style={{ position: 'sticky', top: 96, zIndex: 50, background: '#F8FAFD', padding: '14px 0', borderBottom: '1px solid rgba(0,0,0,0.08)', marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <DayTabs active={filtroDia} onChange={handleDia} countPerDay={countPerDay} />
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 14, color: '#9CA3AF', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                {eventosFiltrados.length} evento{eventosFiltrados.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* ── Area filter chips ── */}
          {areas.length > 0 && (
            <div style={{ padding: '14px 0 18px', display: 'flex', gap: 8, flexWrap: 'wrap', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              {areas.map(a => (
                <AreaChip
                  key={a.id}
                  label={a.nombre}
                  color={a.color || '#64748B'}
                  selected={filtroArea?.id === a.id}
                  onClick={() => handleArea(a)}
                />
              ))}
              {filtroArea && (
                <button type="button" onClick={() => setFiltroArea(null)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 32, padding: '0 12px', border: '1px solid rgba(0,0,0,0.1)', background: 'transparent', color: '#9CA3AF', fontFamily: "'Space Mono', monospace", fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em', borderRadius: 9999, cursor: 'pointer', transition: 'all 150ms' }}>
                  ✕ limpiar
                </button>
              )}
            </div>
          )}

          <div style={{ paddingTop: 28 }}>
            <AlertMessage message={error} />

            {loading ? (
              <LoadingState message="Cargando programa…" />
            ) : franjas.length === 0 ? (
              <EmptyState
                icon="search"
                title="No hay actividades para este filtro."
                description="Probá otro día o área temática."
                action={
                  (filtroDia || filtroArea) && (
                    <button type="button"
                      onClick={() => { setFiltroDia(''); setFiltroArea(null) }}
                      style={{ marginTop: 12, padding: '8px 20px', background: '#005DA4', color: '#fff', border: 'none', borderRadius: 9999, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif" }}>
                      Ver todo el programa
                    </button>
                  )
                }
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
                {franjas.map(g => <FranjaSection key={g.key} grupo={g} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
