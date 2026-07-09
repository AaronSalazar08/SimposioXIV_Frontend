import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { TIPO_COLORS, TIPO_COLOR_DEFAULT, TIPO_LABELS } from '../../constants/eventos'

const DIAS = [
  { value: 1, label: 'Miércoles', fecha: '05 Ago' },
  { value: 2, label: 'Jueves', fecha: '06 Ago' },
  { value: 3, label: 'Viernes', fecha: '07 Ago' },
]

function minutosDelDia(iso) {
  if (!iso || typeof iso !== 'string') return null
  const hhmm = iso.includes('T') ? iso.slice(11, 16) : iso
  const [h, m] = hhmm.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  return h * 60 + m
}

function formatMinutos(min) {
  const h = String(Math.floor(min / 60)).padStart(2, '0')
  const m = String(min % 60).padStart(2, '0')
  return `${h}:${m}`
}

function aulaLabel(aula) {
  return `${aula.numero} — ${aula.edificio}`
}

/** Arma la grilla estilo hoja de cálculo de un día a partir de los eventos ya cargados (con horario+aula). */
function useGridDelDia(eventos, dia) {
  return useMemo(() => {
    const delDia = eventos.filter((ev) => ev.horario?.numero_dia === dia && ev.horario?.hora_inicio && ev.horario?.hora_fin)

    const columnas = []
    const vistos = new Set()
    delDia.forEach((ev) => {
      const aula = ev.horario.aula
      if (aula && !vistos.has(aula.id)) {
        vistos.add(aula.id)
        columnas.push(aula)
      }
    })
    columnas.sort((a, b) => a.edificio.localeCompare(b.edificio) || a.numero - b.numero)

    const limites = new Set()
    delDia.forEach((ev) => {
      limites.add(minutosDelDia(ev.horario.hora_inicio))
      limites.add(minutosDelDia(ev.horario.hora_fin))
    })
    const boundaries = Array.from(limites).sort((a, b) => a - b)

    const filas = []
    for (let i = 0; i < boundaries.length - 1; i++) {
      filas.push({ inicio: boundaries[i], fin: boundaries[i + 1] })
    }

    const ocupado = filas.map(() => columnas.map(() => false))
    const celdasPorClave = new Map()

    delDia.forEach((ev) => {
      const inicio = minutosDelDia(ev.horario.hora_inicio)
      const fin = minutosDelDia(ev.horario.hora_fin)
      const filaInicio = boundaries.indexOf(inicio)
      const filaSpan = boundaries.indexOf(fin) - filaInicio
      if (filaInicio < 0 || filaSpan <= 0) return

      const aula = ev.horario.aula
      const colIndex = aula ? columnas.findIndex((c) => c.id === aula.id) : -1
      const colSpan = aula ? 1 : Math.max(1, columnas.length)
      const colStart = aula ? colIndex : 0

      for (let f = filaInicio; f < filaInicio + filaSpan; f++) {
        for (let c = colStart; c < colStart + colSpan; c++) {
          if (ocupado[f]?.[c] !== undefined) ocupado[f][c] = true
        }
      }

      // Varios eventos pueden compartir el mismo horario_id (actividades secuenciales
      // en un mismo bloque): se agrupan en una sola celda en vez de superponerse.
      const clave = `${filaInicio}|${filaSpan}|${colStart}|${colSpan}`
      if (!celdasPorClave.has(clave)) {
        celdasPorClave.set(clave, { key: clave, filaInicio, filaSpan, colStart, colSpan, general: !aula, eventos: [] })
      }
      celdasPorClave.get(clave).eventos.push(ev)
    })

    const celdas = Array.from(celdasPorClave.values())

    const rellenos = []
    filas.forEach((_, f) => {
      columnas.forEach((_, c) => {
        if (!ocupado[f][c]) rellenos.push({ fila: f, col: c })
      })
    })

    return { columnas, filas, celdas, rellenos }
  }, [eventos, dia])
}

