import { describe, expect, it } from 'vitest'
import { isAccionEnCurso } from './accionInscripcion'

describe('isAccionEnCurso', () => {
  it('devuelve true cuando coincide evento y tipo', () => {
    const accion = { eventoId: 5, tipo: 'inscribir' }
    expect(isAccionEnCurso(accion, 5, 'inscribir')).toBe(true)
  })

  it('devuelve false si el tipo no coincide', () => {
    const accion = { eventoId: 5, tipo: 'cancelar' }
    expect(isAccionEnCurso(accion, 5, 'inscribir')).toBe(false)
  })
})
