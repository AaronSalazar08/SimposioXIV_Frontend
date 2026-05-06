import { useEffect, useMemo, useState } from 'react'
import { fetchMisInscripciones, cancelarInscripcion } from '../api/inscripciones'

const TIPO_COLORS = {
  apertura: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  clausura: 'bg-rose-100 text-rose-700 border-rose-200',
  taller: 'bg-amber-100 text-amber-800 border-amber-200',
  charla: 'bg-sky-100 text-sky-800 border-sky-200',
}

const TIPO_LABELS = {
  apertura: 'Apertura',
  clausura: 'Clausura',
  taller: 'Taller',
  charla: 'Charla',
}

const formatHora = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit', hour12: false })
}

const formatFecha = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-CR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default function Cronograma() {
  const [inscripciones, setInscripciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelandoId, setCancelandoId] = useState(null)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    fetchMisInscripciones()
      .then((data) => {
        setInscripciones(data)
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || 'No se pudo cargar el cronograma.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  // Sólo confirmadas y agrupadas por día/fecha
  const grupos = useMemo(() => {
    const confirmadas = inscripciones.filter((i) => i.estado === 'confirmado' && i.evento)
    const map = new Map()
    for (const i of confirmadas) {
      const dia = i.evento.horario?.numero_dia ?? 0
      const fecha = i.evento.horario?.hora_inicio
      if (!map.has(dia)) map.set(dia, { dia, fecha, items: [] })
      map.get(dia).items.push(i)
    }
    // Ordenar items por hora_inicio dentro del día
    for (const g of map.values()) {
      g.items.sort((a, b) => {
        const ai = a.evento.horario?.hora_inicio ?? ''
        const bi = b.evento.horario?.hora_inicio ?? ''
        return ai.localeCompare(bi)
      })
    }
    return [...map.values()].sort((a, b) => a.dia - b.dia)
  }, [inscripciones])

  const total = useMemo(
    () => inscripciones.filter((i) => i.estado === 'confirmado').length,
    [inscripciones],
  )

  const mostrarFeedback = (type, message) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback(null), 4000)
  }

  const handleCancelar = async (inscripcion) => {
    setCancelandoId(inscripcion.id)
    try {
      await cancelarInscripcion(inscripcion.id)
      setInscripciones((prev) =>
        prev.map((i) => (i.id === inscripcion.id ? { ...i, estado: 'cancelado' } : i)),
      )
      mostrarFeedback('success', `Cancelaste tu inscripción a "${inscripcion.evento.titulo}".`)
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'No se pudo cancelar la inscripción.'
      mostrarFeedback('error', msg)
    } finally {
      setCancelandoId(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-ucr-blue rounded-full" />
            <h1 className="text-2xl font-bold text-ucr-blue-dark">Mi cronograma</h1>
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-ucr-blue">{total}</span>{' '}
            {total === 1 ? 'evento confirmado' : 'eventos confirmados'}
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Aquí ves tus inscripciones confirmadas, agrupadas por día. Podés cancelar cualquiera para liberar el cupo.
        </p>
      </div>

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

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg border bg-rose-50 border-rose-200 text-rose-800 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <span className="w-10 h-10 border-4 border-ucr-blue border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm">Cargando tu cronograma...</p>
        </div>
      ) : grupos.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
          <svg className="w-14 h-14 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-base font-medium">Aún no tenés inscripciones confirmadas.</p>
          <p className="text-sm mt-1">Andá a la sección Inscripciones para reservar tu cupo.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grupos.map(({ dia, fecha, items }) => (
            <section key={dia} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <header className="bg-ucr-blue text-white px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-blue-200">Día {dia}</p>
                  <h2 className="text-lg font-bold capitalize">{formatFecha(fecha)}</h2>
                </div>
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
                  {items.length} {items.length === 1 ? 'evento' : 'eventos'}
                </span>
              </header>

              <ul className="divide-y divide-gray-100">
                {items.map((i) => {
                  const e = i.evento
                  const tipoColor = TIPO_COLORS[e.tipo] ?? 'bg-gray-100 text-gray-700 border-gray-200'
                  const tipoLabel = TIPO_LABELS[e.tipo] ?? e.tipo
                  const cancelando = cancelandoId === i.id
                  return (
                    <li key={i.id} className="px-6 py-4 flex flex-col md:flex-row md:items-center gap-3 hover:bg-gray-50 transition-colors">
                      <div className="md:w-32 flex-shrink-0 text-ucr-blue-dark font-bold">
                        {formatHora(e.horario?.hora_inicio)}
                        <span className="text-gray-400 font-normal"> – </span>
                        {formatHora(e.horario?.hora_fin)}
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${tipoColor}`}>
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
                        <h3 className="text-sm font-bold text-gray-900 leading-snug">{e.titulo}</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-600 mt-1">
                          {e.horario?.aula && (
                            <span>
                              📍 Aula {e.horario.aula.numero}, {e.horario.aula.edificio}
                            </span>
                          )}
                          {e.ponente && (
                            <span>
                              🎤 {e.ponente.nombre_completo || `${e.ponente.nombre} ${e.ponente.apellidos}`}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleCancelar(i)}
                        disabled={cancelando}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 self-start md:self-auto"
                      >
                        {cancelando ? (
                          <>
                            <span className="w-3 h-3 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                            Cancelando...
                          </>
                        ) : (
                          'Cancelar'
                        )}
                      </button>
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
