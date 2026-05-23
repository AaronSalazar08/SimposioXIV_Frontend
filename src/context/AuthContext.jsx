import { createContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  login as loginApi,
  logout as logoutApi,
  getMe,
  normalizeAuthUser,
} from '../api/auth'
import { useQueryClient } from '@tanstack/react-query'
import { getAuthToken, removeAuthToken, setAuthToken } from '../utils/authStorage'
import { registerUnauthorizedHandler } from '../utils/authSession'

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => !!getAuthToken())
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  useEffect(() => {
    return registerUnauthorizedHandler(() => {
      setUser(null)
      queryClient.clear()
      navigate('/login', { replace: true })
    })
  }, [navigate, queryClient])

  useEffect(() => {
    const token = getAuthToken()
    if (!token) return

    getMe()
      .then((data) => {
        setUser(normalizeAuthUser(data))
      })
      .catch(() => {
        removeAuthToken()
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const login = useCallback(async (credentials) => {
    const data = await loginApi(credentials)

    const token =
      data?.token ?? data?.access_token ?? data?.data?.token ?? data?.data?.access_token
    if (!token) {
      throw new Error('No se recibió token de autenticación.')
    }

    setAuthToken(token)

    const me = await getMe()
    setUser(normalizeAuthUser(me))
    navigate('/')
  }, [navigate])

  const logout = useCallback(async () => {
    try {
      await logoutApi()
    } catch {
      // ignorar errores del servidor al desloguear
    }
    removeAuthToken()
    setUser(null)
    navigate('/login')
  }, [navigate])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
