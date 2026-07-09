/** Normaliza texto para comparaciones de búsqueda: minúsculas, sin acentos. */
export function normalizeText(value) {
  return (value ?? '')
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

/** true si `query` aparece en alguno de los `fields` dados (ignorando acentos/mayúsculas). Vacío = todo coincide. */
export function matchesQuery(query, ...fields) {
  const q = normalizeText(query)
  if (!q) return true
  return fields.some((f) => normalizeText(f).includes(q))
}
