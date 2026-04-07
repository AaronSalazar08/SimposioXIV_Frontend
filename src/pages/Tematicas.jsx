export default function Tematicas() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-ucr-blue rounded-full" />
          <h1 className="text-2xl font-bold text-ucr-blue-dark">Temáticas a Abordar</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <svg className="w-16 h-16 mb-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-base">Temáticas disponibles próximamente.</p>
          <p className="text-sm mt-1">Esta sección se conectará a la API cuando esté disponible.</p>
        </div>
      </div>
    </div>
  )
}
