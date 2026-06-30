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

export const enviarOtpPassword = async () => {
  const { data } = await apiClient.post('/password/otp')
  return data
}

export const verificarOtpPassword = async ({ codigo }) => {
  const { data } = await apiClient.post('/password/otp/verificar', { codigo })
  return data
}

export const cambiarPassword = async ({ password, password_confirmation }) => {
  const { data } = await apiClient.put('/password/cambiar', { password, password_confirmation })
  return data
}
