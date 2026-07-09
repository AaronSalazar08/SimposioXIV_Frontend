/** Claves de caché para React Query (evita strings mágicos dispersos). */
export const queryKeys = {
  eventos: (filters = {}) => ['eventos', filters],
  misInscripciones: () => ['mis-inscripciones'],
  adminUsuarios: () => ['admin', 'usuarios'],
  adminEventos: () => ['admin', 'eventos'],
  adminEventoInscritos: (eventoId) => ['admin', 'eventos', eventoId, 'inscritos'],
  adminHorarios: () => ['admin', 'horarios'],
  adminAulas: () => ['admin', 'aulas'],
  adminPonentes: () => ['admin', 'ponentes'],
  adminAreas: () => ['admin', 'areas'],
}
