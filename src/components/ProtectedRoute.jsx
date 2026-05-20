import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import LoadingState from './ui/LoadingState'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ucr-blue-muted">
        <LoadingState className="py-0" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}
