function IconCalendar() {
  return (
    <svg className="w-12 h-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'rgba(0,93,164,0.2)' }}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function IconSearch() {
  return (
    <svg className="w-12 h-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'rgba(0,93,164,0.2)' }}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

const ICONS = { calendar: IconCalendar, search: IconSearch }

export default function EmptyState({ icon = 'search', title, description, action, className = 'p-12' }) {
  const Icon = ICONS[icon] ?? ICONS.search

  return (
    <div
      className={`bg-white rounded-2xl text-center text-gray-500 ${className}`}
      style={{ border: '1px solid rgba(0,93,164,0.08)', boxShadow: '0 1px 4px 0 rgba(0,0,0,0.04)' }}
    >
      <Icon />
      <p className="text-[15px] font-semibold text-gray-700 font-display">{title}</p>
      {description && (
        <p className="text-sm text-gray-500 mt-1.5 max-w-sm mx-auto leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
