import { DIAS_SIMPOSIO } from '../../constants/eventos'

const DAY_DATES = { '1': '05 Ago', '2': '06 Ago', '3': '07 Ago' }

function badgeLabel(count) {
  if (!count || count <= 0) return null
  return count > 99 ? '99+' : String(count)
}

export default function InscripcionesDiaTabs({ diaActivo, onSelectDia, conteosPorDia = {} }) {
  return (
    <div
      className="flex sm:inline-flex w-full sm:w-auto rounded-full gap-[3px]"
      style={{ background: 'rgba(0,0,0,0.07)', padding: 5 }}
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
            className="flex-1 sm:flex-none inline-flex items-center justify-center"
            style={{
              gap: 'clamp(5px,1vw,9px)',
              height: 'clamp(38px,5vh,50px)',
              padding: '0 clamp(10px,2.5vw,22px)',
              border: 'none',
              borderRadius: 9999,
              background: on ? '#111827' : 'transparent',
              boxShadow: on ? '0 1px 6px rgba(0,0,0,0.2)' : 'none',
              color: on ? '#fff' : '#6B7280',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: 'clamp(14px,1.5vw,19px)',
              cursor: 'pointer',
              transition: 'all 150ms',
              whiteSpace: 'nowrap',
            }}
          >
            Día {dia.numeroDia}
            <span className="hidden sm:inline" style={{ fontFamily: "var(--font-pixel)", fontSize: 'clamp(14px,1.5vw,20px)', opacity: on ? 0.6 : 0.7 }}>
              · {DAY_DATES[dia.value]}
            </span>
            {badge && (
              <span style={{
                fontSize: 'clamp(12px,1.3vw,19px)',
                fontFamily: "var(--font-pixel)",
                background: on ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                color: on ? '#fff' : '#6B7280',
                borderRadius: 9999,
                padding: '2px 7px',
              }}>
                {badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
