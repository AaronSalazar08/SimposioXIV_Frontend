import { useMemo, useState } from 'react'
import EventoSlotCarousel from '../components/EventoSlotCarousel'
import ConfirmacionInscripcionModal from '../components/inscripciones/ConfirmacionInscripcionModal'
import EventoCardInscripcion from '../components/inscripciones/EventoCardInscripcion'
import InscripcionesDiaTabs from '../components/inscripciones/InscripcionesDiaTabs'
import AlertMessage from '../components/ui/AlertMessage'
import EmptyState from '../components/ui/EmptyState'
import FetchingBanner from '../components/ui/FetchingBanner'
import LoadingState from '../components/ui/LoadingState'
import PageHeader from '../components/ui/PageHeader'
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
import { etiquetaFranjaHoraria, groupEventosPorFranjaHoraria } from '../utils/eventoGrouping'
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title="Inscripciones"
        badge={
          <>
            <span className="font-semibold text-ucr-blue">{totalInscrito}</span>{' '}
            {pluralize(totalInscrito, 'evento inscrito', 'eventos inscritos')}
          </>
        }
        description="Explorá los eventos del simposio organizados por día y hora. Los cupos se asignan por orden de inscripción."
      />

      <InscripcionesDiaTabs
        diaActivo={filtroDia}
        onSelectDia={handleSelectDia}
        conteosPorDia={conteosPorDia}
      />

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
            <div className="space-y-10">
              {franjasOrdenadas.map((grupo) => {
                const indiceErrorEnGrupo =
                  feedback?.type === 'error'
                    ? grupo.eventos.findIndex((e) => e.id === feedback.eventoId)
                    : -1
                const carouselKey =
                  indiceErrorEnGrupo >= 0 ? `${grupo.key}-alerta-${feedback.eventoId}` : grupo.key
                return (
                  <section key={grupo.key} className="scroll-mt-4">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 pl-1 border-l-4 border-ucr-blue">
                      <h2 className="text-base sm:text-lg font-bold text-ucr-blue-dark capitalize">
                        {etiquetaFranjaHoraria(grupo)}
                      </h2>
                      {grupo.eventos.length > 1 && (
                        <span className="text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                          {grupo.eventos.length} eventos en paralelo
                        </span>
                      )}
                    </div>
                    <EventoSlotCarousel
                      key={carouselKey}
                      initialIndex={indiceErrorEnGrupo >= 0 ? indiceErrorEnGrupo : 0}
                    >
                      {grupo.eventos.map((evento) => (
                        <EventoCardInscripcion key={evento.id} evento={evento} {...cardProps} />
                      ))}
                    </EventoSlotCarousel>
                  </section>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
    </>
  )
}
