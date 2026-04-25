export default function Informacion() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-ucr-blue rounded-full" />
          <h1 className="text-2xl font-bold text-ucr-blue-dark">Información del Simposio</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <svg className="w-16 h-16 mb-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-base">Información del simposio disponible próximamente.</p>
          <p className="text-sm mt-1">Esta sección se conectará a la API cuando esté disponible.</p>
        </div>
      </div>
    </div>
  )
}
