import apiClient from './client'

// ── Usuarios ─────────────────────────────────────────────────────────────────
export const fetchAdminUsuarios = () =>
  apiClient.get('/admin/usuarios').then((r) => r.data?.data ?? [])

export const createAdminUsuario = (data) =>
  apiClient.post('/admin/usuarios', data).then((r) => r.data)

export const updateAdminUsuario = (id, data) =>
  apiClient.put(`/admin/usuarios/${id}`, data).then((r) => r.data)

export const deleteAdminUsuario = (id) =>
  apiClient.delete(`/admin/usuarios/${id}`).then((r) => r.data)

export const generarPassword = () =>
  apiClient.get('/admin/passwords/generar').then((r) => r.data?.password ?? '')

export const enviarCorreoUsuario = (id) =>
  apiClient.post(`/admin/usuarios/${id}/enviar-correo`).then((r) => r.data)

export const enviarCorreoTodos = () =>
  apiClient.post('/admin/correos/todos').then((r) => r.data)

// ── Eventos ──────────────────────────────────────────────────────────────────
export const fetchAdminEventos = () =>
  apiClient.get('/admin/eventos').then((r) => r.data?.data ?? [])

export const createAdminEvento = (data) =>
  apiClient.post('/admin/eventos', data).then((r) => r.data)

export const updateAdminEvento = (id, data) =>
  apiClient.put(`/admin/eventos/${id}`, data).then((r) => r.data)

export const deleteAdminEvento = (id) =>
  apiClient.delete(`/admin/eventos/${id}`).then((r) => r.data)

// ── Horarios ─────────────────────────────────────────────────────────────────
export const fetchAdminHorarios = () =>
  apiClient.get('/admin/horarios').then((r) => r.data?.data ?? [])

export const createAdminHorario = (data) =>
  apiClient.post('/admin/horarios', data).then((r) => r.data)

export const updateAdminHorario = (id, data) =>
  apiClient.put(`/admin/horarios/${id}`, data).then((r) => r.data)

export const deleteAdminHorario = (id) =>
  apiClient.delete(`/admin/horarios/${id}`).then((r) => r.data)

// ── Aulas ─────────────────────────────────────────────────────────────────────
export const fetchAdminAulas = () =>
  apiClient.get('/admin/aulas').then((r) => r.data?.data ?? [])

export const createAdminAula = (data) =>
  apiClient.post('/admin/aulas', data).then((r) => r.data)

export const updateAdminAula = (id, data) =>
  apiClient.put(`/admin/aulas/${id}`, data).then((r) => r.data)

export const deleteAdminAula = (id) =>
  apiClient.delete(`/admin/aulas/${id}`).then((r) => r.data)

// ── Ponentes ──────────────────────────────────────────────────────────────────
export const fetchAdminPonentes = () =>
  apiClient.get('/admin/ponentes').then((r) => r.data?.data ?? [])

export const createAdminPonente = (data) =>
  apiClient.post('/admin/ponentes', data).then((r) => r.data)

export const updateAdminPonente = (id, data) =>
  apiClient.put(`/admin/ponentes/${id}`, data).then((r) => r.data)

export const deleteAdminPonente = (id) =>
  apiClient.delete(`/admin/ponentes/${id}`).then((r) => r.data)

// ── Áreas ─────────────────────────────────────────────────────────────────────
export const fetchAdminAreas = () =>
  apiClient.get('/admin/areas').then((r) => r.data?.data ?? [])

export const createAdminArea = (data) =>
  apiClient.post('/admin/areas', data).then((r) => r.data)

export const updateAdminArea = (id, data) =>
  apiClient.put(`/admin/areas/${id}`, data).then((r) => r.data)

export const deleteAdminArea = (id) =>
  apiClient.delete(`/admin/areas/${id}`).then((r) => r.data)
