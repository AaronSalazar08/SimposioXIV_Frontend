import { ESTADO_CONFIRMADO } from '../constants/inscripciones'

export function filterConfirmadas(inscripciones) {
  return inscripciones.filter((i) => i.estado === ESTADO_CONFIRMADO)
}

export function countConfirmadas(inscripciones) {
  return filterConfirmadas(inscripciones).length
}

export function buildInscripcionesPorEvento(inscripciones) {
  const map = new Map()
  for (const i of inscripciones) {
    if (i.estado === ESTADO_CONFIRMADO) {
      map.set(i.evento_id, i)
    }
  }
  return map
}

/** Agrupa inscripciones confirmadas con evento por día del simposio. */
export function groupInscripcionesPorDia(inscripciones) {
  const confirmadas = inscripciones.filter((i) => i.estado === ESTADO_CONFIRMADO && i.evento)
  const map = new Map()
  for (const i of confirmadas) {
    const dia = i.evento.horario?.numero_dia ?? 0
    const fecha = i.evento.horario?.hora_inicio
    if (!map.has(dia)) map.set(dia, { dia, fecha, items: [] })
    map.get(dia).items.push(i)
  }
  for (const g of map.values()) {
    g.items.sort((a, b) => {
      const ai = a.evento.horario?.hora_inicio ?? ''
      const bi = b.evento.horario?.hora_inicio ?? ''
      return ai.localeCompare(bi)
    })
  }
  return [...map.values()].sort((a, b) => a.dia - b.dia)
}
