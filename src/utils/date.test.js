import { describe, expect, it } from 'vitest'
import { formatFecha, formatFechaConAnio, formatHora } from './date'

const ISO = '2026-06-01T15:30:00.000Z'

describe('formatHora', () => {
  it('devuelve cadena vacía sin entrada', () => {
    expect(formatHora(null)).toBe('')
    expect(formatHora('')).toBe('')
  })

  it('devuelve hora en formato 24h', () => {
    const result = formatHora(ISO)
    expect(result).toMatch(/^\d{1,2}:\d{2}$/)
  })
})

describe('formatFecha', () => {
  it('devuelve cadena vacía sin entrada', () => {
    expect(formatFecha(undefined)).toBe('')
  })

  it('devuelve texto localizado no vacío', () => {
    const result = formatFecha(ISO)
    expect(result.length).toBeGreaterThan(0)
    expect(result).not.toMatch(/\d{4}/)
  })
})

describe('formatFechaConAnio', () => {
  it('incluye el año en el resultado', () => {
    const result = formatFechaConAnio(ISO)
    expect(result).toMatch(/2026/)
  })
})
