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
import {
  buildEventosApiFilters,
  conteosBadgeDiaTabs,
  countPorDiaSimposio,
} from '../utils/eventoFilters'
import { groupEventosPorFranjaHoraria } from '../utils/eventoGrouping'
import { formatHora } from '../utils/date'
import { buildInscripcionesPorEvento } from '../utils/inscripciones'
import { pluralize } from '../utils/pluralize'

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
      <section style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(145deg, #010810, #001020 40%, #001a38 70%, #002650)', padding: 'calc(clamp(36px,6vh,56px) + 96px) clamp(20px,4vw,56px) clamp(32px,5vh,48px)', marginTop: -96 }}>
        <div className="aurora-a" style={{ position: 'absolute', top: '-40%', left: '-6%', width: '46vw', height: '46vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(33,187,239,0.22), transparent 64%)', filter: 'blur(24px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)', backgroundSize: '60px 60px', WebkitMaskImage: 'radial-gradient(70% 90% at 30% 0%, #000, transparent)', maskImage: 'radial-gradient(70% 90% at 30% 0%, #000, transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 1180, margin: '0 auto' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontFamily: "'Space Mono', monospace", fontSize: 'clamp(13px,1.3vw,15px)', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#7DDAF5' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#21BBEF', flexShrink: 0 }} />
            Inscripciones · XIV Edición
          </span>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <h1 style={{ margin: '14px 0 0', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 'clamp(1.9rem,4.5vw,3.5rem)', lineHeight: 0.97, letterSpacing: '-0.04em', color: '#fff' }}>
              Reservá tu cupo.
            </h1>
            {totalInscrito > 0 && (
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 15, color: '#21BBEF', letterSpacing: '0.08em', textTransform: 'uppercase', paddingBottom: 4 }}>
                {totalInscrito} {pluralize(totalInscrito, 'inscrito', 'inscritos')}
              </span>
            )}
          </div>
          <p style={{ margin: '16px 0 0', fontSize: 'clamp(0.9rem,1.2vw,1.05rem)', lineHeight: 1.6, color: 'rgba(255,255,255,0.5)', maxWidth: '52ch' }}>
            Explorá los eventos del simposio por día y hora. Los cupos se asignan por orden de inscripción.
          </p>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, background: 'linear-gradient(90deg, transparent, #21BBEF 40%, #005DA4 70%, transparent)' }} />
      </section>

      <div style={{ background: '#F8FAFD', minHeight: '60vh', padding: '0 clamp(20px,4vw,56px) clamp(64px,10vh,100px)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          {/* Sticky day tabs toolbar */}
          <div style={{ position: 'sticky', top: 96, zIndex: 50, background: '#F8FAFD', padding: '14px 0', borderBottom: '1px solid rgba(0,0,0,0.08)', marginBottom: 0 }}>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {franjasOrdenadas.map((grupo) => {
                    const indiceErrorEnGrupo =
                      feedback?.type === 'error'
                        ? grupo.eventos.findIndex((e) => e.id === feedback.eventoId)
                        : -1
                    const carouselKey =
                      indiceErrorEnGrupo >= 0 ? `${grupo.key}-alerta-${feedback.eventoId}` : grupo.key
                    const horaInicio = grupo.hora_inicio ? formatHora(grupo.hora_inicio) : '—'
                    const durMin = grupo.hora_inicio && grupo.hora_fin
                      ? Math.round((new Date(grupo.hora_fin) - new Date(grupo.hora_inicio)) / 60000)
                      : null
                    const anyInscrito = grupo.eventos.some(e => inscripcionesPorEvento.has(e.id))
                    return (
                      <section key={grupo.key} style={{ display: 'flex', alignItems: 'flex-start' }}>
                        {/* Time column */}
                        <div style={{ width: 100, flexShrink: 0, paddingTop: 18, paddingRight: 14, textAlign: 'right' }}>
                          <div style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 19, color: '#111827', letterSpacing: '-0.02em' }}>
                            {horaInicio}
                          </div>
                          {durMin && (
                            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 14, color: '#9CA3AF', marginTop: 3 }}>
                              {durMin} min
                            </div>
                          )}
                        </div>
                        {/* Dot */}
                        <div style={{ flexShrink: 0, paddingTop: 24, width: 22, display: 'flex', justifyContent: 'center' }}>
                          <div style={{ width: 11, height: 11, borderRadius: '50%', background: anyInscrito ? '#21BBEF' : '#D1D5DB' }} />
                        </div>
                        {/* Carousel */}
                        <div style={{ flex: 1, marginLeft: 14, minWidth: 0 }}>
                          {grupo.eventos.length > 1 && (
                            <div style={{ marginBottom: 10 }}>
                              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#92400E', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 9999, padding: '4px 12px' }}>
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
