import { useEffect, useRef } from 'react'
import { TIPO_LABELS, TIPO_COLORS, TIPO_COLOR_DEFAULT } from '../constants/eventos'
import { formatFecha, formatHora } from '../utils/date'
import Spinner from './ui/Spinner'

export default function EventoCard({
  evento,
  onInscribirse,
  onCancelar,
  inscribiendo = false,
  cancelando = false,
  inscripcionId = null,
  /** Mensaje de éxito o error de inscribir/cancelar, mostrado en esta tarjeta */
  mensajeAccion = null,
}) {
  const rootRef = useRef(null)

  useEffect(() => {
    if (mensajeAccion?.type === 'error' && rootRef.current) {
      rootRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
    }
  }, [mensajeAccion])

  const inscrito = !!inscripcionId || !!evento.usuario_inscrito
  const sinCupos = !evento.tiene_capacidad_disponible
  const tipo = evento.tipo
  const tipoLabel = TIPO_LABELS[tipo] ?? tipo
  const tipoColor = TIPO_COLORS[tipo] ?? TIPO_COLOR_DEFAULT

  return (
    <div
      ref={rootRef}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-hidden overflow-y-visible flex flex-col min-w-0 min-h-0 hover:shadow-md transition-shadow"
    >
      {/* Header con tipo + día */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between gap-2">
        <span className={`text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full border ${tipoColor}`}>
          {tipoLabel}
        </span>
        {evento.horario?.numero_dia && (
          <span className="text-[11px] text-gray-500 font-medium">
            Día {evento.horario.numero_dia}
          </span>
        )}
      </div>

      {/* Título y descripción */}
      <div className="px-5 pb-3 min-w-0">
        <h3 className="text-base font-bold text-ucr-blue-dark leading-snug break-words max-[616px]:text-[15px]">
          {evento.titulo}
        </h3>
        {evento.descripcion && (
          <p className="text-sm text-gray-600 mt-1.5 line-clamp-3">{evento.descripcion}</p>
        )}
      </div>

      {/* Áreas */}
      {evento.areas?.length > 0 && (
        <div className="px-5 pb-3 flex items-center gap-1.5 overflow-hidden">
          {evento.areas.map((a) => (
            <span
              key={a.id}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full text-white flex-shrink-0"
              style={{ backgroundColor: a.color || '#64748B' }}
            >
              {a.nombre}
            </span>
          ))}
        </div>
      )}

      {/* Datos del horario, aula y ponente */}
      <div className="px-5 py-3 mt-auto bg-gray-50 border-t border-gray-100 space-y-1.5 text-sm min-w-0">
        {evento.horario && (
          <div className="flex items-start gap-2 text-gray-700 min-w-0">
            <svg className="w-4 h-4 text-ucr-blue flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="capitalize break-words min-w-0">
              {formatFecha(evento.horario.hora_inicio)} · {formatHora(evento.horario.hora_inicio)}-{formatHora(evento.horario.hora_fin)}
            </span>
          </div>
        )}
        {evento.horario?.aula && (
          <div className="flex items-start gap-2 text-gray-700 min-w-0">
            <svg className="w-4 h-4 text-ucr-blue flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="break-words min-w-0">
              Aula {evento.horario.aula.numero} · {evento.horario.aula.edificio}
            </span>
          </div>
        )}
        {evento.ponente && (
          <div className="flex items-start gap-2 text-gray-700 min-w-0">
            <svg className="w-4 h-4 text-ucr-blue flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="break-words min-w-0">
              {evento.ponente.nombre_completo || `${evento.ponente.nombre} ${evento.ponente.apellidos}`}
            </span>
          </div>
        )}
      </div>

      {mensajeAccion && (
        <div
          role="alert"
          className={`mx-4 sm:mx-5 mb-1 px-4 py-3 rounded-lg border text-sm font-medium leading-snug break-words ${
            mensajeAccion.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900 shadow-sm ring-1 ring-rose-200'
          }`}
        >
          {mensajeAccion.message}
        </div>
      )}

      {/* Footer con cupos y CTA */}
      <div className="px-5 py-3 border-t border-gray-100 flex flex-col gap-2 max-[616px]:items-stretch min-[617px]:flex-row min-[617px]:items-center min-[617px]:justify-between min-[617px]:gap-3 min-w-0">
        <div className="text-xs shrink-0 max-[616px]:text-center min-[617px]:text-left">
          <span className={`font-bold ${sinCupos ? 'text-rose-600' : 'text-emerald-600'}`}>
            {evento.cupos_disponibles}
          </span>
        </div>

        {inscrito ? (
          <button
            onClick={() => onCancelar?.(inscripcionId, evento)}
            disabled={cancelando}
            className="px-3 py-2 text-xs font-semibold rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5 max-[616px]:w-full min-[617px]:py-1.5 min-[617px]:w-auto"
          >
            {cancelando ? (
              <>
                <Spinner size="sm" className="border-rose-400" />
                Cancelando...
              </>
            ) : (
              'Cancelar inscripción'
            )}
          </button>
        ) : (
          <button
            onClick={() => onInscribirse?.(evento)}
            disabled={inscribiendo || sinCupos}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-ucr-blue text-white hover:bg-ucr-blue-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5 max-[616px]:w-full min-[617px]:py-1.5 min-[617px]:w-auto"
          >
            {inscribiendo ? (
              <>
                <Spinner size="sm" />
                Inscribiendo...
              </>
            ) : sinCupos ? (
              'Sin cupos'
            ) : (
              'Inscribirse'
            )}
          </button>
        )}
      </div>
    </div>
  )
}
