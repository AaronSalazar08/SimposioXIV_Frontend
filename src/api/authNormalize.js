/**
 * Convierte la respuesta de `/me` o post-login al shape que usa el frontend (`name`, `email`).
 */
export function normalizeAuthUser(apiPayload) {
  if (apiPayload == null) return null

  const unwrap =
    apiPayload.data !== undefined && apiPayload.data !== null
      ? apiPayload.data
      : apiPayload

  if (unwrap == null || typeof unwrap !== 'object') return null

  const u = unwrap.user ?? unwrap.usuario ?? unwrap
  if (u == null || typeof u !== 'object') return null

  const email =
    (typeof u.email === 'string' && u.email.trim()) ||
    (typeof u.correo === 'string' && u.correo.trim()) ||
    (typeof u.correo_electronico === 'string' && u.correo_electronico.trim()) ||
    ''

  const fromSingle =
    (typeof u.name === 'string' && u.name.trim()) ||
    (typeof u.nombre_completo === 'string' && u.nombre_completo.trim()) ||
    ''

  const fromParts =
    [u.nombre, u.apellidos, u.apellido]
      .filter((x) => typeof x === 'string' && x.trim())
      .join(' ')
      .trim() || ''

  const name = fromSingle || fromParts || undefined

  return {
    ...u,
    email: email || undefined,
    name,
  }
}
