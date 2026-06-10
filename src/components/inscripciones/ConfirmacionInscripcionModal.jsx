import { useEffect } from 'react'
import { TIPO_LABELS, TIPO_COLORS, TIPO_COLOR_DEFAULT } from '../../constants/eventos'
import { formatFecha, formatHora } from '../../utils/date'
import Spinner from '../ui/Spinner'

export default function ConfirmacionInscripcionModal({ evento, inscribiendo, onConfirmar, onCancelar }) {
  const open = !!evento

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onCancelar()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onCancelar])

  if (!open) return null

  const tipo = evento.tipo
  const tipoLabel = TIPO_LABELS[tipo] ?? tipo
  const tipoColor = TIPO_COLORS[tipo] ?? TIPO_COLOR_DEFAULT

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onCancelar()}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <span className={`inline-block text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full border mb-2 ${tipoColor}`}>
                {tipoLabel}
              </span>
              <h2 id="confirm-title" className="text-base font-bold text-ucr-blue-dark leading-snug">
                {evento.titulo}
              </h2>
            </div>
            <button
              type="button"
              onClick={onCancelar}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100 flex-shrink-0 mt-0.5"
              aria-label="Cerrar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Detalles del evento */}
        <div className="px-6 py-4 space-y-2.5 text-sm text-gray-700">
          {evento.horario && (
            <div className="flex items-start gap-2.5">
              <svg className="w-4 h-4 text-ucr-blue flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="capitalize">
                {formatFecha(evento.horario.hora_inicio)} · {formatHora(evento.horario.hora_inicio)}–{formatHora(evento.horario.hora_fin)}
              </span>
            </div>
          )}
          {evento.horario?.aula && (
            <div className="flex items-start gap-2.5">
              <svg className="w-4 h-4 text-ucr-blue flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Aula {evento.horario.aula.numero} · {evento.horario.aula.edificio}</span>
            </div>
          )}
          {evento.ponente && (
            <div className="flex items-start gap-2.5">
              <svg className="w-4 h-4 text-ucr-blue flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{evento.ponente.nombre_completo || `${evento.ponente.nombre} ${evento.ponente.apellidos}`}</span>
            </div>
          )}

          <p className="text-xs text-gray-500 pt-1">
            Cupos disponibles:{' '}
            <span className="font-semibold text-emerald-600">{evento.cupos_disponibles}</span>
          </p>
        </div>

        {/* Pregunta de confirmación */}
        <div className="px-6 pb-2">
          <p className="text-sm font-semibold text-ucr-blue-dark">
            ¿Confirmar tu inscripción a este evento?
          </p>
        </div>

        {/* Botones */}
        <div className="px-6 py-4 flex flex-col-reverse sm:flex-row gap-2.5 sm:justify-end border-t border-gray-100 mt-2">
          <button
            type="button"
            onClick={onCancelar}
            disabled={inscribiendo}
            className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={inscribiendo}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-ucr-blue text-white hover:bg-ucr-blue-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {inscribiendo ? (
              <>
                <Spinner size="sm" />
                Inscribiendo...
              </>
            ) : (
              'Confirmar inscripción'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
