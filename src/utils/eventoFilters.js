/** Convierte estado del formulario de filtros al shape que espera `fetchEventos`. */
export function buildEventosApiFilters({ dia, tipo, soloDisponibles }) {
  return {
    dia: dia || undefined,
    tipo: tipo || undefined,
    solo_disponibles: soloDisponibles || undefined,
  }
}

/** Cuenta ítems por día del simposio (claves numéricas 1–3). */
export function countPorDiaSimposio(items, getNumeroDia) {
  const counts = { 1: 0, 2: 0, 3: 0 }
  for (const item of items) {
    const d = Number(getNumeroDia(item))
    if (counts[d] != null) counts[d] += 1
  }
  return counts
}

/** Badge en pestaña: inscripciones del usuario si hay; si no, total de eventos del día. */
export function conteosBadgeDiaTabs({ inscripcionesPorDia, eventosPorDia }) {
  return {
    '1': inscripcionesPorDia[1] || eventosPorDia[1] || 0,
    '2': inscripcionesPorDia[2] || eventosPorDia[2] || 0,
    '3': inscripcionesPorDia[3] || eventosPorDia[3] || 0,
  }
}
