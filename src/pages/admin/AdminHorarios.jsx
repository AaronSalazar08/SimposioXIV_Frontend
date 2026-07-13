import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createAdminHorario,
  deleteAdminHorario,
  fetchAdminAulas,
  fetchAdminHorarios,
  updateAdminHorario,
} from '../../api/admin'
import AdminModal from '../../components/admin/AdminModal'
import AlertMessage from '../../components/ui/AlertMessage'
import LoadingState from '../../components/ui/LoadingState'
import { INPUT_CLASS, SELECT_CLASS } from '../../constants/formStyles'
import { queryKeys } from '../../constants/queryKeys'
import { getApiErrorMessage } from '../../utils/apiErrors'

const EMPTY_FORM = { aula_id: '', numero_dia: '1', hora_inicio: '', hora_fin: '' }
const DIAS = [{ value: '1', label: 'Día 1' }, { value: '2', label: 'Día 2' }, { value: '3', label: 'Día 3' }]
const FILTRO_DIAS = [{ value: '', label: 'Todos los días' }, ...DIAS]

function formatHora(dt) {
  if (!dt) return '—'
  if (typeof dt === 'string' && dt.includes('T')) return dt.slice(11, 16)
  return dt
}

export default function AdminHorarios() {
  const qc = useQueryClient()
  const { data: horarios = [], isLoading } = useQuery({ queryKey: queryKeys.adminHorarios(), queryFn: fetchAdminHorarios })
  const { data: aulas = [] } = useQuery({ queryKey: queryKeys.adminAulas(), queryFn: fetchAdminAulas })

  const [modal, setModal] = useState({ open: false, horario: null })
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [filtroDia, setFiltroDia] = useState('')
  const horariosFiltrados = filtroDia ? horarios.filter((h) => String(h.numero_dia) === filtroDia) : horarios

  const openCrear = () => { setForm(EMPTY_FORM); setError(''); setModal({ open: true, horario: null }) }
  const openEditar = (h) => {
    setForm({ aula_id: String(h.aula?.id ?? h.aula_id ?? ''), numero_dia: String(h.numero_dia), hora_inicio: formatHora(h.hora_inicio), hora_fin: formatHora(h.hora_fin) })
    setError('')
    setModal({ open: true, horario: h })
  }
  const closeModal = () => setModal({ open: false, horario: null })
  const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.adminHorarios() })

  const saveMutation = useMutation({
    mutationFn: (data) => modal.horario ? updateAdminHorario(modal.horario.id, data) : createAdminHorario(data),
    onSuccess: () => { invalidate(); closeModal() },
    onError: (err) => setError(getApiErrorMessage(err, 'No se pudo guardar el horario.')),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAdminHorario,
    onSuccess: () => { invalidate(); setConfirmDelete(null) },
    onError: (err) => setError(getApiErrorMessage(err, 'No se pudo eliminar el horario.')),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    saveMutation.mutate({ ...form, aula_id: form.aula_id ? Number(form.aula_id) : null, numero_dia: Number(form.numero_dia) })
  }
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-xl font-bold text-ucr-blue-dark">Horarios</h1>
        <div className="flex items-center gap-2">
          <select className={`${SELECT_CLASS} w-auto`} value={filtroDia} onChange={(e) => setFiltroDia(e.target.value)}>
            {FILTRO_DIAS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
          <button type="button" onClick={openCrear} className="px-4 py-2 bg-ucr-blue hover:bg-ucr-blue-dark text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap">
            + Nuevo horario
          </button>
        </div>
      </div>

      <AlertMessage message={error} />

      {isLoading ? (
        <LoadingState message="Cargando horarios..." />
      ) : horarios.length === 0 ? (
        <p className="text-gray-500 text-sm">No hay horarios registrados.</p>
      ) : horariosFiltrados.length === 0 ? (
        <p className="text-gray-500 text-sm">No hay horarios para el día seleccionado.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Día', 'Inicio', 'Fin', 'Aula', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {horariosFiltrados.map((h) => (
                <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">Día {h.numero_dia}</td>
                  <td className="px-4 py-3 text-gray-600">{formatHora(h.hora_inicio)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatHora(h.hora_fin)}</td>
                  <td className="px-4 py-3 text-gray-500">{h.aula ? `${h.aula.numero} — ${h.aula.edificio}` : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button type="button" onClick={() => openEditar(h)} className="text-ucr-blue hover:text-ucr-blue-dark text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-ucr-blue-muted transition-colors">Editar</button>
                      <button type="button" onClick={() => { setError(''); setConfirmDelete(h) }} className="text-rose-600 hover:text-rose-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminModal open={modal.open} title={modal.horario ? 'Editar horario' : 'Nuevo horario'} onClose={closeModal}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <AlertMessage message={error} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Aula <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <select className={SELECT_CLASS} value={form.aula_id} onChange={set('aula_id')}>
              <option value="">Sin aula (actividad general: traslados, comidas, plenarias...)</option>
              {aulas.map((a) => <option key={a.id} value={a.id}>{a.numero} — {a.edificio}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Día del simposio</label>
            <select className={SELECT_CLASS} value={form.numero_dia} onChange={set('numero_dia')} required>
              {DIAS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Hora inicio</label>
              <input className={INPUT_CLASS} type="time" value={form.hora_inicio} onChange={set('hora_inicio')} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Hora fin</label>
              <input className={INPUT_CLASS} type="time" value={form.hora_fin} onChange={set('hora_fin')} required />
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

      <AdminModal open={!!confirmDelete} title="Eliminar horario" onClose={() => setConfirmDelete(null)}>
        <AlertMessage message={error} />
        <p className="text-gray-600 text-sm mb-5">
          ¿Eliminás el horario del <strong>Día {confirmDelete?.numero_dia}</strong> ({formatHora(confirmDelete?.hora_inicio)} – {formatHora(confirmDelete?.hora_fin)})? Esta acción no se puede deshacer.
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
