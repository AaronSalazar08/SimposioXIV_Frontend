import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import LoadingState from './ui/LoadingState'

const STAFF_ALLOWED_PREFIX = '/admin/eventos'

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ucr-blue-muted">
        <LoadingState className="py-0" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (user.tipo_usuario !== 'admin' && user.tipo_usuario !== 'staff') return <Navigate to="/" replace />

  if (user.tipo_usuario === 'staff' && !location.pathname.startsWith(STAFF_ALLOWED_PREFIX)) {
    return <Navigate to="/admin/eventos" replace />
  }

  return children
}
