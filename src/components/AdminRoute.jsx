import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import LoadingState from './ui/LoadingState'

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ucr-blue-muted">
        <LoadingState className="py-0" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (user.tipo_usuario !== 'admin') return <Navigate to="/" replace />

  return children
}
