/**
 * Extrae un mensaje legible desde una respuesta de error de Axios o similar.
 */
export function getApiErrorMessage(err, fallback = 'Ocurrió un error.') {
  const data = err?.response?.data
  if (data?.errors?.evento_id?.[0]) return data.errors.evento_id[0]
  if (typeof data?.message === 'string' && data.message) return data.message
  if (typeof data?.error === 'string' && data.error) return data.error
  if (err?.message) return err.message
  return fallback
}
