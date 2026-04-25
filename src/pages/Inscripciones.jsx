export default function Inscripciones() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-ucr-blue rounded-full" />
          <h1 className="text-2xl font-bold text-ucr-blue-dark">Inscripciones</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <svg className="w-16 h-16 mb-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <p className="text-base">Sistema de inscripciones disponible próximamente.</p>
          <p className="text-sm mt-1">Esta sección se conectará a la API cuando esté disponible.</p>
        </div>
      </div>
    </div>
  )
}
