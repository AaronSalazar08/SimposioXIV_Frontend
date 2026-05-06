import apiClient from './client'

/**
 * Lista los eventos del simposio.
 *
 * Filtros opcionales:
 *   - dia: 1 | 2 | 3
 *   - tipo: 'apertura' | 'clausura' | 'taller' | 'charla'
 *   - area_id: number
 *   - solo_disponibles: boolean — si es true, sólo retorna los que tienen cupos
 */
export const fetchEventos = async (filters = {}) => {
  const params = {}
  if (filters.dia) params.dia = filters.dia
  if (filters.tipo) params.tipo = filters.tipo
  if (filters.area_id) params.area_id = filters.area_id
  if (filters.solo_disponibles) params.solo_disponibles = 1

  const { data } = await apiClient.get('/eventos', { params })
  return data?.data ?? []
}

/**
 * Devuelve el detalle de un evento por id.
 */
export const fetchEvento = async (id) => {
  const { data } = await apiClient.get(`/eventos/${id}`)
  return data?.data ?? null
}
