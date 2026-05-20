import { useEffect, useMemo, useState } from 'react'
import EventoCard from '../components/EventoCard'
import { fetchEventos } from '../api/eventos'
import { fetchMisInscripciones, inscribirseEvento, cancelarInscripcion } from '../api/inscripciones'

const formatHora = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit', hour12: false })
}

const formatFecha = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-CR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function agruparConflictos(eventos) {
  const sorted = [...eventos].sort(
    (a, b) => new Date(a.horario?.hora_inicio) - new Date(b.horario?.hora_inicio),
  )
  const grupos = []
  for (const evento of sorted) {
    const eIni = new Date(evento.horario?.hora_inicio)
    const eFin = new Date(evento.horario?.hora_fin)
    let encontrado = false
    for (const grupo of grupos) {
      for (const e of grupo) {
        const gIni = new Date(e.horario?.hora_inicio)
        const gFin = new Date(e.horario?.hora_fin)
        if (eIni < gFin && gIni < eFin) {
          grupo.push(evento)
          encontrado = true
          break
        }
      }
      if (encontrado) break
    }
    if (!encontrado) grupos.push([evento])
  }
  return grupos
}

export default function Inscripciones() {
  const [eventos, setEventos] = useState([])
  const [inscripciones, setInscripciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [accion, setAccion] = useState({ eventoId: null, inscripcionId: null, tipo: null })
  const [diaActivo, setDiaActivo] = useState(null)

  useEffect(() => {
    Promise.all([fetchEventos(), fetchMisInscripciones()])
      .then(([eventosData, misInscripciones]) => {
        setEventos(eventosData)
        setInscripciones(misInscripciones)
        const dias = [...new Set(eventosData.map((e) => e.horario?.numero_dia).filter(Boolean))].sort(
          (a, b) => a - b,
        )
        if (dias.length > 0) setDiaActivo(dias[0])
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || 'No se pudieron cargar los eventos.')
      })
      .finally(() => setLoading(false))
  }, [])

  const inscripcionesPorEvento = useMemo(() => {
    const map = new Map()
    for (const i of inscripciones) {
      if (i.estado === 'confirmado') map.set(i.evento_id, i)
    }
    return map
  }, [inscripciones])

  const eventosPorDia = useMemo(() => {
    const map = new Map()
    for (const e of eventos) {
      const dia = e.horario?.numero_dia
      if (!dia) continue
      if (!map.has(dia)) map.set(dia, [])
      map.get(dia).push(e)
    }
    return map
  }, [eventos])

  const dias = useMemo(() => [...eventosPorDia.keys()].sort((a, b) => a - b), [eventosPorDia])

  const gruposDelDia = useMemo(() => {
    if (!diaActivo) return []
    return agruparConflictos(eventosPorDia.get(diaActivo) || [])
  }, [diaActivo, eventosPorDia])

  const totalInscrito = inscripcionesPorEvento.size

  const mostrarFeedback = (type, message) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback(null), 4000)
  }

  const extraerError = (err, fallback) => {
    const d = err.response?.data
    if (d?.errors?.evento_id?.[0]) return d.errors.evento_id[0]
    if (d?.message) return d.message
    return err.message || fallback
  }

  const handleInscribirse = async (evento) => {
    setAccion({ eventoId: evento.id, inscripcionId: null, tipo: 'inscribir' })
    // Actualización optimista: mostrar como inscrito inmediatamente con id temporal
    setInscripciones((prev) => [
      ...prev.filter((i) => i.evento_id !== evento.id),
      { id: -1, evento_id: evento.id, estado: 'confirmado' },
    ])
    setEventos((prev) =>
      prev.map((e) =>
        e.id === evento.id
          ? { ...e, numero_inscritos: e.numero_inscritos + 1, cupos_disponibles: Math.max(0, e.cupos_disponibles - 1), tiene_capacidad_disponible: e.cupos_disponibles - 1 > 0 }
          : e,
      ),
    )
    try {
      const insc = await inscribirseEvento(evento.id)
      // Reemplazar inscripción temporal con la real
      setInscripciones((prev) => [...prev.filter((i) => i.evento_id !== evento.id), insc])
      mostrarFeedback('success', `Te inscribiste a "${evento.titulo}".`)
    } catch (err) {
      // Revertir si falló
      setInscripciones((prev) => prev.filter((i) => i.evento_id !== evento.id))
      setEventos((prev) =>
        prev.map((e) =>
          e.id === evento.id
            ? { ...e, numero_inscritos: Math.max(0, e.numero_inscritos - 1), cupos_disponibles: e.cupos_disponibles + 1, tiene_capacidad_disponible: true }
            : e,
        ),
      )
      mostrarFeedback('error', extraerError(err, 'No se pudo inscribir.'))
    } finally {
      setAccion({ eventoId: null, inscripcionId: null, tipo: null })
    }
  }

  const handleCancelar = async (inscripcionId, evento) => {
    if (!inscripcionId || inscripcionId === -1) return
    setAccion({ eventoId: evento.id, inscripcionId, tipo: 'cancelar' })
    // Actualización optimista: ocultar inscripción inmediatamente
    setInscripciones((prev) => prev.map((i) => (i.id === inscripcionId ? { ...i, estado: 'cancelado' } : i)))
    setEventos((prev) =>
      prev.map((e) =>
        e.id === evento.id
          ? { ...e, numero_inscritos: Math.max(0, e.numero_inscritos - 1), cupos_disponibles: e.cupos_disponibles + 1, tiene_capacidad_disponible: true }
          : e,
      ),
    )
    try {
      await cancelarInscripcion(inscripcionId)
      mostrarFeedback('success', `Cancelaste tu inscripción a "${evento.titulo}".`)
    } catch (err) {
      // Revertir si falló
      setInscripciones((prev) => prev.map((i) => (i.id === inscripcionId ? { ...i, estado: 'confirmado' } : i)))
      setEventos((prev) =>
        prev.map((e) =>
          e.id === evento.id
            ? { ...e, numero_inscritos: e.numero_inscritos + 1, cupos_disponibles: Math.max(0, e.cupos_disponibles - 1), tiene_capacidad_disponible: e.cupos_disponibles - 1 > 0 }
            : e,
        ),
      )
      mostrarFeedback('error', extraerError(err, 'No se pudo cancelar.'))
    } finally {
      setAccion({ eventoId: null, inscripcionId: null, tipo: null })
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-ucr-blue rounded-full" />
            <h1 className="text-2xl font-bold text-ucr-blue-dark">Inscripciones</h1>
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-ucr-blue">{totalInscrito}</span>{' '}
            {totalInscrito === 1 ? 'evento inscrito' : 'eventos inscritos'}
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Explorá los eventos del simposio organizados por día y hora. Las actividades marcadas con{' '}
          <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            conflicto
          </span>{' '}
          ocurren al mismo tiempo — solo podés asistir a una.
        </p>
      </div>

      {/* Feedback flotante */}
      {feedback && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg border text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Errores de carga */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg border bg-rose-50 border-rose-200 text-rose-800 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <span className="w-10 h-10 border-4 border-ucr-blue border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm">Cargando eventos...</p>
        </div>
      ) : dias.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
          <svg className="w-14 h-14 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-base font-medium">No hay actividades disponibles.</p>
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {dias.map((dia) => {
              const primerEvento = eventosPorDia.get(dia)?.find((e) => e.horario?.hora_inicio)
              const fecha = primerEvento ? formatFecha(primerEvento.horario.hora_inicio) : ''
              const total = eventosPorDia.get(dia)?.length ?? 0
              return (
                <button
                  key={dia}
                  onClick={() => setDiaActivo(dia)}
                  className={`flex-shrink-0 px-5 py-3 rounded-xl text-sm font-semibold border transition-all text-left ${
                    diaActivo === dia
                      ? 'bg-ucr-blue text-white border-ucr-blue shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-ucr-blue hover:text-ucr-blue'
                  }`}
                >
                  <div className={`text-[11px] font-normal capitalize mb-0.5 ${diaActivo === dia ? 'text-blue-200' : 'text-gray-400'}`}>
                    {fecha}
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Día {dia}</span>
                    <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-normal ${diaActivo === dia ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {total}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="space-y-1">
            {gruposDelDia.map((grupo, idx) => {
              const tieneConflicto = grupo.length > 1
              const horaIni = formatHora(grupo[0].horario?.hora_inicio)

              return (
                <div key={idx} className="mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-gray-500 w-14 text-right flex-shrink-0 tabular-nums">
                      {horaIni}
                    </span>
                    <div className="flex-1 h-px bg-gray-200" />
                    {tieneConflicto && (
                      <span className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                        </svg>
                        {grupo.length} actividades simultáneas
                      </span>
                    )}
                  </div>

                  <div
                    className={`ml-[4.25rem] ${
                      tieneConflicto ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3' : ''
                    }`}
                  >
                    {grupo.map((evento) => {
                      const inscripcion = inscripcionesPorEvento.get(evento.id)
                      const inscrito = !!inscripcion
                      const inscribiendo = accion.eventoId === evento.id && accion.tipo === 'inscribir'
                      const cancelando = accion.eventoId === evento.id && accion.tipo === 'cancelar'

                      return (
                        <div
                          key={evento.id}
                          className="h-full"
                        >
                          <EventoCard
                            evento={evento}
                            inscripcionId={inscripcion?.id ?? null}
                            inscribiendo={inscribiendo}
                            cancelando={cancelando}
                            onInscribirse={handleInscribirse}
                            onCancelar={handleCancelar}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
