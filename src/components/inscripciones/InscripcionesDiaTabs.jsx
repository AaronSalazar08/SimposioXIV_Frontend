import { DIAS_SIMPOSIO } from '../../constants/eventos'

const DAY_DATES = { '1': '05 Ago', '2': '06 Ago', '3': '07 Ago' }

function badgeLabel(count) {
  if (!count || count <= 0) return null
  return count > 99 ? '99+' : String(count)
}

export default function InscripcionesDiaTabs({ diaActivo, onSelectDia, conteosPorDia = {} }) {
  return (
    <div
      style={{ display: 'inline-flex', background: 'rgba(0,0,0,0.07)', borderRadius: 9999, padding: 5, gap: 3 }}
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
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 9,
              height: 50, padding: '0 22px', border: 'none', borderRadius: 9999,
              background: on ? '#111827' : 'transparent',
              boxShadow: on ? '0 1px 6px rgba(0,0,0,0.2)' : 'none',
              color: on ? '#fff' : '#6B7280',
              fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 19,
              cursor: 'pointer', transition: 'all 150ms', whiteSpace: 'nowrap',
            }}
          >
            Día {dia.numeroDia}
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 15, opacity: on ? 0.6 : 0.7 }}>
              · {DAY_DATES[dia.value]}
            </span>
            {badge && (
              <span style={{ fontSize: 14, fontFamily: "'Space Mono', monospace", background: on ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)', color: on ? '#fff' : '#6B7280', borderRadius: 9999, padding: '2px 9px' }}>
                {badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
