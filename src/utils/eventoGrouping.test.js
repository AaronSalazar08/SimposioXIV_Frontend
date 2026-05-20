import { describe, expect, it } from 'vitest'
import {
  etiquetaFranjaHoraria,
  groupEventosPorFranjaHoraria,
  ordenarEventosPlano,
} from './eventoGrouping'

const slot = (dia, inicio, fin, titulo, id) => ({
  id,
  titulo,
  horario: {
    numero_dia: dia,
    hora_inicio: inicio,
    hora_fin: fin,
  },
})

describe('groupEventosPorFranjaHoraria', () => {
  it('agrupa eventos con mismo día y franja horaria', () => {
    const eventos = [
      slot(1, '2026-06-01T10:00:00.000Z', '2026-06-01T11:00:00.000Z', 'Taller B', 2),
      slot(1, '2026-06-01T10:00:00.000Z', '2026-06-01T11:00:00.000Z', 'Taller A', 1),
      slot(2, '2026-06-02T14:00:00.000Z', '2026-06-02T15:00:00.000Z', 'Charla', 3),
    ]
    const grupos = groupEventosPorFranjaHoraria(eventos)
    expect(grupos).toHaveLength(2)
    expect(grupos[0].eventos).toHaveLength(2)
    expect(grupos[0].eventos.map((e) => e.titulo)).toEqual(['Taller A', 'Taller B'])
    expect(grupos[1].eventos).toHaveLength(1)
  })

  it('coloca eventos sin horario al final', () => {
    const eventos = [
      { id: 1, titulo: 'Sin agenda', horario: null },
      slot(1, '2026-06-01T10:00:00.000Z', '2026-06-01T11:00:00.000Z', 'Con horario', 2),
    ]
    const grupos = groupEventosPorFranjaHoraria(eventos)
    expect(grupos.at(-1).key).toBe('sin-horario')
    expect(grupos.at(-1).eventos[0].titulo).toBe('Sin agenda')
  })
})

describe('ordenarEventosPlano', () => {
  it('ordena por día, hora y título', () => {
    const eventos = [
      slot(2, '2026-06-02T14:00:00.000Z', '2026-06-02T15:00:00.000Z', 'Z', 3),
      slot(1, '2026-06-01T12:00:00.000Z', '2026-06-01T13:00:00.000Z', 'B', 2),
      slot(1, '2026-06-01T10:00:00.000Z', '2026-06-01T11:00:00.000Z', 'A', 1),
    ]
    const ordenados = ordenarEventosPlano(eventos)
    expect(ordenados.map((e) => e.id)).toEqual([1, 2, 3])
  })

  it('no muta el arreglo original', () => {
    const eventos = [slot(1, '2026-06-01T10:00:00.000Z', '2026-06-01T11:00:00.000Z', 'A', 1)]
    const copia = [...eventos]
    ordenarEventosPlano(eventos)
    expect(eventos).toEqual(copia)
  })
})

describe('etiquetaFranjaHoraria', () => {
  it('devuelve mensaje fijo sin horario', () => {
    expect(etiquetaFranjaHoraria({ hora_inicio: null })).toBe('Sin fecha u hora en agenda')
  })

  it('incluye día, fecha y rango horario', () => {
    const etiqueta = etiquetaFranjaHoraria({
      numero_dia: 1,
      dia: 1,
      hora_inicio: '2026-06-01T10:00:00.000Z',
      hora_fin: '2026-06-01T11:00:00.000Z',
    })
    expect(etiqueta).toMatch(/^Día 1 · /)
    expect(etiqueta).toMatch(/ – /)
  })
})
