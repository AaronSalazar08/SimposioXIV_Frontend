import { useEffect, useMemo, useState } from 'react'
import EventoCard from '../components/EventoCard'
import { fetchEventos } from '../api/eventos'
import {
  fetchMisInscripciones,
  inscribirseEvento,
  cancelarInscripcion,
} from '../api/inscripciones'

const TIPOS = [
  { value: '', label: 'Todos los tipos' },
  { value: 'apertura', label: 'Apertura' },
  { value: 'clausura', label: 'Clausura' },
  { value: 'taller', label: 'Talleres' },
  { value: 'charla', label: 'Charlas' },
]

const DIAS = [
  { value: '', label: 'Todos los días' },
  { value: '1', label: 'Día 1' },
  { value: '2', label: 'Día 2' },
  { value: '3', label: 'Día 3' },
]

export default function Inscripciones() {
  const [eventos, setEventos] = useState([])
  const [inscripciones, setInscripciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState(null) // { type: 'success'|'error', message }
  const [accion, setAccion] = useState({ eventoId: null, inscripcionId: null, tipo: null })

  // Filtros
  const [filtroDia, setFiltroDia] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [soloDisponibles, setSoloDisponibles] = useState(false)

  // Mapa rápido evento_id => inscripcion (sólo confirmadas)
  const inscripcionesPorEvento = useMemo(() => {
    const map = new Map()
    for (const i of inscripciones) {
      if (i.estado === 'confirmado') {
        map.set(i.evento_id, i)
      }
    }
    return map
  }, [inscripciones])

  const cargarDatos = (filtros = {}) => {
    setLoading(true)
    setError('')
    return Promise.all([fetchEventos(filtros), fetchMisInscripciones()])
      .then(([eventosData, misInscripciones]) => {
        setEventos(eventosData)
        setInscripciones(misInscripciones)
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || 'No se pudieron cargar los eventos.')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    Promise.all([fetchEventos(), fetchMisInscripciones()])
      .then(([eventosData, misInscripciones]) => {
        setEventos(eventosData)
        setInscripciones(misInscripciones)
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || 'No se pudieron cargar los eventos.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const aplicarFiltros = () => {
    cargarDatos({
      dia: filtroDia || undefined,
      tipo: filtroTipo || undefined,
      solo_disponibles: soloDisponibles || undefined,
    })
  }

  const limpiarFiltros = () => {
    setFiltroDia('')
    setFiltroTipo('')
    setSoloDisponibles(false)
    cargarDatos()
  }

  const mostrarFeedback = (type, message) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback(null), 4000)
  }

  const extraerMensajeError = (err, fallback) => {
    const data = err.response?.data
    if (data?.errors?.evento_id?.[0]) return data.errors.evento_id[0]
    if (data?.message) return data.message
    return err.message || fallback
  }

  const handleInscribirse = async (evento) => {
    setAccion({ eventoId: evento.id, inscripcionId: null, tipo: 'inscribir' })
    try {
      const inscripcion = await inscribirseEvento(evento.id)
      // Actualizar lista localmente
      setInscripciones((prev) => {
        const sin = prev.filter((i) => i.evento_id !== evento.id)
        return [...sin, inscripcion]
      })
      setEventos((prev) =>
        prev.map((e) =>
          e.id === evento.id
            ? {
                ...e,
                numero_inscritos: e.numero_inscritos + 1,
                cupos_disponibles: Math.max(0, e.cupos_disponibles - 1),
                tiene_capacidad_disponible: e.cupos_disponibles - 1 > 0,
                usuario_inscrito: true,
              }
            : e,
        ),
      )
      mostrarFeedback('success', `Te inscribiste a "${evento.titulo}".`)
    } catch (err) {
      mostrarFeedback('error', extraerMensajeError(err, 'No se pudo inscribir.'))
    } finally {
      setAccion({ eventoId: null, inscripcionId: null, tipo: null })
    }
  }

  const handleCancelar = async (inscripcionId, evento) => {
    if (!inscripcionId) return
    setAccion({ eventoId: evento.id, inscripcionId, tipo: 'cancelar' })
    try {
      await cancelarInscripcion(inscripcionId)
      setInscripciones((prev) =>
        prev.map((i) => (i.id === inscripcionId ? { ...i, estado: 'cancelado' } : i)),
      )
      setEventos((prev) =>
        prev.map((e) =>
          e.id === evento.id
            ? {
                ...e,
                numero_inscritos: Math.max(0, e.numero_inscritos - 1),
                cupos_disponibles: e.cupos_disponibles + 1,
                tiene_capacidad_disponible: true,
                usuario_inscrito: false,
              }
            : e,
        ),
      )
      mostrarFeedback('success', `Cancelaste tu inscripción a "${evento.titulo}".`)
    } catch (err) {
      mostrarFeedback('error', extraerMensajeError(err, 'No se pudo cancelar la inscripción.'))
    } finally {
      setAccion({ eventoId: null, inscripcionId: null, tipo: null })
    }
  }

  const totalInscrito = inscripcionesPorEvento.size

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-ucr-blue rounded-full" />
            <h1 className="text-2xl font-bold text-ucr-blue-dark">Inscripciones</h1>
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-ucr-blue">{totalInscrito}</span>{' '}
            {totalInscrito === 1 ? 'evento' : 'eventos'} inscritos
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Explora los eventos del Simposio XIV y reserva tu cupo. Los cupos se asignan por orden de inscripción.
        </p>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:flex-wrap">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-gray-700 mb-1">Día</label>
            <select
              value={filtroDia}
              onChange={(e) => setFiltroDia(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ucr-blue focus:border-transparent"
            >
              {DIAS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ucr-blue focus:border-transparent"
            >
              {TIPOS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
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
              onClick={aplicarFiltros}
              className="px-4 py-2 bg-ucr-blue hover:bg-ucr-blue-dark text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Aplicar
            </button>
            <button
              onClick={limpiarFiltros}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>
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

      {/* Listado */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <span className="w-10 h-10 border-4 border-ucr-blue border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm">Cargando eventos...</p>
        </div>
      ) : eventos.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
          <svg className="w-14 h-14 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-base font-medium">No se encontraron eventos.</p>
          <p className="text-sm mt-1">Prueba ajustando los filtros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {eventos.map((evento) => {
            const inscripcion = inscripcionesPorEvento.get(evento.id)
            const inscribiendo =
              accion.eventoId === evento.id && accion.tipo === 'inscribir'
            const cancelando =
              accion.eventoId === evento.id && accion.tipo === 'cancelar'
            return (
              <EventoCard
                key={evento.id}
                evento={evento}
                inscripcionId={inscripcion?.id ?? null}
                inscribiendo={inscribiendo}
                cancelando={cancelando}
                onInscribirse={handleInscribirse}
                onCancelar={handleCancelar}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
