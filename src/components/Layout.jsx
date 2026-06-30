import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import Navbar from './Navbar'
import { Outlet } from 'react-router-dom'

function AdminPreviewBanner() {
  const navigate = useNavigate()

  return (
    <div className="sticky top-0 z-[60] bg-amber-400 text-amber-900 px-4 py-2 flex items-center justify-between gap-3 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-medium">
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        Vista previa — estás viendo el sitio como lo ve un participante
      </div>
      <button
        type="button"
        onClick={() => navigate('/admin')}
        className="shrink-0 flex items-center gap-1.5 bg-amber-900 text-amber-50 text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-amber-800 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Volver al panel admin
      </button>
    </div>
  )
}

export default function Layout({ noTopPad = false }) {
  const { user } = useAuth()
  const isAdmin = user?.tipo_usuario === 'admin'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {isAdmin && <AdminPreviewBanner />}
      <Navbar />
      {/* noTopPad=true en Home: el hero llena el viewport y el nav fixed flota encima transparente.
          En el resto de páginas el offset empuja el contenido por debajo del nav. */}
      <main className="flex-1" style={{ paddingTop: noTopPad ? 0 : 96 }}>
        <Outlet />
      </main>
    </div>
  )
}
