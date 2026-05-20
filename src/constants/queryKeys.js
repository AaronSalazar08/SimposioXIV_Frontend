/** Claves de caché para React Query (evita strings mágicos dispersos). */
export const queryKeys = {
  eventos: (filters = {}) => ['eventos', filters],
  misInscripciones: () => ['mis-inscripciones'],
}
