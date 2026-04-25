export default function Cronograma() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-ucr-blue rounded-full" />
          <h1 className="text-2xl font-bold text-ucr-blue-dark">Cronograma</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <svg className="w-16 h-16 mb-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-base">Cronograma disponible próximamente.</p>
          <p className="text-sm mt-1">Esta sección se conectará a la API cuando esté disponible.</p>
        </div>
      </div>
    </div>
  )
}
