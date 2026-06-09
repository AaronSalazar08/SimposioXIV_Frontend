import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createAdminUsuario,
  deleteAdminUsuario,
  fetchAdminUsuarios,
  generarPassword,
  updateAdminUsuario,
} from '../../api/admin'
import AdminModal from '../../components/admin/AdminModal'
import AlertMessage from '../../components/ui/AlertMessage'
import LoadingState from '../../components/ui/LoadingState'
import { INPUT_CLASS, SELECT_CLASS } from '../../constants/formStyles'
import { queryKeys } from '../../constants/queryKeys'
import { getApiErrorMessage } from '../../utils/apiErrors'

const EMPTY_FORM = { nombre: '', email: '', carnet: '', password: '', tipo_usuario: 'participante' }

const TIPO_BADGE = {
  admin: 'bg-ucr-blue text-white',
  participante: 'bg-gray-100 text-gray-600',
}

export default function AdminUsuarios() {
  const qc = useQueryClient()
  const { data: usuarios = [], isLoading } = useQuery({
    queryKey: queryKeys.adminUsuarios(),
    queryFn: fetchAdminUsuarios,
  })

  const [modal, setModal] = useState({ open: false, usuario: null })
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [createdPassword, setCreatedPassword] = useState(null)
  const [showPassword, setShowPassword] = useState(false)

  const openCrear = () => { setForm(EMPTY_FORM); setError(''); setModal({ open: true, usuario: null }) }
  const openEditar = (u) => {
    setForm({ nombre: u.nombre, email: u.email, carnet: u.carnet ?? '', password: '', tipo_usuario: u.tipo_usuario ?? 'participante' })
    setError('')
    setModal({ open: true, usuario: u })
  }
  const closeModal = () => { setModal({ open: false, usuario: null }); setShowPassword(false) }
  const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.adminUsuarios() })

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const payload = { ...data }
      if (!payload.carnet) delete payload.carnet
      if (!payload.password) delete payload.password
      return modal.usuario
        ? updateAdminUsuario(modal.usuario.id, payload)
        : createAdminUsuario(payload)
    },
    onSuccess: (res) => {
      invalidate()
      if (!modal.usuario && res.password_generada) {
        setCreatedPassword(res.password_generada)
      }
      closeModal()
    },
    onError: (err) => setError(getApiErrorMessage(err, 'No se pudo guardar el usuario.')),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAdminUsuario,
    onSuccess: () => { invalidate(); setConfirmDelete(null) },
    onError: (err) => setError(getApiErrorMessage(err, 'No se pudo eliminar el usuario.')),
  })

  const handleGenerarPassword = async () => {
    try {
      const pwd = await generarPassword()
      setForm((f) => ({ ...f, password: pwd }))
    } catch {
      // ignorar
    }
  }

  const handleSubmit = (e) => { e.preventDefault(); setError(''); saveMutation.mutate(form) }
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-ucr-blue-dark">Usuarios</h1>
        <button type="button" onClick={openCrear} className="px-4 py-2 bg-ucr-blue hover:bg-ucr-blue-dark text-white text-sm font-semibold rounded-lg transition-colors">
          + Nuevo usuario
        </button>
      </div>

      <AlertMessage message={error} />

      {/* Contraseña generada tras crear usuario */}
      {createdPassword && (
        <div className="mb-4 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800 flex items-start gap-3">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="font-semibold mb-1">Usuario creado. Contraseña generada (cópiela ahora):</p>
            <div className="flex items-center gap-2 font-mono bg-white border border-emerald-200 rounded-lg px-3 py-1.5 text-emerald-900 text-sm w-fit">
              {createdPassword}
              <button
                type="button"
                onClick={() => { navigator.clipboard.writeText(createdPassword); setCreatedPassword(null) }}
                className="text-emerald-600 hover:text-emerald-800 transition-colors ml-1"
                title="Copiar y cerrar"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
          <button type="button" onClick={() => setCreatedPassword(null)} className="text-emerald-500 hover:text-emerald-700 shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {isLoading ? (
        <LoadingState message="Cargando usuarios..." />
      ) : usuarios.length === 0 ? (
        <p className="text-gray-500 text-sm">No hay usuarios registrados.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Nombre', 'Correo', 'Carnet', 'Tipo', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.nombre}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3 text-gray-500">{u.carnet ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${TIPO_BADGE[u.tipo_usuario] ?? TIPO_BADGE.participante}`}>
                      {u.tipo_usuario === 'admin' ? 'Admin' : 'Participante'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button type="button" onClick={() => openEditar(u)} className="text-ucr-blue hover:text-ucr-blue-dark text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-ucr-blue-muted transition-colors">Editar</button>
                      <button type="button" onClick={() => setConfirmDelete(u)} className="text-rose-600 hover:text-rose-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal crear / editar */}
      <AdminModal open={modal.open} title={modal.usuario ? 'Editar usuario' : 'Nuevo usuario'} onClose={closeModal}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <AlertMessage message={error} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre completo</label>
            <input className={INPUT_CLASS} value={form.nombre} onChange={set('nombre')} required placeholder="Juan Pérez Mora" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo electrónico</label>
            <input className={INPUT_CLASS} type="email" value={form.email} onChange={set('email')} required placeholder="usuario@ucr.ac.cr" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Carnet <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input className={INPUT_CLASS} value={form.carnet} onChange={set('carnet')} placeholder="B12345" maxLength={6} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Contraseña{modal.usuario && <span className="text-gray-400 font-normal"> (dejá vacío para no cambiar)</span>}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  className={INPUT_CLASS}
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder={modal.usuario ? '••••••••' : 'Vacío = generar automáticamente'}
                  required={!modal.usuario}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
              <button
                type="button"
                onClick={handleGenerarPassword}
                className="px-3 py-2 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                title="Generar contraseña aleatoria"
              >
                Generar
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo de usuario</label>
            <select className={SELECT_CLASS} value={form.tipo_usuario} onChange={set('tipo_usuario')}>
              <option value="participante">Participante</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={closeModal} className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
            <button type="submit" disabled={saveMutation.isPending} className="flex-1 py-2.5 bg-ucr-blue hover:bg-ucr-blue-dark text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60">
              {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </AdminModal>

      <AdminModal open={!!confirmDelete} title="Eliminar usuario" onClose={() => setConfirmDelete(null)}>
        <p className="text-gray-600 text-sm mb-5">
          ¿Eliminás al usuario <strong>{confirmDelete?.nombre}</strong> ({confirmDelete?.email})?
          Se revocarán todos sus tokens. Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
          <button type="button" onClick={() => deleteMutation.mutate(confirmDelete.id)} disabled={deleteMutation.isPending} className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60">
            {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </AdminModal>
    </div>
  )
}
