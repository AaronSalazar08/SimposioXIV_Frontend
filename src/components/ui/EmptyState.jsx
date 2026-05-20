function IconCalendar() {
  return (
    <svg className="w-14 h-14 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  )
}

function IconSearch() {
  return (
    <svg className="w-14 h-14 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1}
        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}

const ICONS = {
  calendar: IconCalendar,
  search: IconSearch,
}

export default function EmptyState({
  icon = 'search',
  title,
  description,
  action,
  className = 'p-12',
}) {
  const Icon = ICONS[icon] ?? ICONS.search

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 text-center text-gray-500 ${className}`}
    >
      <Icon />
      <p className="text-base font-medium">{title}</p>
      {description && <p className="text-sm mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
