import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createAdminArea,
  deleteAdminArea,
  fetchAdminAreas,
  updateAdminArea,
} from '../../api/admin'
import AdminModal from '../../components/admin/AdminModal'
import AlertMessage from '../../components/ui/AlertMessage'
import LoadingState from '../../components/ui/LoadingState'
import { INPUT_CLASS } from '../../constants/formStyles'
import { queryKeys } from '../../constants/queryKeys'
import { getApiErrorMessage } from '../../utils/apiErrors'

const EMPTY_FORM = { nombre: '', descripcion: '', color: '#3b82f6' }

export default function AdminAreas() {
  const qc = useQueryClient()
  const { data: areas = [], isLoading } = useQuery({
    queryKey: queryKeys.adminAreas(),
    queryFn: fetchAdminAreas,
  })

  const [modal, setModal] = useState({ open: false, area: null })
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const openCrear = () => { setForm(EMPTY_FORM); setError(''); setModal({ open: true, area: null }) }
  const openEditar = (area) => {
    setForm({ nombre: area.nombre, descripcion: area.descripcion ?? '', color: area.color ?? '#3b82f6' })
    setError('')
    setModal({ open: true, area })
  }
  const closeModal = () => setModal({ open: false, area: null })
  const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.adminAreas() })

  const saveMutation = useMutation({
    mutationFn: (data) => modal.area ? updateAdminArea(modal.area.id, data) : createAdminArea(data),
    onSuccess: () => { invalidate(); closeModal() },
    onError: (err) => setError(getApiErrorMessage(err, 'No se pudo guardar el área.')),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAdminArea,
    onSuccess: () => { invalidate(); setConfirmDelete(null) },
    onError: (err) => setError(getApiErrorMessage(err, 'No se pudo eliminar el área.')),
  })

  const handleSubmit = (e) => { e.preventDefault(); setError(''); saveMutation.mutate(form) }
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-ucr-blue-dark">Áreas temáticas</h1>
        <button type="button" onClick={openCrear} className="px-4 py-2 bg-ucr-blue hover:bg-ucr-blue-dark text-white text-sm font-semibold rounded-lg transition-colors">
          + Nueva área
        </button>
      </div>

      <AlertMessage message={error} />

      {isLoading ? (
        <LoadingState message="Cargando áreas..." />
      ) : areas.length === 0 ? (
        <p className="text-gray-500 text-sm">No hay áreas registradas.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Color', 'Nombre', 'Descripción', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {areas.map((area) => (
                <tr key={area.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="inline-block w-5 h-5 rounded-full border border-gray-200" style={{ backgroundColor: area.color ?? '#6b7280' }} />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{area.nombre}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{area.descripcion ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button type="button" onClick={() => openEditar(area)} className="text-ucr-blue hover:text-ucr-blue-dark text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-ucr-blue-muted transition-colors">Editar</button>
                      <button type="button" onClick={() => setConfirmDelete(area)} className="text-rose-600 hover:text-rose-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminModal open={modal.open} title={modal.area ? 'Editar área' : 'Nueva área'} onClose={closeModal}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <AlertMessage message={error} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre</label>
            <input className={INPUT_CLASS} value={form.nombre} onChange={set('nombre')} required placeholder="Ingeniería de Software" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
            <textarea className={INPUT_CLASS} rows={3} value={form.descripcion} onChange={set('descripcion')} placeholder="Descripción del área..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.color} onChange={set('color')} className="h-10 w-16 rounded-lg border border-gray-200 cursor-pointer p-1" />
              <input className={`${INPUT_CLASS} flex-1`} value={form.color} onChange={set('color')} placeholder="#3b82f6" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={closeModal} className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
            <button type="submit" disabled={saveMutation.isPending} className="flex-1 py-2.5 bg-ucr-blue hover:bg-ucr-blue-dark text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60">
              {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </AdminModal>

      <AdminModal open={!!confirmDelete} title="Eliminar área" onClose={() => setConfirmDelete(null)}>
        <p className="text-gray-600 text-sm mb-5">
          ¿Eliminás el área <strong>{confirmDelete?.nombre}</strong>? Esta acción no se puede deshacer.
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
