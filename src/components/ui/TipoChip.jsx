import { TIPO_LABELS } from '../../constants/eventos'
import { TIPO_TOKEN, TIPO_TOKEN_DEFAULT } from '../../constants/tipoTokens'
import { cx } from '../../utils/cx'

/** Etiqueta cuadrada y oscura del tipo de evento (charla, taller, ...). */
export default function TipoChip({ tipo, className }) {
  const label = TIPO_LABELS[tipo] ?? tipo
  const tk = TIPO_TOKEN[tipo] ?? TIPO_TOKEN_DEFAULT

  return (
    <span
      className={cx(
        'inline-flex items-center rounded px-2.5 py-1 font-pixel text-[11px] font-bold uppercase tracking-wide text-white',
        tk.chip,
        className,
      )}
    >
      {label}
    </span>
  )
}
