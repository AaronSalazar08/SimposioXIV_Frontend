/** Convierte estado del formulario de filtros al shape que espera `fetchEventos`. */
export function buildEventosApiFilters({ dia, tipo, soloDisponibles }) {
  return {
    dia: dia || undefined,
    tipo: tipo || undefined,
    solo_disponibles: soloDisponibles || undefined,
  }
}
