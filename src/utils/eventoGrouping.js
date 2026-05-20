import { formatFecha, formatHora } from './date'

/**
 * Agrupa por día del simposio + misma hora de inicio y fin (franja simultánea).
 * Orden: día ascendente, luego hora de inicio.
 */
export function groupEventosPorFranjaHoraria(eventosList) {
  const grupos = new Map()
  const sinHorario = []

  for (const e of eventosList) {
    const h = e.horario
    if (!h?.hora_inicio) {
      sinHorario.push(e)
      continue
    }
    const dia = Number(h.numero_dia) || 0
    const t0 = new Date(h.hora_inicio).getTime()
    const t1 = new Date(h.hora_fin || h.hora_inicio).getTime()
    const key = `${dia}|${t0}|${t1}`
    if (!grupos.has(key)) {
      grupos.set(key, {
        key,
        dia,
        hora_inicio: h.hora_inicio,
        hora_fin: h.hora_fin || h.hora_inicio,
        numero_dia: h.numero_dia,
        eventos: [],
      })
    }
    grupos.get(key).eventos.push(e)
  }

  const arr = [...grupos.values()].map((g) => ({
    ...g,
    eventos: [...g.eventos].sort((a, b) =>
      (a.titulo || '').localeCompare(b.titulo || '', 'es', { sensitivity: 'base' }),
    ),
  }))

  arr.sort((a, b) => {
    if (a.dia !== b.dia) return a.dia - b.dia
    return new Date(a.hora_inicio) - new Date(b.hora_inicio)
  })

  if (sinHorario.length) {
    sinHorario.sort((a, b) =>
      (a.titulo || '').localeCompare(b.titulo || '', 'es', { sensitivity: 'base' }),
    )
    arr.push({
      key: 'sin-horario',
      dia: 999,
      hora_inicio: null,
      hora_fin: null,
      numero_dia: null,
      eventos: sinHorario,
    })
  }

  return arr
}

/** Orden global por día, hora y título (vista lista / rejilla). */
export function ordenarEventosPlano(eventosList) {
  return [...eventosList].sort((a, b) => {
    const da = Number(a.horario?.numero_dia) || 999
    const db = Number(b.horario?.numero_dia) || 999
    if (da !== db) return da - db
    const ta = a.horario?.hora_inicio ? new Date(a.horario.hora_inicio).getTime() : 0
    const tb = b.horario?.hora_inicio ? new Date(b.horario.hora_inicio).getTime() : 0
    if (ta !== tb) return ta - tb
    return (a.titulo || '').localeCompare(b.titulo || '', 'es', { sensitivity: 'base' })
  })
}

export function etiquetaFranjaHoraria(grupo) {
  if (!grupo.hora_inicio) {
    return 'Sin fecha u hora en agenda'
  }
  const diaLabel =
    grupo.numero_dia != null && grupo.numero_dia !== ''
      ? `Día ${grupo.numero_dia}`
      : `Día ${grupo.dia || '—'}`
  const fecha = formatFecha(grupo.hora_inicio)
  const horas = `${formatHora(grupo.hora_inicio)} – ${formatHora(grupo.hora_fin)}`
  return `${diaLabel} · ${fecha} · ${horas}`
}
