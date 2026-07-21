/** Nombre completo de un ponente, con fallback si `nombre_completo` no viene del backend. */
export function nombreCompletoPonente(ponente) {
  return ponente.nombre_completo || `${ponente.nombre ?? ''} ${ponente.apellidos ?? ''}`.trim()
}

/** Nombres completos de los ponentes asociados a un evento, listos para mostrar (ej. unidos con ', '). */
export function nombresPonentesEvento(evento) {
  return (evento?.ponentes ?? []).map(nombreCompletoPonente)
}
