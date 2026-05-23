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
            className={`rounded-xl px-3 py-2.5 text-center transition-all border ${
              activo
                ? 'bg-ucr-blue border-ucr-blue text-white shadow-sm'
                : 'bg-white border-gray-200 text-gray-500 hover:border-ucr-blue hover:text-ucr-blue'
            }`}
          >
            <span
              className={`block text-[11px] sm:text-xs capitalize mb-0.5 leading-tight ${
                activo ? 'text-blue-100' : 'text-gray-400'
              }`}
            >
              {formatFechaDiaTab(dia.fechaReferencia)}
            </span>
            <span className="flex items-center justify-center gap-1.5">
              <span className={`text-base sm:text-lg font-bold ${activo ? 'text-white' : 'text-gray-700'}`}>
                Día {dia.numeroDia}
              </span>
              {badge && (
                <span
                  className={`inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full text-[10px] font-bold ${
                    activo
                      ? 'bg-white text-ucr-blue'
                      : 'bg-gray-100 text-gray-600'
                  }`}
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
