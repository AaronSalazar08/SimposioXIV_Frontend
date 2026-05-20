import { useMemo, useState } from 'react'
import AlertMessage from '../components/ui/AlertMessage'
import EmptyState from '../components/ui/EmptyState'
import LoadingState from '../components/ui/LoadingState'
import PageHeader from '../components/ui/PageHeader'
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PageHeader
        title="Mi cronograma"
        badge={
          <>
            <span className="font-semibold text-ucr-blue">{total}</span>{' '}
            {pluralize(total, 'evento confirmado', 'eventos confirmados')}
          </>
        }
        description="Tus inscripciones confirmadas, ordenadas por día y hora. Podés filtrar por día o ver todo el calendario. Cancelá desde cada evento si necesitás liberar el cupo."
      >
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
      </PageHeader>

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
              className="px-4 py-2 bg-ucr-blue hover:bg-ucr-blue-dark text-white text-sm font-semibold rounded-lg transition-colors"
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
              className="rounded-2xl border border-gray-200/80 bg-white shadow-sm overflow-hidden ring-1 ring-gray-100"
            >
              <header className="px-4 sm:px-6 py-4 bg-gradient-to-r from-ucr-blue-muted via-white to-white border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-11 h-11 rounded-xl bg-ucr-blue text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0"
                    aria-hidden
                  >
                    {dia}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-ucr-blue">
                      Día {dia}
                    </p>
                    <h2 className="text-base sm:text-lg font-bold text-ucr-blue-dark capitalize leading-snug break-words">
                      {formatFechaConAnio(fecha)}
                    </h2>
                  </div>
                </div>
                <span className="text-xs font-semibold text-ucr-blue-dark bg-white border border-ucr-blue/20 px-3 py-1.5 rounded-full shadow-sm">
                  {items.length} {pluralize(items.length, 'evento', 'eventos')}
                </span>
              </header>

              <ul className="p-3 sm:p-4 space-y-3">
                {items.map((i) => {
                  const e = i.evento
                  const tipoColor = TIPO_COLORS[e.tipo] ?? TIPO_COLOR_DEFAULT
                  const tipoLabel = TIPO_LABELS[e.tipo] ?? e.tipo
                  const cancelando = cancelandoId === i.id
                  const errorEnFila = feedbackFila?.inscripcionId === i.id

                  return (
                    <li
                      key={i.id}
                      className="rounded-xl border border-gray-100 bg-gray-50/40 hover:bg-ucr-blue-muted/40 hover:border-ucr-blue/15 transition-colors p-4 sm:p-5"
                    >
                      <div className="flex flex-col gap-4 min-[617px]:flex-row min-[617px]:items-start min-[617px]:gap-5">
                        <div className="min-w-0 shrink-0 min-[617px]:w-36">
                          <p className="text-ucr-blue-dark font-bold text-sm tabular-nums">
                            {formatHora(e.horario?.hora_inicio)}
                            <span className="text-gray-400 font-normal"> – </span>
                            {formatHora(e.horario?.hora_fin)}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5 hidden min-[617px]:block">
                            Franja horaria
                          </p>
                        </div>

                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${tipoColor}`}
                            >
                              {tipoLabel}
                            </span>
                            {e.areas?.map((a) => (
                              <span
                                key={a.id}
                                className="text-[11px] font-medium px-2 py-0.5 rounded-full text-white"
                                style={{ backgroundColor: a.color || '#64748B' }}
                              >
                                {a.nombre}
                              </span>
                            ))}
                          </div>
                          <h3 className="text-base font-bold text-gray-900 leading-snug break-words">
                            {e.titulo}
                          </h3>
                          <div className="flex flex-col gap-1.5 text-sm text-gray-600">
                            {e.horario?.aula && (
                              <p className="break-words">
                                Aula {e.horario.aula.numero}, {e.horario.aula.edificio}
                              </p>
                            )}
                            {e.ponente && (
                              <p className="break-words">
                                {e.ponente.nombre_completo ||
                                  `${e.ponente.nombre} ${e.ponente.apellidos}`}
                              </p>
                            )}
                          </div>

                          {errorEnFila && (
                            <AlertMessage
                              type="error"
                              message={feedbackFila.message}
                              className="mb-0 mt-2 text-xs font-medium"
                            />
                          )}
                        </div>

                        <div className="shrink-0 min-[617px]:pt-0.5 max-[616px]:w-full">
                          <button
                            type="button"
                            onClick={() => handleCancelar(i)}
                            disabled={cancelando}
                            className="w-full min-[617px]:w-auto px-4 py-2 text-xs font-semibold rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-1.5"
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
  )
}
