import { describe, expect, it } from 'vitest'
import { normalizeAuthUser } from './authNormalize'

describe('normalizeAuthUser', () => {
  it('devuelve null con payload inválido', () => {
    expect(normalizeAuthUser(null)).toBeNull()
    expect(normalizeAuthUser('texto')).toBeNull()
  })

  it('normaliza usuario con email y name en inglés', () => {
    const user = normalizeAuthUser({
      email: 'est@ucr.ac.cr',
      name: 'Ana Pérez',
      id: 1,
    })
    expect(user).toMatchObject({
      email: 'est@ucr.ac.cr',
      name: 'Ana Pérez',
      id: 1,
    })
  })

  it('normaliza correo y nombre en español', () => {
    const user = normalizeAuthUser({
      usuario: {
        correo: 'b12345@ucr.ac.cr',
        nombre: 'Juan',
        apellidos: 'Rodríguez',
      },
    })
    expect(user?.email).toBe('b12345@ucr.ac.cr')
    expect(user?.name).toBe('Juan Rodríguez')
  })

  it('desenvuelve data anidada', () => {
    const user = normalizeAuthUser({
      data: { user: { email: 'x@ucr.ac.cr', nombre_completo: 'María López' } },
    })
    expect(user?.email).toBe('x@ucr.ac.cr')
    expect(user?.name).toBe('María López')
  })

  it('prefiere nombre_completo sobre partes sueltas', () => {
    const user = normalizeAuthUser({
      nombre_completo: 'Nombre Completo',
      nombre: 'Otro',
      apellidos: 'Apellido',
    })
    expect(user?.name).toBe('Nombre Completo')
  })
})
