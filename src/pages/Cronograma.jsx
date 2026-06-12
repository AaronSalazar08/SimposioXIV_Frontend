import { useMemo, useState } from 'react'
import AlertMessage from '../components/ui/AlertMessage'
import EmptyState from '../components/ui/EmptyState'
import LoadingState from '../components/ui/LoadingState'
import SelectField from '../components/ui/SelectField'
import { FILTRO_DIAS, TIPO_COLORS, TIPO_LABELS, TIPO_COLOR_DEFAULT } from '../constants/eventos'
import { useCancelarInscripcion } from '../hooks/mutations/useCancelarInscripcion'
import { useMisInscripciones } from '../hooks/queries/useMisInscripciones'
import { useTimedFeedback } from '../hooks/useTimedFeedback'
import { getApiErrorMessage } from '../utils/apiErrors'
import { formatFechaConAnio, formatHora } from '../utils/date'
import { countConfirmadas, groupInscripcionesPorDia } from '../utils/inscripciones'
import { pluralize } from '../utils/pluralize'
import Spinner from '../components/ui/Spinner'

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

      <div style={{ background: '#F8FAFD', minHeight: '60vh', padding: '0 clamp(20px,4vw,56px) clamp(64px,10vh,100px)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          {/* Toolbar */}
          <div style={{ position: 'sticky', top: 96, zIndex: 50, background: '#F8FAFD', padding: '14px 0', borderBottom: '1px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <SelectField
              label="Mostrar"
              htmlFor="cronograma-filtro-dia"
              value={filtroDia}
              onChange={(e) => {
                setFiltroDia(e.target.value)
                clearFeedbackFila()
              }}
              disabled={grupos.length === 0}
              className="flex-1 min-w-[160px] max-w-xs"
            >
              {FILTRO_DIAS.map((opt) => (
                <option key={opt.value === '' ? 'todos' : opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </SelectField>
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

              <ul className="p-3 sm:p-4 space-y-3 bg-white">
                {items.map((i) => {
                  const e = i.evento
                  const tipoColor = TIPO_COLORS[e.tipo] ?? TIPO_COLOR_DEFAULT
                  const tipoLabel = TIPO_LABELS[e.tipo] ?? e.tipo
                  const cancelando = cancelandoId === i.id
                  const errorEnFila = feedbackFila?.inscripcionId === i.id
                  const TIPO_ACCENT = { apertura: '#10B981', clausura: '#EF4444', taller: '#F59E0B', charla: '#3B82F6' }
                  const tipoAccent = TIPO_ACCENT[e.tipo] ?? '#64748B'

                  return (
                    <li
                      key={i.id}
                      className="rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
                      style={{ border: '1px solid rgba(0,93,164,0.08)', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.04)' }}
                    >
                      <div className="h-[3px] w-full" style={{ background: `linear-gradient(90deg, ${tipoAccent}, rgba(0,93,164,0.3))` }} />
                      <div className="flex flex-col gap-4 min-[617px]:flex-row min-[617px]:items-start min-[617px]:gap-5 p-4 sm:p-5">
                        <div className="min-w-0 shrink-0 min-[617px]:w-36">
                          <p className="text-ucr-blue-dark font-bold text-sm tabular-nums font-mono-accent">
                            {formatHora(e.horario?.hora_inicio)}
                            <span className="font-normal" style={{ color: 'rgba(0,93,164,0.4)' }}> – </span>
                            {formatHora(e.horario?.hora_fin)}
                          </p>
                          <p className="text-sm mt-0.5 hidden min-[617px]:block" style={{ color: 'rgba(0,93,164,0.45)' }}>
                            Franja horaria
                          </p>
                        </div>

                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-sm font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${tipoColor}`}
                            >
                              {tipoLabel}
                            </span>
                            {e.areas?.map((a) => (
                              <span
                                key={a.id}
                                className="text-sm font-medium px-2 py-0.5 rounded-full text-white"
                                style={{ backgroundColor: a.color || '#64748B' }}
                              >
                                {a.nombre}
                              </span>
                            ))}
                          </div>
                          <h3 className="text-base font-bold text-gray-900 leading-snug break-words font-display" style={{ letterSpacing: '-0.01em' }}>
                            {e.titulo}
                          </h3>
                          <div className="flex flex-col gap-1.5 text-sm text-gray-500">
                            {e.horario?.aula && (
                              <p className="break-words flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-ucr-blue flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Aula {e.horario.aula.numero}, {e.horario.aula.edificio}
                              </p>
                            )}
                            {e.ponente && (
                              <p className="break-words flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-ucr-blue flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {e.ponente.nombre_completo || `${e.ponente.nombre} ${e.ponente.apellidos}`}
                              </p>
                            )}
                          </div>

                          {errorEnFila && (
                            <AlertMessage
                              type="error"
                              message={feedbackFila.message}
                              className="mb-0 mt-2 text-sm font-medium"
                            />
                          )}
                        </div>

                        <div className="shrink-0 min-[617px]:pt-0.5 max-[616px]:w-full">
                          <button
                            type="button"
                            onClick={() => handleCancelar(i)}
                            disabled={cancelando}
                            className="w-full min-[617px]:w-auto px-4 py-2 text-sm font-semibold rounded-xl border transition-all duration-200 hover:bg-rose-50 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5"
                            style={{ borderColor: 'rgba(244,63,94,0.35)', color: '#be123c' }}
                          >
                            {cancelando ? (
                              <>
                                <Spinner size="sm" className="border-rose-400" />
                                Cancelando...
                              </>
                            ) : (
                              'Cancelar'
                            )}
                          </button>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
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
