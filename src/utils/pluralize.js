/** Devuelve singular o plural según el conteo (n === 1). */
export function pluralize(count, singular, plural = `${singular}s`) {
  return count === 1 ? singular : plural
}
