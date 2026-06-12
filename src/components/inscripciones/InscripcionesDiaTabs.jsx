import { DIAS_SIMPOSIO } from '../../constants/eventos'
import { formatFechaDiaTab } from '../../utils/date'

function badgeLabel(count) {
  if (!count || count <= 0) return null
  return count > 99 ? '99+' : String(count)
}

export default function InscripcionesDiaTabs({ diaActivo, onSelectDia, conteosPorDia = {} }) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6"
      role="tablist"
      aria-label="Filtrar eventos por día"
    >
      {DIAS_SIMPOSIO.map((dia) => {
        const activo = diaActivo === dia.value
        const badge = badgeLabel(conteosPorDia[dia.value])

        return (
          <button
            key={dia.value}
            type="button"
            role="tab"
            aria-selected={activo}
            onClick={() => onSelectDia(dia.value)}
            className="rounded-2xl px-4 py-3.5 text-center transition-all duration-200 relative overflow-hidden"
            style={
              activo
                ? {
                    background: 'linear-gradient(135deg, #005DA4, #003A6E)',
                    border: '1px solid transparent',
                    boxShadow: '0 4px 12px 0 rgba(0,93,164,0.28)',
                    transform: 'translateY(-1px)',
                  }
                : {
                    background: '#fff',
                    border: '1px solid rgba(0,93,164,0.12)',
                    boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)',
                  }
            }
          >
            {activo && (
              <div
                className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(33,187,239,0.18), transparent 65%)', transform: 'translate(30%, -30%)' }}
              />
            )}
            <span
              className={`block text-sm capitalize mb-1 leading-tight font-mono-accent tracking-wide ${
                activo ? 'text-blue-200/80' : 'text-gray-400'
              }`}
            >
              {formatFechaDiaTab(dia.fechaReferencia)}
            </span>
            <span className="flex items-center justify-center gap-1.5">
              <span
                className={`text-lg font-bold font-display ${activo ? 'text-white' : 'text-ucr-blue-dark'}`}
                style={{ letterSpacing: '-0.02em' }}
              >
                Día {dia.numeroDia}
              </span>
              {badge && (
                <span
                  className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full text-sm font-bold font-mono-accent"
                  style={
                    activo
                      ? { background: 'rgba(255,255,255,0.2)', color: '#fff' }
                      : { background: 'rgba(0,93,164,0.1)', color: '#004A87' }
                  }
                >
                  {badge}
                </span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
