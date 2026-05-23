import apiClient from './client'
export { normalizeAuthUser } from './authNormalize'

export const login = async ({ identifier, password }) => {
  const { data } = await apiClient.post('/login', { identifier, password })
  return data
}

export const logout = async () => {
  const { data } = await apiClient.post('/logout')
  return data
}

export const getMe = async () => {
  const { data } = await apiClient.get('/me')
  return data
}
