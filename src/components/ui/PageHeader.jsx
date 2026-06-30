export default function PageHeader({ title, badge, description, children }) {
  return (
    <div
      className="rounded-2xl overflow-hidden mb-6"
      style={{ boxShadow: '0 1px 4px 0 rgba(0,0,0,0.06)', border: '1px solid rgba(0,93,164,0.1)' }}
    >
      {/* Accent header stripe */}
      <div
        className="px-6 sm:px-8 py-5 sm:py-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #005DA4 0%, #004A87 60%, #003A6E 100%)' }}
      >
        {/* Background glow */}
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(33,187,239,0.15), transparent 65%)', transform: 'translate(25%, -35%)' }}
        />
        {/* Bottom accent line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px]"
          style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(33,187,239,0.5) 40%, rgba(33,187,239,0.7) 50%, rgba(33,187,239,0.5) 60%, transparent 100%)' }}
        />

        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-1 h-8 rounded-full"
              style={{ background: 'linear-gradient(180deg, #21BBEF, rgba(33,187,239,0.4))' }}
            />
            <h1 className="text-2xl font-bold text-white font-display" style={{ letterSpacing: '-0.02em' }}>
              {title}
            </h1>
          </div>
          {badge != null && badge !== '' && (
            <div
              className="text-sm font-medium px-3 py-1 rounded-full"
              style={{ background: 'rgba(33,187,239,0.18)', border: '1px solid rgba(33,187,239,0.35)', color: '#7DD3FC' }}
            >
              {badge}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      {(description || children) && (
        <div className="px-6 sm:px-8 py-5 bg-white">
          {description && (
            <p className="text-sm text-gray-600 leading-relaxed mb-5">{description}</p>
          )}
          {children}
        </div>
      )}
    </div>
  )
}
