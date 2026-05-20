import { describe, expect, it } from 'vitest'
import { patchEventoTrasInscripcion } from './eventoCupos'

const evento = {
  id: 1,
  cupos_disponibles: 5,
  numero_inscritos: 10,
  tiene_capacidad_disponible: true,
  usuario_inscrito: false,
}

describe('patchEventoTrasInscripcion', () => {
  it('resta un cupo al inscribir (delta negativo)', () => {
    const r = patchEventoTrasInscripcion(evento, -1)
    expect(r.cupos_disponibles).toBe(4)
    expect(r.numero_inscritos).toBe(11)
    expect(r.usuario_inscrito).toBe(true)
    expect(r.tiene_capacidad_disponible).toBe(true)
  })

  it('suma un cupo al cancelar (delta positivo)', () => {
    const inscrito = { ...evento, cupos_disponibles: 0, usuario_inscrito: true }
    const r = patchEventoTrasInscripcion(inscrito, 1)
    expect(r.cupos_disponibles).toBe(1)
    expect(r.numero_inscritos).toBe(9)
    expect(r.usuario_inscrito).toBe(false)
  })

  it('no deja cupos negativos', () => {
    const r = patchEventoTrasInscripcion({ ...evento, cupos_disponibles: 0 }, -1)
    expect(r.cupos_disponibles).toBe(0)
    expect(r.tiene_capacidad_disponible).toBe(false)
  })
})
