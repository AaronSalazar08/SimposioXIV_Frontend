import { createContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as loginApi, logout as logoutApi, getMe } from '../api/auth'

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => !!localStorage.getItem('auth_token'))
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (!token) return

    getMe()
      .then((data) => {
        setUser(data?.data ?? data)
      })
      .catch(() => {
        localStorage.removeItem('auth_token')
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

    localStorage.setItem('auth_token', token)

    const me = await getMe()
    setUser(me?.data ?? me)
    navigate('/')
  }, [navigate])

  const logout = useCallback(async () => {
    try {
      await logoutApi()
    } catch {
      // ignorar errores del servidor al desloguear
    }
    localStorage.removeItem('auth_token')
    setUser(null)
    navigate('/login')
  }, [navigate])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
