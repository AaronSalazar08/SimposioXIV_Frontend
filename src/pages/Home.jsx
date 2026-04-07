import { useAuth } from '../context/useAuth'
import logoUcr from '../assets/logo_ucr.png'

export default function Home() {
  const { user } = useAuth()

  const cards = [
    {
      title: 'Información',
      description: 'Conoce los detalles generales del simposio, fechas y lugar del evento.',
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      href: '/informacion',
      color: 'bg-ucr-blue',
    },
    {
      title: 'Temáticas',
      description: 'Explora los temas y áreas de investigación que se abordarán en el simposio.',
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      href: '/tematicas',
      color: 'bg-ucr-blue-light',
    },
    {
      title: 'Inscripciones',
      description: 'Regístrate como participante o ponente para el simposio.',
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      href: '/inscripciones',
      color: 'bg-ucr-blue-dark',
    },
    {
      title: 'Cronograma',
      description: 'Consulta el programa completo de actividades y horarios del evento.',
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      href: '/cronograma',
      color: 'bg-ucr-blue-darker',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Bienvenida */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="bg-ucr-blue px-8 py-10 flex flex-col sm:flex-row items-center gap-6">
          <img src={logoUcr} alt="UCR" className="h-20 w-auto object-contain drop-shadow" />
          <div className="text-center sm:text-left">
            <h1 className="text-white text-2xl sm:text-3xl font-bold leading-tight">
              Bienvenido al Simposio UCR
            </h1>
            {user && (
              <p className="text-blue-200 text-sm mt-1">
                Hola, <span className="font-semibold text-white">{user.name}</span> — nos alegra tenerte aquí.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tarjetas de secciones */}
      <h2 className="text-ucr-blue-dark font-bold text-lg mb-5">Secciones del simposio</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map(({ title, description, icon, href, color }) => (
          <a
            key={title}
            href={href}
            className="group bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col"
          >
            <div className={`${color} p-5 flex items-center gap-3 text-white`}>
              {icon}
              <span className="font-semibold text-base">{title}</span>
            </div>
            <div className="p-4 flex-1">
              <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
            </div>
            <div className="px-4 pb-4">
              <span className="text-ucr-blue text-xs font-medium group-hover:underline">
                Ver más →
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
