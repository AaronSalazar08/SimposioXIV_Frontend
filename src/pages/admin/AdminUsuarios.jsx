import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createAdminUsuario,
  deleteAdminUsuario,
  enviarCorreoTodos,
  enviarCorreoUsuario,
  fetchAdminUsuarios,
  generarPassword,
  updateAdminUsuario,
} from '../../api/admin'
import AdminModal from '../../components/admin/AdminModal'
import SearchInput from '../../components/admin/SearchInput'
import AlertMessage from '../../components/ui/AlertMessage'
import LoadingState from '../../components/ui/LoadingState'
import Spinner from '../../components/ui/Spinner'
import { INPUT_CLASS, SELECT_CLASS } from '../../constants/formStyles'
import { queryKeys } from '../../constants/queryKeys'
import { getApiErrorMessage } from '../../utils/apiErrors'
import { matchesQuery } from '../../utils/text'

const EMPTY_FORM = { nombre: '', email: '', carnet: '', password: '', tipo_usuario: 'participante' }

const TIPO_BADGE = {
  admin: 'bg-ucr-blue text-white',
  participante: 'bg-gray-100 text-gray-600',
}

function EmailFeedbackBanner({ feedback, onClose }) {
  if (!feedback) return null
  const isSuccess = feedback.type === 'success'
  return (
    <div className={`mb-4 px-4 py-3 rounded-lg border text-sm flex items-start gap-3 ${
      isSuccess
        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
        : 'bg-rose-50 border-rose-200 text-rose-800'
    }`}>
      <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {isSuccess
          ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        }
      </svg>
      <p className="flex-1 font-medium">{feedback.message}</p>
      <button type="button" onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
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

  // Email states
  const [emailFeedback, setEmailFeedback] = useState(null)
  const [enviandoCorreoId, setEnviandoCorreoId] = useState(null)
  const [confirmEnviarTodos, setConfirmEnviarTodos] = useState(false)
  const [search, setSearch] = useState('')
  const usuariosFiltrados = usuarios.filter((u) => matchesQuery(search, u.nombre, u.email, u.carnet))

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

  const enviarCorreoMutation = useMutation({
    mutationFn: (id) => enviarCorreoUsuario(id),
    onMutate: (id) => setEnviandoCorreoId(id),
    onSuccess: (res) => {
      setEmailFeedback({ type: 'success', message: res.message ?? 'Correo enviado correctamente.' })
      invalidate()
    },
    onError: (err) => {
      setEmailFeedback({ type: 'error', message: getApiErrorMessage(err, 'No se pudo enviar el correo.') })
    },
    onSettled: () => setEnviandoCorreoId(null),
  })

  const enviarTodosMutation = useMutation({
    mutationFn: enviarCorreoTodos,
    onSuccess: (res) => {
      setEmailFeedback({ type: 'success', message: res.message ?? 'Correos enviados correctamente.' })
      setConfirmEnviarTodos(false)
      invalidate()
    },
    onError: (err) => {
      setEmailFeedback({ type: 'error', message: getApiErrorMessage(err, 'No se pudieron enviar los correos.') })
      setConfirmEnviarTodos(false)
    },
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

  const participantesCount = usuarios.filter((u) => u.tipo_usuario !== 'admin').length

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-xl font-bold text-ucr-blue-dark">Usuarios</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar usuario..." />
          <button
            type="button"
            onClick={() => { setEmailFeedback(null); setConfirmEnviarTodos(true) }}
            disabled={participantesCount === 0}
            className="flex items-center gap-1.5 px-3 py-2 border border-ucr-blue text-ucr-blue hover:bg-ucr-blue-muted text-sm font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Enviar a todos
          </button>
          <button type="button" onClick={openCrear} className="px-4 py-2 bg-ucr-blue hover:bg-ucr-blue-dark text-white text-sm font-semibold rounded-lg transition-colors">
            + Nuevo usuario
          </button>
        </div>
      </div>

      <AlertMessage message={error} />
      <EmailFeedbackBanner feedback={emailFeedback} onClose={() => setEmailFeedback(null)} />

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
      ) : usuariosFiltrados.length === 0 ? (
        <p className="text-gray-500 text-sm">No se encontraron usuarios para "{search}".</p>
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
              {usuariosFiltrados.map((u) => {
                const enviandoEste = enviandoCorreoId === u.id
                return (
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
                        {u.tipo_usuario !== 'admin' && (
                          <button
                            type="button"
                            onClick={() => { setEmailFeedback(null); enviarCorreoMutation.mutate(u.id) }}
                            disabled={enviandoEste || enviarTodosMutation.isPending}
                            className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {enviandoEste ? (
                              <><Spinner size="sm" className="border-emerald-500" />Enviando...</>
                            ) : (
                              <>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Enviar correo
                              </>
                            )}
                          </button>
                        )}
                        <button type="button" onClick={() => openEditar(u)} className="text-ucr-blue hover:text-ucr-blue-dark text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-ucr-blue-muted transition-colors">Editar</button>
                        <button type="button" onClick={() => { setError(''); setConfirmDelete(u) }} className="text-rose-600 hover:text-rose-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
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

      {/* Modal eliminar */}
      <AdminModal open={!!confirmDelete} title="Eliminar usuario" onClose={() => setConfirmDelete(null)}>
        <AlertMessage message={error} />
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

      {/* Modal confirmar enviar a todos */}
      <AdminModal
        open={confirmEnviarTodos}
        title="Enviar correo a todos los participantes"
        onClose={() => !enviarTodosMutation.isPending && setConfirmEnviarTodos(false)}
      >
        <div className="space-y-4">
          <p className="text-gray-600 text-sm leading-relaxed">
            Se enviará un correo de bienvenida a{' '}
            <strong className="text-ucr-blue-dark">{participantesCount} participante{participantesCount !== 1 ? 's' : ''}</strong>{' '}
            con sus credenciales de acceso al Simposio.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
            <strong>Importante:</strong> Se generará una nueva contraseña para cada usuario. Sus contraseñas actuales quedarán invalidadas.
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => setConfirmEnviarTodos(false)}
              disabled={enviarTodosMutation.isPending}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => enviarTodosMutation.mutate()}
              disabled={enviarTodosMutation.isPending}
              className="flex-1 py-2.5 bg-ucr-blue hover:bg-ucr-blue-dark text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {enviarTodosMutation.isPending ? (
                <><Spinner size="sm" />Enviando correos...</>
              ) : (
                'Confirmar envío'
              )}
            </button>
          </div>
        </div>
      </AdminModal>
    </div>
  )
}
