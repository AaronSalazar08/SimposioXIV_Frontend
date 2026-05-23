import { describe, expect, it } from 'vitest'
import { getApiErrorMessage } from './apiErrors'

describe('getApiErrorMessage', () => {
  it('prioriza error de validación evento_id', () => {
    const err = {
      response: {
        data: {
          message: 'Error genérico',
          errors: { evento_id: ['Ya estás inscrito a este evento.'] },
        },
      },
    }
    expect(getApiErrorMessage(err, 'fallback')).toBe('Ya estás inscrito a este evento.')
  })

  it('usa message del backend', () => {
    const err = { response: { data: { message: 'Cupos agotados' } } }
    expect(getApiErrorMessage(err, 'fallback')).toBe('Cupos agotados')
  })

  it('usa error del backend cuando no hay message', () => {
    const err = { response: { data: { error: 'Unauthorized' } } }
    expect(getApiErrorMessage(err, 'fallback')).toBe('Unauthorized')
  })

  it('usa err.message si no hay response', () => {
    expect(getApiErrorMessage(new Error('Network Error'), 'fallback')).toBe('Network Error')
  })

  it('devuelve fallback por defecto', () => {
    expect(getApiErrorMessage({}, 'Algo falló')).toBe('Algo falló')
    expect(getApiErrorMessage(null)).toBe('Ocurrió un error.')
  })
})
