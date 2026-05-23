import { describe, expect, it, vi } from 'vitest'
import {
  notifyUnauthorized,
  registerUnauthorizedHandler,
  shouldHandleUnauthorized,
} from './authSession'

describe('shouldHandleUnauthorized', () => {
  it('ignora 401 en login', () => {
    expect(
      shouldHandleUnauthorized({
        response: { status: 401 },
        config: { url: '/login' },
      }),
    ).toBe(false)
  })

  it('detecta 401 en otras rutas', () => {
    expect(
      shouldHandleUnauthorized({
        response: { status: 401 },
        config: { url: '/eventos' },
      }),
    ).toBe(true)
  })
})

describe('registerUnauthorizedHandler', () => {
  it('ejecuta el handler registrado', () => {
    const handler = vi.fn()
    const unregister = registerUnauthorizedHandler(handler)
    notifyUnauthorized()
    expect(handler).toHaveBeenCalledOnce()
    unregister()
    notifyUnauthorized()
    expect(handler).toHaveBeenCalledOnce()
  })
})
