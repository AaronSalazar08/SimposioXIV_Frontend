import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Layout from './components/Layout'
import AdminLayout from './components/admin/AdminLayout'
import Login from './pages/Login'
import Home from './pages/Home'
import Informacion from './pages/Informacion'
import Tematicas from './pages/Tematicas'
import Inscripciones from './pages/Inscripciones'
import Cronograma from './pages/Cronograma'
import Perfil from './pages/Perfil'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsuarios from './pages/admin/AdminUsuarios'
import AdminEventos from './pages/admin/AdminEventos'
import AdminHorarios from './pages/admin/AdminHorarios'
import AdminAulas from './pages/admin/AdminAulas'
import AdminPonentes from './pages/admin/AdminPonentes'
import AdminAreas from './pages/admin/AdminAreas'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Rutas del sitio (participantes) */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="informacion" element={<Informacion />} />
          <Route path="tematicas" element={<Tematicas />} />
          <Route path="inscripciones" element={<Inscripciones />} />
          <Route path="cronograma" element={<Cronograma />} />
          <Route path="perfil" element={<Perfil />} />
        </Route>

        {/* Rutas de administración */}
        <Route
          path="admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="usuarios" element={<AdminUsuarios />} />
          <Route path="eventos" element={<AdminEventos />} />
          <Route path="horarios" element={<AdminHorarios />} />
          <Route path="aulas" element={<AdminAulas />} />
          <Route path="ponentes" element={<AdminPonentes />} />
          <Route path="areas" element={<AdminAreas />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
