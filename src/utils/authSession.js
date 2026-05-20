/** Callback registrado por AuthProvider para cerrar sesión sin recargar la página. */
let unauthorizedHandler = null

export function registerUnauthorizedHandler(handler) {
  unauthorizedHandler = handler
  return () => {
    if (unauthorizedHandler === handler) {
      unauthorizedHandler = null
    }
  }
}

export function notifyUnauthorized() {
  unauthorizedHandler?.()
}

/** No dispara logout global en intentos de login fallidos. */
export function shouldHandleUnauthorized(error) {
  if (error.response?.status !== 401) return false
  const url = String(error.config?.url ?? '')
  return !url.includes('/login')
}
