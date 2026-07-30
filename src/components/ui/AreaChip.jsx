import { cx } from '../../utils/cx'

/** Etiqueta cuadrada y oscura de una temática/área — oscurece el color de la BD para que no brille. */
export default function AreaChip({ area, className }) {
  return (
    <span
      className={cx('inline-flex items-center rounded px-2.5 py-1 font-pixel text-[11px] font-bold uppercase tracking-wide text-white', className)}
      style={{ background: `color-mix(in srgb, ${area.color || '#64748B'} 45%, black)` }}
    >
      {area.nombre}
    </span>
  )
}
