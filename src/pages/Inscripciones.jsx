import { useMemo, useState } from 'react'
import EventoSlotCarousel from '../components/EventoSlotCarousel'
import EventoCardInscripcion from '../components/inscripciones/EventoCardInscripcion'
import AlertMessage from '../components/ui/AlertMessage'
import EmptyState from '../components/ui/EmptyState'
import FetchingBanner from '../components/ui/FetchingBanner'
import LoadingState from '../components/ui/LoadingState'
import PageHeader from '../components/ui/PageHeader'
import SelectField from '../components/ui/SelectField'
import { FILTRO_DIAS, FILTRO_TIPOS } from '../constants/eventos'
import { VISTAS_INSCRIPCIONES } from '../constants/inscripciones'
import { useInscripcionMutations } from '../hooks/mutations/useInscripcionMutations'
import { useEventos } from '../hooks/queries/useEventos'
import { useMisInscripciones } from '../hooks/queries/useMisInscripciones'
import { useTimedFeedback } from '../hooks/useTimedFeedback'
import { getApiErrorMessage } from '../utils/apiErrors'
import { buildEventosApiFilters } from '../utils/eventoFilters'
import {
  etiquetaFranjaHoraria,
  groupEventosPorFranjaHoraria,
  ordenarEventosPlano,
} from '../utils/eventoGrouping'
import { buildInscripcionesPorEvento } from '../utils/inscripciones'
import { pluralize } from '../utils/pluralize'

export default function Inscripciones() {
  const { feedback, showFeedback, clearFeedback } = useTimedFeedback(null, 6000)
  const [accion, setAccion] = useState({ eventoId: null, inscripcionId: null, tipo: null })

  const [filtroDia, setFiltroDia] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [soloDisponibles, setSoloDisponibles] = useState(false)
  const [vistaPresentacion, setVistaPresentacion] = useState('franjas')
  const [appliedFilters, setAppliedFilters] = useState({})

  const eventosQuery = useEventos(appliedFilters)
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

  const aplicarFiltros = () => {
    clearFeedback()
    setAppliedFilters(
      buildEventosApiFilters({
        dia: filtroDia,
        tipo: filtroTipo,
        soloDisponibles,
      }),
    )
  }

  const limpiarFiltros = () => {
    setFiltroDia('')
    setFiltroTipo('')
    setSoloDisponibles(false)
    clearFeedback()
    setAppliedFilters({})
  }

  const handleInscribirse = (evento) => {
    clearFeedback()
    setAccion({ eventoId: evento.id, inscripcionId: null, tipo: 'inscribir' })
    inscribirMutation.mutate(evento, {
      onSettled: () => setAccion({ eventoId: null, inscripcionId: null, tipo: null }),
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
  const franjasOrdenadas = useMemo(() => groupEventosPorFranjaHoraria(eventos), [eventos])
  const eventosPlanoOrdenados = useMemo(() => ordenarEventosPlano(eventos), [eventos])

  const cardProps = {
    inscripcionesPorEvento,
    accion,
    feedback,
    onInscribirse: handleInscribirse,
    onCancelar: handleCancelar,
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title="Inscripciones"
        badge={
          <>
            <span className="font-semibold text-ucr-blue">{totalInscrito}</span>{' '}
            {pluralize(totalInscrito, 'evento inscrito', 'eventos inscritos')}
          </>
        }
        description={
          <>
            Explora los eventos del Simposio XIV y reserva tu cupo. Los cupos se asignan por orden de
            inscripción. La vista por defecto es la agenda por horario; si preferís ver todas las
            tarjetas a la vez, elegí{' '}
            <span className="font-medium text-gray-800">Todos los eventos</span> en Vista.
          </>
        }
      >
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:flex-wrap">
          <SelectField
            label="Día"
            htmlFor="filtro-dia"
            value={filtroDia}
            onChange={(e) => setFiltroDia(e.target.value)}
            className="flex-1 min-w-[140px]"
          >
            {FILTRO_DIAS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Tipo"
            htmlFor="filtro-tipo"
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="flex-1 min-w-[140px]"
          >
            {FILTRO_TIPOS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Vista"
            htmlFor="vista-presentacion"
            value={vistaPresentacion}
            onChange={(e) => setVistaPresentacion(e.target.value)}
            className="flex-1 min-w-[200px] sm:min-w-[220px]"
          >
            {VISTAS_INSCRIPCIONES.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </SelectField>
          <div className="flex items-center gap-2 pb-2 sm:pb-2.5">
            <input
              id="solo-disponibles"
              type="checkbox"
              checked={soloDisponibles}
              onChange={(e) => setSoloDisponibles(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-ucr-blue focus:ring-ucr-blue"
            />
            <label htmlFor="solo-disponibles" className="text-sm text-gray-700">
              Solo con cupos disponibles
            </label>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={aplicarFiltros}
              className="px-4 py-2 bg-ucr-blue hover:bg-ucr-blue-dark text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Aplicar
            </button>
            <button
              type="button"
              onClick={limpiarFiltros}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>
      </PageHeader>

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
              description="Prueba ajustando los filtros."
            />
          ) : vistaPresentacion === 'todos' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {eventosPlanoOrdenados.map((evento) => (
                <EventoCardInscripcion key={evento.id} evento={evento} {...cardProps} />
              ))}
            </div>
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
  )
}
