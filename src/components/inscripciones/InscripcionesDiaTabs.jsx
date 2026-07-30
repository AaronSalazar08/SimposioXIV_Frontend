import { DIAS_SIMPOSIO } from '../../constants/eventos'
import { cx } from '../../utils/cx'

const DAY_DATES = { '1': '05 Ago', '2': '06 Ago', '3': '07 Ago' }

function badgeLabel(count) {
  if (!count || count <= 0) return null
  return count > 99 ? '99+' : String(count)
}

export default function InscripcionesDiaTabs({ diaActivo, onSelectDia, conteosPorDia = {} }) {
  return (
    <div
      className="flex w-full gap-2 sm:inline-flex sm:w-auto"
      role="tablist"
      aria-label="Filtrar eventos por día"
    >
      {DIAS_SIMPOSIO.map((dia) => {
        const on = diaActivo === dia.value
        const badge = badgeLabel(conteosPorDia[dia.value])

        return (
          <button
            key={dia.value}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onSelectDia(dia.value)}
            className={cx(
              'group relative flex-1 overflow-hidden rounded-xl px-3 py-2 text-left sm:flex-none sm:px-4',
              'transition-transform transition-shadow duration-200 ease-out active:scale-[0.97]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2',
              on
                ? 'bg-ink-950 shadow-ticket'
                : 'bg-white shadow-card hover:shadow-card-hover hover:-translate-y-px',
            )}
          >
            <span className="flex items-baseline gap-2 pr-6">
              <span className={cx('font-pixel text-[15px] tracking-wide', on ? 'text-brand-cyan' : 'text-slate-300')}>
                {String(dia.numeroDia).padStart(2, '0')}
              </span>
              <span className={cx('font-display text-[14px] font-bold tracking-[-0.01em] sm:text-[15px]', on ? 'text-white' : 'text-slate-700')}>
                Día {dia.numeroDia}
              </span>
            </span>
            <span className={cx('mt-1 hidden font-pixel text-[11px] uppercase tracking-widest sm:block', on ? 'text-white/40' : 'text-slate-400')}>
              {DAY_DATES[dia.value]}
            </span>
            {badge && (
              <span
                className={cx(
                  'absolute right-2.5 top-2 rounded-full px-1.5 py-0.5 font-pixel text-[10px] leading-none',
                  on ? 'bg-white/15 text-brand-cyan-soft' : 'bg-slate-100 text-slate-500',
                )}
              >
                {badge}
              </span>
            )}
            {/* Tear-strip accent — lights up cyan when this day is active */}
            <span
              className={cx(
                'absolute inset-x-0 bottom-0 h-[3px] origin-left transition-transform duration-300 ease-out',
                on ? 'scale-x-100 bg-brand-cyan' : 'scale-x-0 bg-brand-cyan',
              )}
              aria-hidden
            />
          </button>
        )
      })}
    </div>
  )
}
