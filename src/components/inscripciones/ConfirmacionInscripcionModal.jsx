import { useEffect } from 'react'
import { TIPO_LABELS, TIPO_COLORS, TIPO_COLOR_DEFAULT } from '../../constants/eventos'
import { formatFecha, formatHora } from '../../utils/date'
import { nombresPonentesEvento } from '../../utils/ponentes'
import Spinner from '../ui/Spinner'

const TIPO_ACCENT = {
  apertura: '#10B981',
  clausura: '#EF4444',
  taller: '#F59E0B',
  charla: '#3B82F6',
}

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
  const tipoAccent = TIPO_ACCENT[tipo] ?? '#64748B'
  const ponentesTexto = nombresPonentesEvento(evento).join(', ')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onCancelar()}
      style={{ background: 'rgba(0,15,35,0.55)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="bg-white w-full max-w-md animate-scale-in overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        style={{
          borderRadius: 20,
          boxShadow: '0 24px 64px -12px rgba(0,0,0,0.35), 0 8px 24px -4px rgba(0,0,0,0.15)',
        }}
      >
        {/* Top accent stripe */}
        <div className="h-[3px] w-full" style={{ background: `linear-gradient(90deg, ${tipoAccent} 0%, rgba(0,93,164,0.5) 100%)` }} />

        {/* Header */}
        <div className="px-6 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <span className={`inline-block text-sm font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full border mb-2.5 ${tipoColor}`}>
                {tipoLabel}
              </span>
              <h2 id="confirm-title" className="text-[15px] font-bold text-ucr-blue-dark leading-snug font-display" style={{ letterSpacing: '-0.01em' }}>
                {evento.titulo}
              </h2>
            </div>
            <button
              type="button"
              onClick={onCancelar}
              className="text-gray-400 hover:text-gray-700 transition-colors p-1.5 rounded-xl hover:bg-gray-100 flex-shrink-0 mt-0.5"
              aria-label="Cerrar"
            >
              <svg className="w-4.5 h-4.5 w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Event details */}
        <div className="px-6 py-4 space-y-2.5 text-[13.5px] text-gray-600">
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
          {ponentesTexto && (
            <div className="flex items-start gap-2.5">
              <svg className="w-4 h-4 text-ucr-blue flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{ponentesTexto}</span>
            </div>
          )}

          {/* Cupos badge */}
          <div
            className="inline-flex items-center gap-2 mt-1 px-3 py-1.5 rounded-xl text-sm font-semibold font-mono-accent"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', color: '#065f46' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-none" />
            {evento.cupos_disponibles} cupos disponibles
          </div>
        </div>

        {/* Confirmation question */}
        <div className="px-6 pb-2">
          <p className="text-base font-semibold text-ucr-blue-dark font-display">
            ¿Confirmar tu inscripción a este evento?
          </p>
        </div>

        {/* Actions */}
        <div
          className="px-6 py-4 flex flex-col-reverse sm:flex-row gap-2.5 sm:justify-end mt-2"
          style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
        >
          <button
            type="button"
            onClick={onCancelar}
            disabled={inscribiendo}
            className="px-5 py-2.5 text-sm font-semibold rounded-xl border transition-all duration-200 hover:bg-gray-50 active:scale-[0.97] disabled:opacity-50"
            style={{ borderColor: 'rgba(0,0,0,0.12)', color: '#374151' }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={inscribiendo}
            className="px-5 py-2.5 text-sm font-semibold rounded-xl text-white transition-all duration-200 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #005DA4, #003A6E)', boxShadow: '0 4px 12px 0 rgba(0,93,164,0.25)' }}
          >
            {inscribiendo ? (
              <><Spinner size="sm" />Inscribiendo...</>
            ) : (
              'Confirmar inscripción'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
