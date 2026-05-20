import { describe, expect, it } from 'vitest'
import {
  buildInscripcionesPorEvento,
  countConfirmadas,
  filterConfirmadas,
  groupInscripcionesPorDia,
} from './inscripciones'

const inscripciones = [
  {
    id: 1,
    evento_id: 10,
    estado: 'confirmado',
    evento: {
      titulo: 'Charla B',
      horario: { numero_dia: 2, hora_inicio: '2026-06-02T14:00:00.000Z' },
    },
  },
  {
    id: 2,
    evento_id: 20,
    estado: 'confirmado',
    evento: {
      titulo: 'Charla A',
      horario: { numero_dia: 1, hora_inicio: '2026-06-01T10:00:00.000Z' },
    },
  },
  { id: 3, evento_id: 30, estado: 'cancelado', evento: { titulo: 'Cancelada' } },
  { id: 4, evento_id: 40, estado: 'confirmado', evento: null },
]

describe('filterConfirmadas', () => {
  it('solo incluye estado confirmado', () => {
    expect(filterConfirmadas(inscripciones)).toHaveLength(3)
    expect(filterConfirmadas(inscripciones).every((i) => i.estado === 'confirmado')).toBe(true)
  })
})

describe('countConfirmadas', () => {
  it('cuenta inscripciones confirmadas', () => {
    expect(countConfirmadas(inscripciones)).toBe(3)
  })
})

describe('buildInscripcionesPorEvento', () => {
  it('mapea evento_id a inscripción confirmada', () => {
    const map = buildInscripcionesPorEvento(inscripciones)
    expect(map.get(10)?.id).toBe(1)
    expect(map.get(20)?.id).toBe(2)
    expect(map.has(30)).toBe(false)
    expect(map.has(40)).toBe(true)
  })
})

describe('groupInscripcionesPorDia', () => {
  it('agrupa por día y ordena grupos e items por hora', () => {
    const grupos = groupInscripcionesPorDia(inscripciones)
    expect(grupos).toHaveLength(2)
    expect(grupos[0].dia).toBe(1)
    expect(grupos[1].dia).toBe(2)
    expect(grupos[0].items[0].evento.titulo).toBe('Charla A')
    expect(grupos[1].items[0].evento.titulo).toBe('Charla B')
  })

  it('ignora confirmadas sin evento', () => {
    const grupos = groupInscripcionesPorDia(inscripciones)
    const totalItems = grupos.reduce((n, g) => n + g.items.length, 0)
    expect(totalItems).toBe(2)
  })
})
