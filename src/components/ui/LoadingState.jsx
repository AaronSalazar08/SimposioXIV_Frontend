export default function LoadingState({ message = 'Cargando...', className = 'py-16' }) {
  return (
    <div className={`flex flex-col items-center justify-center text-gray-500 ${className}`}>
      <div
        className="w-10 h-10 rounded-full border-[3px] border-t-transparent mb-4 animate-spin"
        style={{
          borderColor: 'rgba(0,93,164,0.15)',
          borderTopColor: '#005DA4',
        }}
      />
      {message ? (
        <p className="text-sm text-gray-500 font-medium">{message}</p>
      ) : null}
    </div>
  )
}
