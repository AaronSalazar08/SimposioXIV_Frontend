export default function PageHeader({ title, badge, description, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-ucr-blue rounded-full" />
          <h1 className="text-2xl font-bold text-ucr-blue-dark">{title}</h1>
        </div>
        {badge != null && badge !== '' && (
          <div className="text-sm text-gray-600">{badge}</div>
        )}
      </div>
      {description && <p className="text-sm text-gray-600 mb-6">{description}</p>}
      {children}
    </div>
  )
}
