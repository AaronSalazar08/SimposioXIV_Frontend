import axios from 'axios'
import { getAuthToken, removeAuthToken } from '../utils/authStorage'
import { notifyUnauthorized, shouldHandleUnauthorized } from '../utils/authSession'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (shouldHandleUnauthorized(error)) {
      removeAuthToken()
      notifyUnauthorized()
    }
    return Promise.reject(error)
  }
)

export default apiClient
