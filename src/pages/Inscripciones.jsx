import { useMemo, useState } from 'react'
import EventoSlotCarousel from '../components/EventoSlotCarousel'
import ConfirmacionInscripcionModal from '../components/inscripciones/ConfirmacionInscripcionModal'
import EventoCardInscripcion from '../components/inscripciones/EventoCardInscripcion'
import InscripcionesDiaTabs from '../components/inscripciones/InscripcionesDiaTabs'
import AlertMessage from '../components/ui/AlertMessage'
import EmptyState from '../components/ui/EmptyState'
import FetchingBanner from '../components/ui/FetchingBanner'
import LoadingState from '../components/ui/LoadingState'
import { useInscripcionMutations } from '../hooks/mutations/useInscripcionMutations'
import { useEventos } from '../hooks/queries/useEventos'
import { useMisInscripciones } from '../hooks/queries/useMisInscripciones'
import { useTimedFeedback } from '../hooks/useTimedFeedback'
import { getApiErrorMessage } from '../utils/apiErrors'
import { cx } from '../utils/cx'
import {
  buildEventosApiFilters,
  conteosBadgeDiaTabs,
  countPorDiaSimposio,
} from '../utils/eventoFilters'
import { groupEventosPorFranjaHoraria } from '../utils/eventoGrouping'
import { formatHora } from '../utils/date'
import { buildInscripcionesPorEvento } from '../utils/inscripciones'

/** Panel tipo "tablero de salidas": estado de reserva en vivo para el día activo. */
function StatusTile({ label, value, accent = false }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
      <div
        className={cx(
          'font-display text-[1.6rem] font-bold leading-none tracking-[-0.03em] sm:text-[2rem]',
          accent ? 'text-brand-cyan' : 'text-white',
        )}
      >
        {value}
      </div>
      <div className="mt-1.5 font-pixel text-[11px] uppercase tracking-[0.14em] text-white/45">
        {label}
      </div>
    </div>
  )
}

