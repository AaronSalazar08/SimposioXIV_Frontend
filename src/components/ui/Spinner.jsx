export default function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-3 h-3 border-2',
    md: 'w-4 h-4 border-2',
    lg: 'w-10 h-10 border-4',
  }
  return (
    <span
      className={`${sizes[size] ?? sizes.md} border-current border-t-transparent rounded-full animate-spin ${className}`}
      aria-hidden
    />
  )
}
