import { useEffect, useRef } from 'react'
import { TIPO_LABELS } from '../constants/eventos'
import { nombresPonentesEvento } from '../utils/ponentes'
import Spinner from './ui/Spinner'

const TIPO_ACCENT = { apertura: '#10B981', clausura: '#EF4444', taller: '#F59E0B', charla: '#21BBEF' }
const TIPO_BG     = { apertura: '#ECFDF5', clausura: '#FEF2F2', taller: '#FFFBEB', charla: '#EFF8FF' }
const TIPO_FG     = { apertura: '#065F46', clausura: '#991B1B', taller: '#92400E', charla: '#0C4A6E' }

export default function EventoCard({
  evento, onInscribirse, onCancelar,
  inscribiendo = false, cancelando = false,
  inscripcionId = null, mensajeAccion = null,
}) {
  const rootRef = useRef(null)
  useEffect(() => {
    if (mensajeAccion?.type === 'error' && rootRef.current)
      rootRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
  }, [mensajeAccion])

  const inscrito  = !!inscripcionId || !!evento.usuario_inscrito
  const sinCupos  = !evento.tiene_capacidad_disponible
  const tipo      = evento.tipo
  const tipoLabel = TIPO_LABELS[tipo] ?? tipo
  const accent    = TIPO_ACCENT[tipo] ?? '#64748B'
  const tipoBg    = TIPO_BG[tipo]    ?? 'rgba(100,116,139,0.1)'
  const tipoFg    = TIPO_FG[tipo]    ?? '#334155'

  const ponentesTexto = nombresPonentesEvento(evento).join(', ')

  return (
    <div
      ref={rootRef}
      style={{
        background: inscrito ? '#F0F9FF' : '#fff',
        border: `1px solid ${inscrito ? 'rgba(33,187,239,0.3)' : 'rgba(0,0,0,0.08)'}`,
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: inscrito ? '0 1px 6px rgba(33,187,239,0.12)' : '0 1px 3px rgba(0,0,0,0.05)',
        transition: 'all 200ms',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 22px' }}>
        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Meta row: tipo + areas + aula */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 10 }}>
            <span style={{
              fontFamily: "var(--font-pixel)",
              fontSize: 13, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.07em',
              padding: '4px 10px', borderRadius: 9999,
              background: tipoBg, color: tipoFg,
              border: `1px solid ${accent}33`,
            }}>
              {tipoLabel}
            </span>
            {evento.areas?.map(a => (
              <span key={a.id} style={{
                fontSize: 13, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.06em',
                padding: '4px 10px', borderRadius: 9999,
                background: a.color || '#64748B', color: '#fff',
              }}>
                {a.nombre}
              </span>
            ))}
            {evento.horario?.aula && (
              <span style={{ fontFamily: "var(--font-pixel)", fontSize: 19, color: '#6B7280' }}>
                {evento.horario.aula.edificio} · {evento.horario.aula.numero}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 style={{
            margin: 0,
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 'clamp(1.15rem,1.8vw,1.35rem)',
            lineHeight: 1.25, letterSpacing: '-0.01em', color: '#111827',
          }}>
            {evento.titulo}
          </h3>

          {/* Ponentes */}
          {ponentesTexto && (
            <p style={{ margin: '7px 0 0', fontSize: 16, color: '#6B7280', fontFamily: "'Space Grotesk', sans-serif" }}>
              {ponentesTexto}
            </p>
          )}

          {/* Description */}
          {evento.descripcion && (
            <p style={{
              margin: '6px 0 0', fontSize: 15, color: '#9CA3AF', lineHeight: 1.55,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {evento.descripcion}
            </p>
          )}

          {/* Cupos + día */}
          <div style={{ marginTop: 11, display: 'flex', alignItems: 'center', gap: 9 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: sinCupos ? '#DC2626' : '#059669' }}>
              {evento.cupos_disponibles} cupos
            </span>
            {evento.horario?.numero_dia && (
              <span style={{
                fontFamily: "var(--font-pixel)", fontSize: 18,
                color: '#005DA4', background: 'rgba(0,93,164,0.07)',
                padding: '3px 9px', borderRadius: 9999,
              }}>
                Día {evento.horario.numero_dia}
              </span>
            )}
          </div>
        </div>

        {/* Action button */}
        {inscrito ? (
          <button
            type="button"
            onClick={() => onCancelar?.(inscripcionId, evento)}
            disabled={cancelando}
            title="Cancelar inscripción"
            style={{
              width: 50, height: 50, borderRadius: '50%', flexShrink: 0,
              background: '#21BBEF', border: 'none',
              color: '#fff', fontSize: 22,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: cancelando ? 'not-allowed' : 'pointer',
              opacity: cancelando ? 0.6 : 1,
              boxShadow: '0 2px 8px rgba(33,187,239,0.35)',
              transition: 'background 150ms',
            }}
            onMouseEnter={ev => { if (!cancelando) ev.currentTarget.style.background = '#DC2626' }}
            onMouseLeave={ev => { if (!cancelando) ev.currentTarget.style.background = '#21BBEF' }}
          >
            {cancelando ? <Spinner size="sm" /> : '✓'}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => { if (!sinCupos && !inscribiendo) onInscribirse?.(evento) }}
            disabled={inscribiendo || sinCupos}
            title={sinCupos ? 'Sin cupos disponibles' : 'Inscribirse'}
            style={{
              width: 50, height: 50, borderRadius: '50%', flexShrink: 0,
              background: 'transparent',
              border: `1.5px solid ${sinCupos ? '#E5E7EB' : 'rgba(0,0,0,0.2)'}`,
              color: sinCupos ? '#D1D5DB' : '#374151',
              fontSize: 28, fontWeight: 300,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: (inscribiendo || sinCupos) ? 'not-allowed' : 'pointer',
              opacity: inscribiendo ? 0.6 : 1,
              transition: 'all 150ms',
            }}
            onMouseEnter={ev => {
              if (!sinCupos && !inscribiendo) {
                ev.currentTarget.style.borderColor = '#21BBEF'
                ev.currentTarget.style.color = '#21BBEF'
              }
            }}
            onMouseLeave={ev => {
              ev.currentTarget.style.borderColor = sinCupos ? '#E5E7EB' : 'rgba(0,0,0,0.2)'
              ev.currentTarget.style.color = sinCupos ? '#D1D5DB' : '#374151'
            }}
          >
            {inscribiendo ? <Spinner size="sm" /> : '+'}
          </button>
        )}
      </div>

      {/* Feedback */}
      {mensajeAccion && (
        <div role="alert" style={{
          padding: '12px 22px', fontSize: 16, fontWeight: 500, lineHeight: 1.4,
          borderTop: `1px solid ${mensajeAccion.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
          background: mensajeAccion.type === 'success' ? '#ECFDF5' : '#FEF2F2',
          color: mensajeAccion.type === 'success' ? '#065F46' : '#991B1B',
        }}>
          {mensajeAccion.message}
        </div>
      )}
    </div>
  )
}
