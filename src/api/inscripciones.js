import apiClient from './client'

/**
 * Devuelve las inscripciones del usuario autenticado.
 */
export const fetchMisInscripciones = async () => {
  const { data } = await apiClient.get('/inscripciones')
  return data?.data ?? []
}

/**
 * Inscribe al usuario autenticado al evento indicado.
 */
export const inscribirseEvento = async (eventoId) => {
  const { data } = await apiClient.post('/inscripciones', { evento_id: eventoId })
  return data?.data ?? null
}

/**
 * Cancela una inscripción existente del usuario autenticado.
 */
export const cancelarInscripcion = async (inscripcionId) => {
  const { data } = await apiClient.delete(`/inscripciones/${inscripcionId}`)
  return data
}
