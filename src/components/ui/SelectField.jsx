import { SELECT_CLASS } from '../../constants/formStyles'

export default function SelectField({
  label,
  htmlFor,
  value,
  onChange,
  disabled = false,
  children,
  className = '',
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="block text-xs font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        id={htmlFor}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={SELECT_CLASS}
      >
        {children}
      </select>
    </div>
  )
}
