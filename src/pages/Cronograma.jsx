import { useMemo, useState } from 'react'
import AlertMessage from '../components/ui/AlertMessage'
import EmptyState from '../components/ui/EmptyState'
import LoadingState from '../components/ui/LoadingState'
import Spinner from '../components/ui/Spinner'
import { TIPO_LABELS } from '../constants/eventos'
import { useCancelarInscripcion } from '../hooks/mutations/useCancelarInscripcion'
import { useMisInscripciones } from '../hooks/queries/useMisInscripciones'
import { useTimedFeedback } from '../hooks/useTimedFeedback'
import { getApiErrorMessage } from '../utils/apiErrors'
import { formatFechaConAnio, formatHora } from '../utils/date'
import { countConfirmadas, groupInscripcionesPorDia } from '../utils/inscripciones'
import { pluralize } from '../utils/pluralize'

const TIPO_ACCENT_CRONO = { apertura: '#10B981', clausura: '#EF4444', taller: '#F59E0B', charla: '#21BBEF' }
const TIPO_BG_CRONO     = { apertura: '#ECFDF5', clausura: '#FEF2F2', taller: '#FFFBEB', charla: '#EFF8FF' }
const TIPO_FG_CRONO     = { apertura: '#065F46', clausura: '#991B1B', taller: '#92400E', charla: '#0C4A6E' }
const DAY_LABELS = { '': 'Todos', '1': 'Día 1', '2': 'Día 2', '3': 'Día 3' }
const DAY_DATES  = { '1': '05 Ago', '2': '06 Ago', '3': '07 Ago' }

