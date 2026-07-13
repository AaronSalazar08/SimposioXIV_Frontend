import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createAdminPonente,
  deleteAdminPonente,
  fetchAdminPonentes,
  updateAdminPonente,
} from '../../api/admin'
import AdminModal from '../../components/admin/AdminModal'
import SearchInput from '../../components/admin/SearchInput'
import AlertMessage from '../../components/ui/AlertMessage'
import LoadingState from '../../components/ui/LoadingState'
import { INPUT_CLASS } from '../../constants/formStyles'
import { queryKeys } from '../../constants/queryKeys'
import { getApiErrorMessage } from '../../utils/apiErrors'
import { matchesQuery } from '../../utils/text'

const EMPTY_FORM = { nombre: '', apellidos: '', educacion: '', grado_academico: '', descripcion: '' }

export default function AdminPonentes() {
  const qc = useQueryClient()
  const { data: ponentes = [], isLoading } = useQuery({
    queryKey: queryKeys.adminPonentes(),
    queryFn: fetchAdminPonentes,
  })

  const [modal, setModal] = useState({ open: false, ponente: null })
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [search, setSearch] = useState('')
  const ponentesFiltrados = ponentes.filter((p) => matchesQuery(search, p.nombre, p.apellidos, p.grado_academico, p.educacion))

  const openCrear = () => { setForm(EMPTY_FORM); setError(''); setModal({ open: true, ponente: null }) }
  const openEditar = (p) => {
    setForm({ nombre: p.nombre, apellidos: p.apellidos, educacion: p.educacion ?? '', grado_academico: p.grado_academico ?? '', descripcion: p.descripcion ?? '' })
    setError('')
    setModal({ open: true, ponente: p })
  }
  const closeModal = () => setModal({ open: false, ponente: null })
  const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.adminPonentes() })

  const saveMutation = useMutation({
    mutationFn: (data) => modal.ponente ? updateAdminPonente(modal.ponente.id, data) : createAdminPonente(data),
    onSuccess: () => { invalidate(); closeModal() },
    onError: (err) => setError(getApiErrorMessage(err, 'No se pudo guardar el ponente.')),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAdminPonente,
    onSuccess: () => { invalidate(); setConfirmDelete(null) },
    onError: (err) => setError(getApiErrorMessage(err, 'No se pudo eliminar el ponente.')),
  })

  const handleSubmit = (e) => { e.preventDefault(); setError(''); saveMutation.mutate(form) }
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-xl font-bold text-ucr-blue-dark">Ponentes</h1>
        <div className="flex items-center gap-2">
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar ponente..." />
          <button type="button" onClick={openCrear} className="px-4 py-2 bg-ucr-blue hover:bg-ucr-blue-dark text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap">
            + Nuevo ponente
          </button>
        </div>
      </div>

      <AlertMessage message={error} />

      {isLoading ? (
        <LoadingState message="Cargando ponentes..." />
      ) : ponentes.length === 0 ? (
        <p className="text-gray-500 text-sm">No hay ponentes registrados.</p>
      ) : ponentesFiltrados.length === 0 ? (
        <p className="text-gray-500 text-sm">No se encontraron ponentes para "{search}".</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Nombre', 'Grado académico', 'Educación', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ponentesFiltrados.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.nombre} {p.apellidos}</td>
                  <td className="px-4 py-3 text-gray-600">{p.grado_academico ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{p.educacion ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button type="button" onClick={() => openEditar(p)} className="text-ucr-blue hover:text-ucr-blue-dark text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-ucr-blue-muted transition-colors">Editar</button>
                      <button type="button" onClick={() => { setError(''); setConfirmDelete(p) }} className="text-rose-600 hover:text-rose-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminModal open={modal.open} title={modal.ponente ? 'Editar ponente' : 'Nuevo ponente'} onClose={closeModal}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <AlertMessage message={error} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre</label>
              <input className={INPUT_CLASS} value={form.nombre} onChange={set('nombre')} required placeholder="Juan" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Apellidos</label>
              <input className={INPUT_CLASS} value={form.apellidos} onChange={set('apellidos')} required placeholder="Pérez Mora" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Grado académico</label>
            <input className={INPUT_CLASS} value={form.grado_academico} onChange={set('grado_academico')} placeholder="Dr., M.Sc., Lic., ..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Educación</label>
            <textarea className={INPUT_CLASS} rows={2} value={form.educacion} onChange={set('educacion')} placeholder="Descripción de la formación académica..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
            <textarea className={INPUT_CLASS} rows={3} value={form.descripcion} onChange={set('descripcion')} placeholder="Breve descripción del ponente..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={closeModal} className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
            <button type="submit" disabled={saveMutation.isPending} className="flex-1 py-2.5 bg-ucr-blue hover:bg-ucr-blue-dark text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60">
              {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </AdminModal>

      <AdminModal open={!!confirmDelete} title="Eliminar ponente" onClose={() => setConfirmDelete(null)}>
        <AlertMessage message={error} />
        <p className="text-gray-600 text-sm mb-5">
          ¿Eliminás al ponente <strong>{confirmDelete?.nombre} {confirmDelete?.apellidos}</strong>? Esta acción no se puede deshacer.
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
