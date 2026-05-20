export default function LoadingState({ message = 'Cargando...', className = 'py-16' }) {
  return (
    <div className={`flex flex-col items-center justify-center text-gray-500 ${className}`}>
      <span className="w-10 h-10 border-4 border-ucr-blue border-t-transparent rounded-full animate-spin mb-3" />
      {message ? <p className="text-sm">{message}</p> : null}
    </div>
  )
}
