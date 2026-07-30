import { describe, expect, it } from 'vitest'
import { buildEventosApiFilters, countPorDiaSimposio } from './eventoFilters'

describe('buildEventosApiFilters', () => {
  it('omite valores vacíos', () => {
    expect(buildEventosApiFilters({ dia: '', tipo: '', soloDisponibles: false })).toEqual({})
  })

  it('mapea filtros activos', () => {
    expect(
      buildEventosApiFilters({ dia: '2', tipo: 'taller', soloDisponibles: true }),
    ).toEqual({
      dia: '2',
      tipo: 'taller',
      solo_disponibles: true,
    })
  })
})

describe('countPorDiaSimposio', () => {
  it('agrupa por numero_dia 1–3', () => {
    const items = [
      { horario: { numero_dia: 1 } },
      { horario: { numero_dia: 3 } },
      { horario: { numero_dia: 3 } },
    ]
    expect(countPorDiaSimposio(items, (e) => e.horario?.numero_dia)).toEqual({
      1: 1,
      2: 0,
      3: 2,
    })
  })
})
