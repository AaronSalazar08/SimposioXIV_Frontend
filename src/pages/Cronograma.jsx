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
import { nombresPonentesEvento } from '../utils/ponentes'

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
      <section
        className="pt-[120px] md:pt-[140px]"
        style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(145deg, #010810, #001020 40%, #001a38 70%, #002650)', paddingLeft: 'clamp(20px,4vw,56px)', paddingRight: 'clamp(20px,4vw,56px)', paddingBottom: 'clamp(32px,5vh,48px)', marginTop: -96 }}
      >
        <div className="aurora-a" style={{ position: 'absolute', top: '-40%', left: '-6%', width: '46vw', height: '46vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(33,187,239,0.22), transparent 64%)', filter: 'blur(24px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)', backgroundSize: '60px 60px', WebkitMaskImage: 'radial-gradient(70% 90% at 30% 0%, #000, transparent)', maskImage: 'radial-gradient(70% 90% at 30% 0%, #000, transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 1180, margin: '0 auto' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontFamily: "var(--font-pixel)", fontSize: 'clamp(18px,1.3vw,20px)', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#7DDAF5' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#21BBEF', flexShrink: 0 }} />
            Mi Agenda · XIV Edición
          </span>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <h1 style={{ margin: '14px 0 0', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 'clamp(1.9rem,4.5vw,3.5rem)', lineHeight: 0.97, letterSpacing: '-0.04em', color: '#fff' }}>
              Tu plan del Simposio.
            </h1>
            {total > 0 && (
              <span style={{ fontFamily: "var(--font-pixel)", fontSize: 20, color: '#21BBEF', letterSpacing: '0.08em', textTransform: 'uppercase', paddingBottom: 4 }}>
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

      <div style={{ background: '#F8FAFD', minHeight: '40vh', padding: '0 clamp(20px,4vw,56px) clamp(64px,10vh,100px)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          {/* Toolbar */}
          <div className="top-[110px] sm:top-[110px]" style={{ position: 'sticky', zIndex: 50, background: '#F8FAFD', padding: '14px 0', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
            <div
              className="flex sm:inline-flex w-full sm:w-auto rounded-full gap-[3px]"
              role="tablist"
              aria-label="Filtrar por día"
              style={{ background: 'rgba(0,0,0,0.07)', padding: 5, opacity: grupos.length === 0 ? 0.4 : 1, pointerEvents: grupos.length === 0 ? 'none' : 'auto' }}
            >
              {['', '1', '2', '3'].map((value) => {
                const on = filtroDia === value
                return (
                  <button
                    key={value || 'todos'}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    onClick={() => { setFiltroDia(value); clearFeedbackFila() }}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center"
                    style={{
                      gap: 'clamp(5px,1vw,9px)',
                      height: 'clamp(38px,5vh,50px)',
                      padding: '0 clamp(10px,2.5vw,22px)',
                      border: 'none', borderRadius: 9999,
                      background: on ? '#111827' : 'transparent',
                      boxShadow: on ? '0 1px 6px rgba(0,0,0,0.2)' : 'none',
                      color: on ? '#fff' : '#6B7280',
                      fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 'clamp(14px,1.5vw,19px)',
                      cursor: 'pointer', transition: 'all 150ms', whiteSpace: 'nowrap',
                    }}
                  >
                    {DAY_LABELS[value]}
                    {DAY_DATES[value] && (
                      <span className="hidden sm:inline" style={{ fontFamily: "var(--font-pixel)", fontSize: 'clamp(14px,1.5vw,20px)', opacity: on ? 0.6 : 0.7 }}>
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
                  const ponentesTexto = nombresPonentesEvento(e).join(', ')

                  return (
                    <li key={i.id} className="flex flex-col sm:flex-row items-start" style={{ listStyle: 'none', margin: 0 }}>
                      {/* Time info — row on mobile, column on desktop */}
                      <div className="flex sm:flex-col items-center sm:items-end gap-1.5 sm:gap-0 mb-2 sm:mb-0 sm:w-[100px] sm:shrink-0 sm:pt-[18px] sm:pr-[14px] sm:text-right">
                        <div style={{ fontFamily: "var(--font-pixel)", fontWeight: 700, fontSize: 'clamp(17px,2vw,24px)', color: '#111827', letterSpacing: '-0.02em' }}>
                          {formatHora(e.horario?.hora_inicio)}
                        </div>
                        {e.horario?.hora_fin && (
                          <div style={{ fontFamily: "var(--font-pixel)", fontSize: 'clamp(13px,1.5vw,19px)', color: '#9CA3AF' }}>
                            –{formatHora(e.horario.hora_fin)}
                          </div>
                        )}
                      </div>
                      {/* Dot — visible only on desktop */}
                      <div className="hidden sm:flex shrink-0 pt-[24px] w-[22px] justify-center">
                        <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#21BBEF' }} />
                      </div>
                      {/* Card */}
                      <div className="flex-1 w-full sm:ml-[14px] min-w-0" style={{ background: '#F0F9FF', border: '1px solid rgba(33,187,239,0.25)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(33,187,239,0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 22px' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            {/* Meta row */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 10 }}>
                              <span style={{ fontFamily: "var(--font-pixel)", fontSize: 18, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', padding: '4px 10px', borderRadius: 9999, background: tipoBg, color: tipoFg, border: `1px solid ${accent}33` }}>
                                {tipoLabel}
                              </span>
                              {e.areas?.map((a) => (
                                <span key={a.id} style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '4px 10px', borderRadius: 9999, background: a.color || '#64748B', color: '#fff' }}>
                                  {a.nombre}
                                </span>
                              ))}
                              {e.horario?.aula && (
                                <span style={{ fontFamily: "var(--font-pixel)", fontSize: 19, color: '#6B7280' }}>
                                  {e.horario.aula.edificio} · {e.horario.aula.numero}
                                </span>
                              )}
                            </div>
                            {/* Title */}
                            <h3 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 'clamp(1.15rem,1.8vw,1.35rem)', lineHeight: 1.25, letterSpacing: '-0.01em', color: '#111827' }}>
                              {e.titulo}
                            </h3>
                            {/* Ponentes */}
                            {ponentesTexto && (
                              <p style={{ margin: '7px 0 0', fontSize: 16, color: '#6B7280', fontFamily: "'Space Grotesk', sans-serif" }}>
                                {ponentesTexto}
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
