const LOCALE = 'es-CR'

export function formatHora(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString(LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  })
}

export function formatFecha(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

/** Etiqueta corta para pestañas de día (ej. "lunes, 9 de junio"). */
export function formatFechaDiaTab(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

/** Misma fecha que `formatFecha` pero incluye el año (p. ej. encabezados del cronograma). */
export function formatFechaConAnio(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
