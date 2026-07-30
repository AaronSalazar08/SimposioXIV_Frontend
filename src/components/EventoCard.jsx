import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { TIPO_TOKEN, TIPO_TOKEN_DEFAULT } from '../constants/tipoTokens'
import { nombresPonentesEvento } from '../utils/ponentes'
import { cx } from '../utils/cx'
import AreaChip from './ui/AreaChip'
import Spinner from './ui/Spinner'
import TipoChip from './ui/TipoChip'

function cuposEstado(evento) {
  const disponibles = evento.cupos_disponibles ?? 0
  if (disponibles <= 0) return { label: 'Agotado', color: 'text-status-full', dot: 'bg-status-full' }
  const capacidad = evento.capacidad || disponibles
  const ratio = disponibles / capacidad
  if (ratio <= 0.25) return { label: `${disponibles} cupos`, color: 'text-status-scarce', dot: 'bg-status-scarce' }
  return { label: `${disponibles} cupos`, color: 'text-status-open', dot: 'bg-status-open' }
}

const BUTTON_BASE = cx(
  'inline-flex items-center justify-center gap-1.5 rounded-full font-display text-[13px] font-semibold',
  'transition-transform transition-opacity duration-200 ease-out active:scale-[0.96]',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2',
)

function ReservarButton({ onClick, disabled, loading, sinCupos }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={sinCupos ? 'Sin cupos disponibles' : 'Reservar cupo'}
      className={cx(
        BUTTON_BASE,
        'px-4 py-2',
        sinCupos
          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
          : 'bg-ucr-blue text-white shadow-card hover:bg-ucr-blue-dark hover:shadow-ticket-hover hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed',
      )}
    >
      {loading ? (
        <><Spinner size="sm" />Reservando…</>
      ) : sinCupos ? (
        'Agotado'
      ) : (
        <>Reservar <span aria-hidden>→</span></>
      )}
    </button>
  )
}

function ReservadoStub({ onCancelar, cancelando }) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-status-open/25 bg-status-open/10 px-3 py-1.5 font-display text-[12px] font-semibold text-status-open">
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
        Reservado
      </span>
      <button
        type="button"
        onClick={onCancelar}
        disabled={cancelando}
        className={cx(
          BUTTON_BASE,
          'px-2.5 py-1.5 text-slate-400 underline decoration-dotted decoration-1 underline-offset-4',
          'hover:text-status-full active:scale-95 disabled:opacity-50',
        )}
      >
        {cancelando ? <Spinner size="sm" /> : 'Cancelar'}
      </button>
    </div>
  )
}

export default function EventoCard({
  evento, onInscribirse, onCancelar,
  inscribiendo = false, cancelando = false,
  inscripcionId = null, mensajeAccion = null,
}) {
  const rootRef = useRef(null)
  const descripcionRef = useRef(null)
  const [expandido, setExpandido] = useState(false)
  const [necesitaToggle, setNecesitaToggle] = useState(false)

  useEffect(() => {
    if (mensajeAccion?.type === 'error' && rootRef.current)
      rootRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
  }, [mensajeAccion])

  useLayoutEffect(() => {
    const el = descripcionRef.current
    if (el) setNecesitaToggle(el.scrollHeight > el.clientHeight)
  }, [evento.descripcion])

  const inscrito = !!inscripcionId || !!evento.usuario_inscrito
  const sinCupos = !evento.tiene_capacidad_disponible
  const tipo = evento.tipo
  const tk = TIPO_TOKEN[tipo] ?? TIPO_TOKEN_DEFAULT
  const cupos = cuposEstado(evento)
  const ponentesTexto = nombresPonentesEvento(evento).join(', ')

  return (
    <div
      ref={rootRef}
      className={cx(
        'relative flex overflow-hidden rounded-2xl bg-white',
        'transition-transform transition-shadow duration-300 ease-out hover:-translate-y-0.5',
        inscrito ? 'shadow-ticket ring-1 ring-brand-cyan/25' : 'shadow-card hover:shadow-ticket-hover',
      )}
    >
      {/* Ticket spine — carries the tipo color, like a stub edge */}
      <div className={cx('w-[5px] shrink-0', tk.spine)} aria-hidden />

      <div className="min-w-0 flex-1">
        <div className="px-5 pb-4 pt-4">
          {/* Meta row: tipo + areas + aula */}
          <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
            <TipoChip tipo={tipo} />
            {evento.areas?.map((a) => (
              <AreaChip key={a.id} area={a} />
            ))}
            {evento.horario?.aula && (
              <span className="ml-auto font-pixel text-[13px] text-slate-400">
                {evento.horario.aula.edificio} · {evento.horario.aula.numero}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-display text-[1.2rem] font-bold leading-snug tracking-[-0.01em] text-slate-900">
            {evento.titulo}
          </h3>

          {/* Ponentes */}
          {ponentesTexto && (
            <p className="mt-1.5 font-body text-[15px] text-slate-500">{ponentesTexto}</p>
          )}

          {/* Description */}
          {evento.descripcion && (
            <div className="mt-2">
              <p
                ref={descripcionRef}
                className={cx('font-body text-[14px] leading-[1.7] text-slate-400', !expandido && 'line-clamp-2')}
              >
                {evento.descripcion}
              </p>
              {necesitaToggle && (
                <button
                  type="button"
                  onClick={() => setExpandido((v) => !v)}
                  className="mt-1 rounded font-display text-[13px] font-semibold text-brand-cyan transition-opacity duration-150 hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan active:scale-95"
                >
                  {expandido ? 'Ver menos' : 'Ver más'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Die-cut perforation between details and the reservation stub */}
        <div className="ticket-perforation mx-5" style={{ '--notch-color': '#fff' }} />

        {/* Stub: cupos + acción */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
          <span className={cx('inline-flex items-center gap-1.5 font-display text-[13px] font-semibold', cupos.color)}>
            <span className={cx('h-1.5 w-1.5 rounded-full', cupos.dot)} aria-hidden />
            {cupos.label}
          </span>

          {inscrito ? (
            <ReservadoStub onCancelar={() => onCancelar?.(inscripcionId, evento)} cancelando={cancelando} />
          ) : (
            <ReservarButton
              onClick={() => { if (!sinCupos && !inscribiendo) onInscribirse?.(evento) }}
              disabled={inscribiendo || sinCupos}
              loading={inscribiendo}
              sinCupos={sinCupos}
            />
          )}
        </div>

        {/* Feedback */}
        {mensajeAccion && (
          <div
            role="alert"
            className={cx(
              'animate-slide-down border-t px-5 py-3 text-sm font-medium leading-snug text-slate-700',
              mensajeAccion.type === 'success' ? 'border-status-open/20 bg-status-open/10' : 'border-status-full/20 bg-status-full/10',
            )}
          >
            {mensajeAccion.message}
          </div>
        )}
      </div>
    </div>
  )
}
