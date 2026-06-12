import { useEffect, useRef } from 'react'
import { TIPO_LABELS, TIPO_COLORS, TIPO_COLOR_DEFAULT } from '../constants/eventos'
import { formatFecha, formatHora } from '../utils/date'
import Spinner from './ui/Spinner'

const TIPO_ACCENT = {
  apertura: '#10B981',
  clausura: '#EF4444',
  taller: '#F59E0B',
  charla: '#3B82F6',
}

export default function EventoCard({
  evento,
  onInscribirse,
  onCancelar,
  inscribiendo = false,
  cancelando = false,
  inscripcionId = null,
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
  const tipoAccent = TIPO_ACCENT[tipo] ?? '#64748B'

  return (
    <div
      ref={rootRef}
      className="bg-white flex flex-col min-w-0 min-h-0 transition-all duration-200 hover:-translate-y-0.5"
      style={{
        borderRadius: 16,
        border: '1px solid rgba(0,0,0,0.07)',
        boxShadow: '0 1px 4px 0 rgba(0,0,0,0.06)',
        overflow: 'hidden',
      }}
    >
      {/* Top accent stripe */}
      <div className="h-[3px] w-full flex-none" style={{ background: `linear-gradient(90deg, ${tipoAccent}, transparent)` }} />

      {/* Header: tipo + día */}
      <div className="px-4 pt-3.5 pb-2.5 flex items-center justify-between gap-2">
        <span className={`text-sm font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full border ${tipoColor}`}>
          {tipoLabel}
        </span>
        {evento.horario?.numero_dia && (
          <span
            className="text-sm font-bold uppercase tracking-wide px-2 py-0.5 rounded-full font-mono-accent"
            style={{ background: 'rgba(0,93,164,0.07)', color: '#004A87' }}
          >
            Día {evento.horario.numero_dia}
          </span>
        )}
      </div>

      {/* Título y descripción */}
      <div className="px-4 pb-2.5 min-w-0">
        <h3 className="text-[15px] font-bold text-ucr-blue-dark leading-snug break-words font-display" style={{ letterSpacing: '-0.01em' }}>
          {evento.titulo}
        </h3>
        {evento.descripcion && (
          <p className="text-[15px] text-gray-500 mt-1.5 line-clamp-3 leading-relaxed">{evento.descripcion}</p>
        )}
      </div>

      {/* Áreas */}
      {evento.areas?.length > 0 && (
        <div className="px-4 pb-2.5 flex items-center gap-1.5 flex-wrap">
          {evento.areas.map((a) => (
            <span
              key={a.id}
              className="text-sm font-semibold px-2.5 py-0.5 rounded-full text-white flex-shrink-0"
              style={{ backgroundColor: a.color || '#64748B' }}
            >
              {a.nombre}
            </span>
          ))}
        </div>
      )}

      {/* Metadata */}
      <div
        className="px-4 py-3 mt-auto space-y-1.5 text-[15px]"
        style={{ background: 'rgba(0,93,164,0.03)', borderTop: '1px solid rgba(0,0,0,0.06)' }}
      >
        {evento.horario && (
          <div className="flex items-start gap-2 text-gray-600 min-w-0">
            <svg className="w-3.5 h-3.5 text-ucr-blue flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="capitalize break-words min-w-0">
              {formatFecha(evento.horario.hora_inicio)} · {formatHora(evento.horario.hora_inicio)}–{formatHora(evento.horario.hora_fin)}
            </span>
          </div>
        )}
        {evento.horario?.aula && (
          <div className="flex items-start gap-2 text-gray-600 min-w-0">
            <svg className="w-3.5 h-3.5 text-ucr-blue flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="break-words min-w-0">
              Aula {evento.horario.aula.numero} · {evento.horario.aula.edificio}
            </span>
          </div>
        )}
        {evento.ponente && (
          <div className="flex items-start gap-2 text-gray-600 min-w-0">
            <svg className="w-3.5 h-3.5 text-ucr-blue flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="break-words min-w-0">
              {evento.ponente.nombre_completo || `${evento.ponente.nombre} ${evento.ponente.apellidos}`}
            </span>
          </div>
        )}
      </div>

      {/* Feedback message */}
      {mensajeAccion && (
        <div
          role="alert"
          className={`mx-4 mb-0 mt-0 px-4 py-2.5 text-[15px] font-medium leading-snug break-words ${
            mensajeAccion.type === 'success'
              ? 'bg-emerald-50 border-y border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-y border-rose-200 text-rose-900'
          }`}
        >
          {mensajeAccion.message}
        </div>
      )}

      {/* Footer: cupos + CTA */}
      <div
        className="px-4 py-3 flex flex-col gap-2 max-[616px]:items-stretch min-[617px]:flex-row min-[617px]:items-center min-[617px]:justify-between min-[617px]:gap-3 min-w-0"
        style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
      >
        <div className="text-sm font-semibold shrink-0 max-[616px]:text-center">
          <span className={sinCupos ? 'text-rose-600' : 'text-emerald-600'}>
            {evento.cupos_disponibles} cupos
          </span>
        </div>

        {inscrito ? (
          <button
            onClick={() => onCancelar?.(inscripcionId, evento)}
            disabled={cancelando}
            className="px-3.5 py-2 text-sm font-semibold rounded-xl border transition-all duration-200 flex items-center justify-center gap-1.5 max-[616px]:w-full min-[617px]:py-1.5 min-[617px]:w-auto hover:bg-rose-50 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ borderColor: 'rgba(239,68,68,0.4)', color: '#dc2626' }}
          >
            {cancelando ? (
              <><Spinner size="sm" className="border-rose-400" />Cancelando...</>
            ) : (
              'Cancelar inscripción'
            )}
          </button>
        ) : (
          <button
            onClick={() => onInscribirse?.(evento)}
            disabled={inscribiendo || sinCupos}
            className="px-3.5 py-2 text-sm font-semibold rounded-xl text-white transition-all duration-200 flex items-center justify-center gap-1.5 max-[616px]:w-full min-[617px]:py-1.5 min-[617px]:w-auto active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: sinCupos ? '#94a3b8' : 'linear-gradient(135deg, #005DA4, #004A87)',
              boxShadow: sinCupos ? 'none' : '0 2px 8px 0 rgba(0,93,164,0.25)',
            }}
          >
            {inscribiendo ? (
              <><Spinner size="sm" />Inscribiendo...</>
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
