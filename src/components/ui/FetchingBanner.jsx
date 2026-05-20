import Spinner from './Spinner'

export default function FetchingBanner({ message = 'Actualizando eventos...' }) {
  return (
    <div
      role="status"
      className="mb-4 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-ucr-blue/20 bg-ucr-blue-muted/60 text-sm text-ucr-blue-dark"
    >
      <Spinner size="sm" className="border-ucr-blue" />
      {message}
    </div>
  )
}
