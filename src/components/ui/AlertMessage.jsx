const STYLES = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error: 'bg-rose-50 border-rose-200 text-rose-800',
}

export default function AlertMessage({ type = 'error', message, className = 'mb-4' }) {
  if (!message) return null

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={`px-4 py-3 rounded-lg border text-sm ${STYLES[type] ?? STYLES.error} ${className}`}
    >
      {message}
    </div>
  )
}
