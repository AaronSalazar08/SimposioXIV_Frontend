import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Home from './pages/Home'
import Informacion from './pages/Informacion'
import Tematicas from './pages/Tematicas'
import Inscripciones from './pages/Inscripciones'
import Cronograma from './pages/Cronograma'
import Perfil from './pages/Perfil'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
