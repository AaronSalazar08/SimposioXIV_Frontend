import { describe, expect, it } from 'vitest'
import { pluralize } from './pluralize'

describe('pluralize', () => {
  it('devuelve singular cuando count es 1', () => {
    expect(pluralize(1, 'evento')).toBe('evento')
  })

  it('devuelve plural por defecto (singular + s)', () => {
    expect(pluralize(0, 'evento')).toBe('eventos')
    expect(pluralize(2, 'evento')).toBe('eventos')
  })

  it('acepta plural explícito', () => {
    expect(pluralize(2, 'evento confirmado', 'eventos confirmados')).toBe('eventos confirmados')
  })
})