export default function Cronograma() {
  const [cancelandoId, setCancelandoId] = useState(null)
  const { feedback, showFeedback } = useTimedFeedback(null, 5000)
  const {
    feedback: feedbackFila,
    showFeedback: showFeedbackFila,
    clearFeedback: clearFeedbackFila,
  } = useTimedFeedback(null, 8000)
  const [filtroDia, setFiltroDia] = useState('')

  const inscripcionesQuery = useMisInscripciones()
  const inscripciones = useMemo(() => inscripcionesQuery.data ?? [], [inscripcionesQuery.data])
  const loading = inscripcionesQuery.isLoading
  const error = inscripcionesQuery.error
    ? getApiErrorMessage(inscripcionesQuery.error, 'No se pudo cargar el cronograma.')
    : ''

  const cancelarMutation = useCancelarInscripcion({
    onSuccess: (inscripcion) => {
      showFeedback({
        type: 'success',
        message: `Cancelaste tu inscripción a "${inscripcion.evento.titulo}".`,
      })
    },
    onError: (err, inscripcion) => {
      showFeedbackFila({
        inscripcionId: inscripcion.id,
        message: getApiErrorMessage(err, 'No se pudo cancelar la inscripción.'),
      })
    },
  })

  const grupos = useMemo(() => groupInscripcionesPorDia(inscripciones), [inscripciones])

  const gruposFiltrados = useMemo(() => {
    if (filtroDia === '') return grupos
    const d = Number(filtroDia)
    return grupos.filter((g) => g.dia === d)
  }, [grupos, filtroDia])

  const total = useMemo(() => countConfirmadas(inscripciones), [inscripciones])

  const handleCancelar = (inscripcion) => {
    clearFeedbackFila()
    setCancelandoId(inscripcion.id)
    cancelarMutation.mutate(inscripcion, {
      onSettled: () => setCancelandoId(null),
    })
  }

  return (
    <div>
      {/* Cinematic header */}
      <section style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(145deg, #010810, #001020 40%, #001a38 70%, #002650)', padding: 'calc(clamp(36px,6vh,56px) + 96px) clamp(20px,4vw,56px) clamp(32px,5vh,48px)', marginTop: -96 }}>
        <div className="aurora-a" style={{ position: 'absolute', top: '-40%', left: '-6%', width: '46vw', height: '46vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(33,187,239,0.22), transparent 64%)', filter: 'blur(24px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)', backgroundSize: '60px 60px', WebkitMaskImage: 'radial-gradient(70% 90% at 30% 0%, #000, transparent)', maskImage: 'radial-gradient(70% 90% at 30% 0%, #000, transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 1180, margin: '0 auto' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontFamily: "'Space Mono', monospace", fontSize: 'clamp(13px,1.3vw,15px)', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#7DDAF5' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#21BBEF', flexShrink: 0 }} />
            Mi Agenda · XIV Edición
          </span>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <h1 style={{ margin: '14px 0 0', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 'clamp(1.9rem,4.5vw,3.5rem)', lineHeight: 0.97, letterSpacing: '-0.04em', color: '#fff' }}>
              Tu plan del Simposio.
            </h1>
            {total > 0 && (
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 15, color: '#21BBEF', letterSpacing: '0.08em', textTransform: 'uppercase', paddingBottom: 4 }}>
                {total} {pluralize(total, 'confirmado', 'confirmados')}
              </span>
            )}
          </div>
          <p style={{ margin: '16px 0 0', fontSize: 'clamp(0.9rem,1.2vw,1.05rem)', lineHeight: 1.6, color: 'rgba(255,255,255,0.5)', maxWidth: '52ch' }}>
            Tus inscripciones confirmadas, ordenadas por día y hora. Cancelá desde cada evento si necesitás liberar el cupo.
          </p>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, background: 'linear-gradient(90deg, transparent, #21BBEF 40%, #005DA4 70%, transparent)' }} />
      </section>

      {/* ── Día 1: Cronograma general de llegada ─────────────────────── */}
      <div style={{ background: '#F8FAFD', padding: 'clamp(32px,5vh,52px) clamp(20px,4vw,56px) 0' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(0,93,164,0.14)', boxShadow: '0 4px 24px rgba(0,93,164,0.08)' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #003A6E, #004A87, #005DA4)', padding: '22px 28px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#fff', flexShrink: 0 }}>01</div>
                <div>
                  <p style={{ margin: 0, fontFamily: "'Space Mono', monospace", fontSize: 13, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(33,187,239,0.9)' }}>Día 1 · General</p>
                  <h2 style={{ margin: '3px 0 0', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 'clamp(1rem,2vw,1.2rem)', color: '#fff', letterSpacing: '-0.01em' }}>Miércoles 05 de Agosto</h2>
                </div>
              </div>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: 'rgba(255,255,255,0.75)', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 9999, padding: '6px 14px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Aplica para todos</span>
            </div>

            {/* Filas */}
            <div style={{ background: '#fff' }}>
              {[
                { hora: '15:00 – 17:30', actividad: 'Asignación de habitaciones a Estudiantes', lugar: 'Hotel Las Espuelas', icono: '🏨' },
                { hora: null,            actividad: 'Traslado de estudiantes a la UCR',          lugar: null,               icono: '🚌' },
                { hora: '17:30 – 18:30', actividad: 'Cena',                                       lugar: 'UCR · Salón Multiusos', icono: '🍽️' },
                { hora: '19:00 – 21:00', actividad: 'Actividad Deportiva',                        lugar: 'Gimnasio UCR',     icono: '⚽' },
              ].map(({ hora, actividad, lugar, icono }, idx, arr) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '160px 1fr auto', alignItems: 'center', gap: '12px 20px', padding: '18px 28px', borderBottom: idx < arr.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}>
                  {/* Hora */}
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 14, fontWeight: 600, color: hora ? '#005DA4' : 'transparent', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{hora ?? '–'}</span>
                  {/* Actividad */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{icono}</span>
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, fontSize: 'clamp(0.95rem,1.2vw,1.05rem)', color: '#111827' }}>{actividad}</span>
                  </div>
                  {/* Lugar */}
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: '#6B7280', textAlign: 'right', whiteSpace: 'nowrap' }}>{lugar ?? ''}</span>
                </div>
              ))}
            </div>

            {/* Aviso importante */}
            <div style={{ background: 'linear-gradient(90deg, #FEF9EC, #FFFBF0)', borderTop: '1px solid rgba(245,158,11,0.25)', padding: '16px 28px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>📌</span>
              <p style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(0.9rem,1.2vw,1.05rem)', color: '#92400E', lineHeight: 1.55 }}>
                <strong>Importante:</strong> El Check In Máximo es a las <strong>7:00 pm</strong> para estudiantes en el Hotel.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: '#F8FAFD', minHeight: '40vh', padding: 'clamp(32px,5vh,48px) clamp(20px,4vw,56px) clamp(64px,10vh,100px)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          {/* Toolbar */}
          <div style={{ position: 'sticky', top: 96, zIndex: 50, background: '#F8FAFD', padding: '14px 0', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'inline-flex', background: 'rgba(0,0,0,0.07)', borderRadius: 9999, padding: 5, gap: 3, opacity: grupos.length === 0 ? 0.4 : 1, pointerEvents: grupos.length === 0 ? 'none' : 'auto' }}>
              {['', '1', '2', '3'].map((value) => {
                const on = filtroDia === value
                return (
                  <button key={value || 'todos'} type="button" onClick={() => { setFiltroDia(value); clearFeedbackFila() }} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 9,
                    height: 50, padding: '0 22px', border: 'none', borderRadius: 9999,
                    background: on ? '#111827' : 'transparent',
                    boxShadow: on ? '0 1px 6px rgba(0,0,0,0.2)' : 'none',
                    color: on ? '#fff' : '#6B7280',
                    fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 19,
                    cursor: 'pointer', transition: 'all 150ms', whiteSpace: 'nowrap',
                  }}>
                    {DAY_LABELS[value]}
                    {DAY_DATES[value] && (
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 15, opacity: on ? 0.6 : 0.7 }}>
                        · {DAY_DATES[value]}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ paddingTop: 28 }}>
            {feedback && <AlertMessage type={feedback.type} message={feedback.message} />}
            <AlertMessage message={error} />

            {loading ? (
              <LoadingState message="Cargando tu cronograma..." />
            ) : grupos.length === 0 ? (
              <EmptyState
                icon="calendar"
                title="Aún no tenés inscripciones confirmadas."
                description="Andá a la sección Inscripciones para reservar tu cupo."
              />
            ) : gruposFiltrados.length === 0 ? (
              <EmptyState
                title="No hay eventos para ese día."
                description="Probá con otro día o mostrá todos los días."
                className="p-10 text-gray-600"
                action={
                  <button
                    type="button"
                    onClick={() => setFiltroDia('')}
                    className="px-5 py-2.5 text-sm font-semibold rounded-xl text-white transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
                    style={{ background: 'linear-gradient(135deg, #005DA4, #003A6E)', boxShadow: '0 4px 12px 0 rgba(0,93,164,0.25)' }}
                  >
                    Ver todos los días
                  </button>
                }
              />
            ) : (
              <div className="space-y-8">
                {gruposFiltrados.map(({ dia, fecha, items }) => (
            <section
              key={dia}
              className="rounded-2xl overflow-hidden"
              style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.06)', border: '1px solid rgba(0,93,164,0.1)' }}
            >
              <header
                className="px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #005DA4, #004A87, #003A6E)' }}
              >
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(33,187,239,0.15), transparent 65%)', transform: 'translate(25%, -25%)' }}
                />
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 font-display"
                    style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.2)', letterSpacing: '-0.02em', fontSize: '1rem' }}
                    aria-hidden
                  >
                    {dia}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold uppercase tracking-widest font-mono-accent" style={{ color: 'rgba(33,187,239,0.9)' }}>
                      Día {dia}
                    </p>
                    <h2 className="text-base sm:text-lg font-bold capitalize leading-snug break-words font-display text-white" style={{ letterSpacing: '-0.01em' }}>
                      {formatFechaConAnio(fecha)}
                    </h2>
                  </div>
                </div>
                <span
                  className="text-sm font-semibold font-mono-accent px-3 py-1.5 rounded-full relative z-10"
                  style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.2)' }}
                >
                  {items.length} {pluralize(items.length, 'evento', 'eventos')}
                </span>
              </header>

              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10, background: '#fff' }}>
                {items.map((i) => {
                  const e = i.evento
                  const tipoLabel = TIPO_LABELS[e.tipo] ?? e.tipo
                  const cancelando = cancelandoId === i.id
                  const errorEnFila = feedbackFila?.inscripcionId === i.id
                  const accent  = TIPO_ACCENT_CRONO[e.tipo] ?? '#64748B'
                  const tipoBg  = TIPO_BG_CRONO[e.tipo]    ?? 'rgba(100,116,139,0.1)'
                  const tipoFg  = TIPO_FG_CRONO[e.tipo]    ?? '#334155'
                  const ponente = e.ponente
                    ? (e.ponente.nombre_completo || `${e.ponente.nombre} ${e.ponente.apellidos}`)
                    : null

                  return (
                    <li key={i.id} style={{ display: 'flex', alignItems: 'flex-start', listStyle: 'none', margin: 0 }}>
                      {/* Time column */}
                      <div style={{ width: 100, flexShrink: 0, paddingTop: 18, paddingRight: 14, textAlign: 'right' }}>
                        <div style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 19, color: '#111827', letterSpacing: '-0.02em' }}>
                          {formatHora(e.horario?.hora_inicio)}
                        </div>
                        {e.horario?.hora_fin && (
                          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 14, color: '#9CA3AF', marginTop: 3 }}>
                            –{formatHora(e.horario.hora_fin)}
                          </div>
                        )}
                      </div>
                      {/* Dot — always cyan (inscribed) */}
                      <div style={{ flexShrink: 0, paddingTop: 24, width: 22, display: 'flex', justifyContent: 'center' }}>
                        <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#21BBEF' }} />
                      </div>
                      {/* Card */}
                      <div style={{ flex: 1, marginLeft: 14, minWidth: 0, background: '#F0F9FF', border: '1px solid rgba(33,187,239,0.25)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(33,187,239,0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 22px' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            {/* Meta row */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 10 }}>
                              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', padding: '4px 10px', borderRadius: 9999, background: tipoBg, color: tipoFg, border: `1px solid ${accent}33` }}>
                                {tipoLabel}
                              </span>
                              {e.areas?.map((a) => (
                                <span key={a.id} style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '4px 10px', borderRadius: 9999, background: a.color || '#64748B', color: '#fff' }}>
                                  {a.nombre}
                                </span>
                              ))}
                              {e.horario?.aula && (
                                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 14, color: '#6B7280' }}>
                                  {e.horario.aula.edificio} · {e.horario.aula.numero}
                                </span>
                              )}
                            </div>
                            {/* Title */}
                            <h3 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 'clamp(1.15rem,1.8vw,1.35rem)', lineHeight: 1.25, letterSpacing: '-0.01em', color: '#111827' }}>
                              {e.titulo}
                            </h3>
                            {/* Ponente */}
                            {ponente && (
                              <p style={{ margin: '7px 0 0', fontSize: 16, color: '#6B7280', fontFamily: "'Space Grotesk', sans-serif" }}>
                                {ponente}
                              </p>
                            )}
                            {/* Error feedback */}
                            {errorEnFila && (
                              <AlertMessage type="error" message={feedbackFila.message} className="mb-0 mt-2 text-sm font-medium" />
                            )}
                          </div>
                          {/* Cancel button */}
                          <button
                            type="button"
                            onClick={() => handleCancelar(i)}
                            disabled={cancelando}
                            title="Cancelar inscripción"
                            style={{ width: 50, height: 50, borderRadius: '50%', flexShrink: 0, background: '#21BBEF', border: 'none', color: '#fff', fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: cancelando ? 'not-allowed' : 'pointer', opacity: cancelando ? 0.6 : 1, boxShadow: '0 2px 8px rgba(33,187,239,0.3)', transition: 'background 150ms' }}
                            onMouseEnter={ev => { if (!cancelando) ev.currentTarget.style.background = '#DC2626' }}
                            onMouseLeave={ev => { if (!cancelando) ev.currentTarget.style.background = '#21BBEF' }}
                          >
                            {cancelando ? <Spinner size="sm" /> : '✓'}
                          </button>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </div>
              </section>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
