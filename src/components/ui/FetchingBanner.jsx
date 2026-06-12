import Spinner from './Spinner'

export default function FetchingBanner({ message = 'Actualizando eventos...' }) {
  return (
    <div
      role="status"
      className="mb-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
      style={{
        background: 'rgba(0,93,164,0.06)',
        border: '1px solid rgba(0,93,164,0.15)',
        color: '#004A87',
      }}
    >
      <Spinner size="sm" className="border-ucr-blue" />
      {message}
    </div>
  )
}
