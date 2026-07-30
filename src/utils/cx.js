/** Joins class names, filtering out falsy values. Minimal clsx-style helper. */
export function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}