export default function Inscripciones() {
  const { feedback, showFeedback, clearFeedback } = useTimedFeedback(null, 6000)
  const [accion, setAccion] = useState({ eventoId: null, inscripcionId: null, tipo: null })
  const [eventoParaConfirmar, setEventoParaConfirmar] = useState(null)

  const [filtroDia, setFiltroDia] = useState('1')
  const [appliedFilters, setAppliedFilters] = useState({ dia: '1' })

  const eventosQuery = useEventos(appliedFilters)
  const todosEventosQuery = useEventos({})
  const inscripcionesQuery = useMisInscripciones()

  const eventos = useMemo(() => eventosQuery.data ?? [], [eventosQuery.data])
  const inscripciones = useMemo(() => inscripcionesQuery.data ?? [], [inscripcionesQuery.data])

  const loadingInicial = eventosQuery.isLoading || inscripcionesQuery.isLoading
  const refrescandoEventos = eventosQuery.isFetching && !eventosQuery.isLoading

  const error =
    (eventosQuery.error &&
      getApiErrorMessage(eventosQuery.error, 'No se pudieron cargar los eventos.')) ||
    (inscripcionesQuery.error &&
      getApiErrorMessage(inscripcionesQuery.error, 'No se pudieron cargar los eventos.')) ||
    ''

  const inscripcionesPorEvento = useMemo(
    () => buildInscripcionesPorEvento(inscripciones),
    [inscripciones],
  )

  const { inscribirMutation, cancelarMutation } = useInscripcionMutations({
    appliedFilters,
    showFeedback,
  })

  const handleSelectDia = (dia) => {
    setFiltroDia(dia)
    clearFeedback()
    setAppliedFilters(buildEventosApiFilters({ dia }))
  }

  const handleInscribirse = (evento) => {
    clearFeedback()
    setEventoParaConfirmar(evento)
  }

  const handleConfirmarInscripcion = () => {
    const evento = eventoParaConfirmar
    if (!evento) return
    setAccion({ eventoId: evento.id, inscripcionId: null, tipo: 'inscribir' })
    inscribirMutation.mutate(evento, {
      onSettled: () => {
        setAccion({ eventoId: null, inscripcionId: null, tipo: null })
        setEventoParaConfirmar(null)
      },
    })
  }

  const handleCancelar = (inscripcionId, evento) => {
    if (!inscripcionId) return
    clearFeedback()
    setAccion({ eventoId: evento.id, inscripcionId, tipo: 'cancelar' })
    cancelarMutation.mutate(
      { inscripcionId, evento },
      {
        onSettled: () => setAccion({ eventoId: null, inscripcionId: null, tipo: null }),
      },
    )
  }

  const totalInscrito = inscripcionesPorEvento.size

  const conteosPorDia = useMemo(() => {
    const inscripcionesPorDia = countPorDiaSimposio(
      inscripciones,
      (i) => i.evento?.horario?.numero_dia,
    )
    const eventosPorDia = countPorDiaSimposio(
      todosEventosQuery.data ?? [],
      (e) => e.horario?.numero_dia,
    )
    return conteosBadgeDiaTabs({ inscripcionesPorDia, eventosPorDia })
  }, [inscripciones, todosEventosQuery.data])

  const franjasOrdenadas = useMemo(() => groupEventosPorFranjaHoraria(eventos), [eventos])

  const inscritoEsteDia = useMemo(
    () => eventos.filter((e) => inscripcionesPorEvento.has(e.id)).length,
    [eventos, inscripcionesPorEvento],
  )
  const conCupoEsteDia = useMemo(
    () => eventos.filter((e) => e.tiene_capacidad_disponible).length,
    [eventos],
  )

  const cardProps = {
    inscripcionesPorEvento,
    accion,
    feedback,
    onInscribirse: handleInscribirse,
    onCancelar: handleCancelar,
  }

  const inscribiendoEnModal =
    !!eventoParaConfirmar &&
    accion.tipo === 'inscribir' &&
    accion.eventoId === eventoParaConfirmar?.id

  return (
    <>
    <ConfirmacionInscripcionModal
      evento={eventoParaConfirmar}
      inscribiendo={inscribiendoEnModal}
      onConfirmar={handleConfirmarInscripcion}
      onCancelar={() => setEventoParaConfirmar(null)}
    />
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
            Inscripciones · XIV Edición
          </span>
          <h1 style={{ margin: '14px 0 0', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 'clamp(1.9rem,4.5vw,3.5rem)', lineHeight: 0.97, letterSpacing: '-0.04em', color: '#fff' }}>
            Reservá tu <span className="ed" style={{ color: '#21BBEF' }}>lugar.</span>
          </h1>
          <p style={{ margin: '16px 0 0', fontSize: 'clamp(0.9rem,1.2vw,1.05rem)', lineHeight: 1.6, color: 'rgba(255,255,255,0.5)', maxWidth: '52ch' }}>
            Explorá los eventos del simposio por día y hora. Los cupos se asignan por orden de inscripción.
          </p>

          {/* Live status strip — tablero de estado del día activo */}
          <div className="mt-6 grid grid-cols-3 gap-2.5 sm:mt-8 sm:max-w-xl sm:gap-3">
            <StatusTile label="Reservadas hoy" value={inscritoEsteDia} accent={inscritoEsteDia > 0} />
            <StatusTile label="Con cupo" value={`${conCupoEsteDia}/${eventos.length || 0}`} />
            <StatusTile label="Total reservado" value={totalInscrito} />
          </div>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, background: 'linear-gradient(90deg, transparent, #21BBEF 40%, #005DA4 70%, transparent)' }} />
      </section>

      <div style={{ background: '#F8FAFD', minHeight: '60vh', padding: '0 clamp(20px,4vw,56px) clamp(64px,10vh,100px)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          {/* Sticky day tabs toolbar */}
          <div className="top-[110px] sm:top-[134px]" style={{ position: 'sticky', zIndex: 40, background: '#F8FAFD', padding: '14px 0', borderBottom: '1px solid rgba(0,0,0,0.08)', marginBottom: 0 }}>
            <InscripcionesDiaTabs
              diaActivo={filtroDia}
              onSelectDia={handleSelectDia}
              conteosPorDia={conteosPorDia}
            />
          </div>
          <div style={{ paddingTop: 28 }}>

          <AlertMessage message={error} />

          {loadingInicial ? (
            <LoadingState message="Cargando eventos..." />
          ) : (
            <>
              {refrescandoEventos && <FetchingBanner />}

              {eventos.length === 0 ? (
                <EmptyState
                  icon="search"
                  title="No se encontraron eventos."
                  description="No hay eventos programados para este día."
                />
              ) : (
                <div className="relative flex flex-col gap-4">
                  {/* Itinerary thread — connects the time nodes on desktop */}
                  <div
                    className="absolute bottom-0 top-[29px] hidden w-px sm:block"
                    style={{
                      left: 111,
                      backgroundImage: 'repeating-linear-gradient(to bottom, var(--color-ucr-blue) 0 4px, transparent 4px 10px)',
                      opacity: 0.18,
                      WebkitMaskImage: 'linear-gradient(to bottom, #000 75%, transparent)',
                      maskImage: 'linear-gradient(to bottom, #000 75%, transparent)',
                    }}
                    aria-hidden
                  />
                  {franjasOrdenadas.map((grupo) => {
                    const indiceErrorEnGrupo =
                      feedback?.type === 'error'
                        ? grupo.eventos.findIndex((e) => e.id === feedback.eventoId)
                        : -1
                    const carouselKey =
                      indiceErrorEnGrupo >= 0 ? `${grupo.key}-alerta-${feedback.eventoId}` : grupo.key
                    const horaInicio = grupo.hora_inicio ? formatHora(grupo.hora_inicio) : '—'
                    const horaFin = grupo.hora_fin ? formatHora(grupo.hora_fin) : null
                    const durMin = grupo.hora_inicio && grupo.hora_fin
                      ? Math.round((new Date(grupo.hora_fin) - new Date(grupo.hora_inicio)) / 60000)
                      : null
                    const anyInscrito = grupo.eventos.some(e => inscripcionesPorEvento.has(e.id))
                    return (
                      <section key={grupo.key} className="relative flex flex-col items-start sm:flex-row">
                        {/* Time info — horizontal row on mobile, vertical column on desktop */}
                        <div className="mb-2 flex items-center gap-1.5 sm:mb-0 sm:w-[100px] sm:shrink-0 sm:flex-col sm:items-end sm:gap-0 sm:pr-[14px] sm:pt-[18px] sm:text-right">
                          <div className="font-pixel text-[clamp(17px,2vw,24px)] font-bold leading-[1.05] tracking-[-0.02em] text-slate-900">
                            {horaInicio}
                          </div>
                          {horaFin && (
                            <div className="font-pixel text-[clamp(15px,1.8vw,20px)] font-bold leading-[1.05] tracking-[-0.02em] text-slate-500">
                              – {horaFin}
                            </div>
                          )}
                          {durMin && (
                            <div className="font-pixel text-[clamp(12px,1.4vw,16px)] text-slate-400">
                              {durMin} min
                            </div>
                          )}
                        </div>
                        {/* Node — visible only on desktop */}
                        <div className="z-[1] hidden w-[22px] shrink-0 justify-center pt-[24px] sm:flex">
                          <span
                            className={cx(
                              'h-[11px] w-[11px] rounded-full border-2 border-white transition-transform duration-300 ease-out',
                              anyInscrito ? 'bg-brand-cyan shadow-glow-cyan' : 'bg-slate-300',
                            )}
                          />
                        </div>
                        {/* Carousel */}
                        <div className="min-w-0 w-full flex-1 sm:ml-[14px]">
                          {grupo.eventos.length > 1 && (
                            <div className="mb-2.5">
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-status-scarce/25 bg-status-scarce/10 px-3 py-1 font-pixel text-[12px] font-bold uppercase tracking-wider text-status-scarce">
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                                {grupo.eventos.length} en paralelo
                              </span>
                            </div>
                          )}
                          <EventoSlotCarousel
                            key={carouselKey}
                            initialIndex={indiceErrorEnGrupo >= 0 ? indiceErrorEnGrupo : 0}
                          >
                            {grupo.eventos.map((evento) => (
                              <EventoCardInscripcion key={evento.id} evento={evento} {...cardProps} />
                            ))}
                          </EventoSlotCarousel>
                        </div>
                      </section>
                    )
                  })}
                </div>
              )}
            </>
          )}
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
