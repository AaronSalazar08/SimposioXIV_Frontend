import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createAdminAula,
  deleteAdminAula,
  fetchAdminAulas,
  updateAdminAula,
} from '../../api/admin'
import AdminModal from '../../components/admin/AdminModal'
import SearchInput from '../../components/admin/SearchInput'
import AlertMessage from '../../components/ui/AlertMessage'
import LoadingState from '../../components/ui/LoadingState'
import { INPUT_CLASS } from '../../constants/formStyles'
import { queryKeys } from '../../constants/queryKeys'
import { getApiErrorMessage } from '../../utils/apiErrors'
import { matchesQuery } from '../../utils/text'

const EMPTY_FORM = { numero: '', edificio: '', capacidad: '' }

export default function AdminAulas() {
  const qc = useQueryClient()
  const { data: aulas = [], isLoading } = useQuery({
    queryKey: queryKeys.adminAulas(),
    queryFn: fetchAdminAulas,
  })

  const [modal, setModal] = useState({ open: false, aula: null })
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [search, setSearch] = useState('')
  const aulasFiltradas = aulas.filter((a) => matchesQuery(search, a.numero, a.edificio))

  const openCrear = () => {
    setForm(EMPTY_FORM)
    setError('')
    setModal({ open: true, aula: null })
  }

  const openEditar = (aula) => {
    setForm({ numero: aula.numero, edificio: aula.edificio, capacidad: String(aula.capacidad) })
    setError('')
    setModal({ open: true, aula })
  }

  const closeModal = () => setModal({ open: false, aula: null })

  const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.adminAulas() })

  const saveMutation = useMutation({
    mutationFn: (data) =>
      modal.aula
        ? updateAdminAula(modal.aula.id, data)
        : createAdminAula(data),
    onSuccess: () => { invalidate(); closeModal() },
    onError: (err) => setError(getApiErrorMessage(err, 'No se pudo guardar el aula.')),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAdminAula,
    onSuccess: () => { invalidate(); setConfirmDelete(null) },
    onError: (err) => setError(getApiErrorMessage(err, 'No se pudo eliminar el aula.')),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    saveMutation.mutate({ ...form, capacidad: Number(form.capacidad) })
  }

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-xl font-bold text-ucr-blue-dark">Aulas</h1>
        <div className="flex items-center gap-2">
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar aula..." />
          <button
            type="button"
            onClick={openCrear}
            className="px-4 py-2 bg-ucr-blue hover:bg-ucr-blue-dark text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
          >
            + Nueva aula
          </button>
        </div>
      </div>

      <AlertMessage message={error} />

      {isLoading ? (
        <LoadingState message="Cargando aulas..." />
      ) : aulas.length === 0 ? (
        <p className="text-gray-500 text-sm">No hay aulas registradas.</p>
      ) : aulasFiltradas.length === 0 ? (
        <p className="text-gray-500 text-sm">No se encontraron aulas para "{search}".</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Número', 'Edificio', 'Capacidad', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {aulasFiltradas.map((aula) => (
                <tr key={aula.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{aula.numero}</td>
                  <td className="px-4 py-3 text-gray-600">{aula.edificio}</td>
                  <td className="px-4 py-3 text-gray-600">{aula.capacidad}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => openEditar(aula)}
                        className="text-ucr-blue hover:text-ucr-blue-dark text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-ucr-blue-muted transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(aula)}
                        className="text-rose-600 hover:text-rose-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal crear / editar */}
      <AdminModal
        open={modal.open}
        title={modal.aula ? 'Editar aula' : 'Nueva aula'}
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <AlertMessage message={error} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Número</label>
            <input className={INPUT_CLASS} value={form.numero} onChange={set('numero')} required placeholder="101" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Edificio</label>
            <input className={INPUT_CLASS} value={form.edificio} onChange={set('edificio')} required placeholder="ECCI" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Capacidad</label>
            <input className={INPUT_CLASS} type="number" min={1} value={form.capacidad} onChange={set('capacidad')} required placeholder="30" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={closeModal} className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saveMutation.isPending} className="flex-1 py-2.5 bg-ucr-blue hover:bg-ucr-blue-dark text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60">
              {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Confirmar eliminación */}
      <AdminModal
        open={!!confirmDelete}
        title="Eliminar aula"
        onClose={() => setConfirmDelete(null)}
      >
        <p className="text-gray-600 text-sm mb-5">
          ¿Eliminás el aula <strong>{confirmDelete?.numero}</strong> ({confirmDelete?.edificio})?
          Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => deleteMutation.mutate(confirmDelete.id)}
            disabled={deleteMutation.isPending}
            className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
          >
            {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </AdminModal>
    </div>
  )
}
