import { describe, expect, it } from 'vitest'
import { buildEventosApiFilters } from './eventoFilters'

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
