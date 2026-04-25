import { useAuth } from '../context/useAuth'

export default function Perfil() {
  const { user, logout } = useAuth()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Cabecera */}
        <div className="bg-ucr-blue px-8 py-8 flex flex-col sm:flex-row items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white text-3xl font-bold shadow">
            {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-white text-2xl font-bold">{user?.name ?? '—'}</h1>
            <p className="text-blue-200 text-sm mt-0.5">{user?.email ?? '—'}</p>
          </div>
        </div>

        {/* Datos */}
        <div className="px-8 py-6">
          <h2 className="text-ucr-blue-dark font-semibold text-base mb-4">Información de la cuenta</h2>
          <dl className="divide-y divide-gray-100">
            {[
              { label: 'Nombre completo', value: user?.name },
              { label: 'Correo electrónico', value: user?.email },
            ].map(({ label, value }) => (
              <div key={label} className="py-3 flex flex-col sm:flex-row sm:gap-4">
                <dt className="text-sm font-medium text-gray-500 sm:w-40 flex-shrink-0">{label}</dt>
                <dd className="text-sm text-gray-900 mt-0.5 sm:mt-0">{value ?? '—'}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Acciones */}
        <div className="px-8 pb-8">
          <button
            onClick={logout}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors border border-red-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}
