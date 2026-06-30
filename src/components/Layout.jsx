import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import Navbar from './Navbar'
import { Outlet } from 'react-router-dom'

export const ADMIN_BANNER_H = 40

function AdminPreviewBanner() {
  const navigate = useNavigate()

  return (
    <div
      className="fixed left-0 right-0 z-[130] flex items-center justify-between gap-3 px-4"
      style={{ top: 0, height: ADMIN_BANNER_H, background: '#FBBF24', boxShadow: '0 1px 0 rgba(0,0,0,0.08)' }}
    >
      <div className="flex items-center gap-2 text-sm font-medium" style={{ color: '#78350F' }}>
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span>Vista previa — estás viendo el sitio como lo ve un participante</span>
      </div>
      <button
        type="button"
        onClick={() => navigate('/admin')}
        className="shrink-0 flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-lg transition-colors"
        style={{ background: '#92400E', color: '#FEF3C7' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#78350F' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#92400E' }}
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
  const bannerOffset = isAdmin ? ADMIN_BANNER_H : 0

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {isAdmin && <AdminPreviewBanner />}
      <Navbar bannerOffset={bannerOffset} />
      {/* noTopPad=true en Home: el hero llena el viewport y el nav fixed flota encima transparente.
          En el resto de páginas el offset empuja el contenido por debajo del nav + banner. */}
      <main className="flex-1" style={{ paddingTop: noTopPad ? bannerOffset : 96 + bannerOffset }}>
        <Outlet />
      </main>
    </div>
  )
}
