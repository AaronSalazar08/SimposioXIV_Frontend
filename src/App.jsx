import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Layout from './components/Layout'
import AdminLayout from './components/admin/AdminLayout'
import Login from './pages/Login'
import Home from './pages/Home'
import Inscripciones from './pages/Inscripciones'
import Agenda from './pages/Agenda'
import Cronograma from './pages/Cronograma'
import Perfil from './pages/Perfil'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsuarios from './pages/admin/AdminUsuarios'
import AdminEventos from './pages/admin/AdminEventos'
import AdminEventoInscritos from './pages/admin/AdminEventoInscritos'
import AdminHorarios from './pages/admin/AdminHorarios'
import AdminAulas from './pages/admin/AdminAulas'
import AdminPonentes from './pages/admin/AdminPonentes'
import AdminAreas from './pages/admin/AdminAreas'

export default function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Ruta pública — inicio visible sin login (noTopPad: hero llena el viewport) */}
        <Route element={<Layout noTopPad />}>
          <Route index element={<Home />} />
        </Route>

        {/* Rutas del sitio (participantes) — requieren login */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="inscripciones" element={<Inscripciones />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="micronograma" element={<Cronograma />} />
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
          <Route path="eventos/:eventoId/inscritos" element={<AdminEventoInscritos />} />
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