function CeldaEvento({ celda, colOffset, rowOffset }) {
  return (
    <div
      style={{
        gridColumn: `${celda.colStart + colOffset} / span ${celda.colSpan}`,
        gridRow: `${celda.filaInicio + rowOffset} / span ${celda.filaSpan}`,
      }}
      className="m-[2px] rounded-lg border border-gray-200 bg-white overflow-hidden flex flex-col divide-y divide-gray-100"
    >
      {celda.eventos.map((ev) => {
        const colorClass = TIPO_COLORS[ev.tipo] ?? TIPO_COLOR_DEFAULT
        return (
          <div key={ev.id} className={`px-2.5 py-2 text-xs flex flex-col gap-0.5 ${colorClass}`}>
            <span className="font-semibold leading-snug">{ev.titulo}</span>
            {!celda.general && ev.horario?.aula && (
              <span className="opacity-70 truncate">{aulaLabel(ev.horario.aula)}</span>
            )}
            {!ev.esta_activo && <span className="opacity-70 italic">Inactivo</span>}
          </div>
        )
      })}
    </div>
  )
}

export default function HorarioGrid({ eventos }) {
  const [dia, setDia] = useState(1)
  const { columnas, filas, celdas, rellenos } = useGridDelDia(eventos, dia)

  const colOffset = 2 // col 1 = etiqueta de hora
  const rowOffset = 2 // fila 1 = encabezado de aulas

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-ucr-blue-dark">Horario general</h2>
          <p className="text-xs text-gray-500 mt-0.5">Se arma automáticamente con los horarios y eventos creados.</p>
        </div>
        <div className="flex gap-1.5">
          {DIAS.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => setDia(d.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                dia === d.value
                  ? 'bg-ucr-blue text-white border-ucr-blue'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-ucr-blue hover:text-ucr-blue'
              }`}
            >
              {d.label} <span className="opacity-70">· {d.fecha}</span>
            </button>
          ))}
        </div>
      </div>

      {filas.length === 0 ? (
        <p className="text-gray-500 text-sm py-8 text-center">
          Todavía no hay horarios con eventos para este día.{' '}
          <Link to="/admin/horarios" className="text-ucr-blue hover:text-ucr-blue-dark font-medium">Crear horario</Link>
        </p>
      ) : (
        <div className="overflow-x-auto">
          <div
            className="grid bg-gray-100 border border-gray-200 rounded-lg min-w-max"
            style={{
              gridTemplateColumns: `88px repeat(${columnas.length}, minmax(150px, 1fr))`,
              gridTemplateRows: `auto repeat(${filas.length}, minmax(52px, auto))`,
            }}
          >
            {/* Encabezado */}
            <div className="bg-gray-50 border-b border-r border-gray-200 px-2 py-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wide sticky left-0" style={{ gridColumn: 1, gridRow: 1 }}>
              Hora
            </div>
            {columnas.map((aula, c) => (
              <div
                key={aula.id}
                style={{ gridColumn: c + colOffset, gridRow: 1 }}
                className="bg-gray-50 border-b border-r border-gray-200 px-2 py-2 text-[11px] font-semibold text-gray-600 text-center truncate"
              >
                {aulaLabel(aula)}
              </div>
            ))}

            {/* Etiquetas de hora */}
            {filas.map((f, i) => (
              <div
                key={`hora-${f.inicio}`}
                style={{ gridColumn: 1, gridRow: i + rowOffset }}
                className="bg-gray-50 border-b border-r border-gray-200 px-2 py-1.5 text-[11px] font-medium text-gray-500 sticky left-0"
              >
                {formatMinutos(f.inicio)}–{formatMinutos(f.fin)}
              </div>
            ))}

            {/* Celdas vacías (líneas de la grilla) */}
            {rellenos.map(({ fila, col }) => (
              <div
                key={`vacia-${fila}-${col}`}
                style={{ gridColumn: col + colOffset, gridRow: fila + rowOffset }}
                className="border-b border-r border-gray-200"
              />
            ))}

            {/* Eventos */}
            {celdas.map((celda) => (
              <CeldaEvento key={celda.key} celda={celda} colOffset={colOffset} rowOffset={rowOffset} />
            ))}
          </div>
        </div>
      )}

      {Object.keys(TIPO_LABELS).length > 0 && (
        <div className="flex flex-wrap gap-3 mt-4">
          {Object.entries(TIPO_LABELS).map(([tipo, label]) => (
            <span key={tipo} className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${TIPO_COLORS[tipo] ?? TIPO_COLOR_DEFAULT}`}>
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
