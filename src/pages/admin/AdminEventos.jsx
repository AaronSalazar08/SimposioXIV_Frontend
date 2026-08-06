import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  createAdminEvento,
  deleteAdminEvento,
  fetchAdminAreas,
  fetchAdminEventos,
  fetchAdminHorarios,
  fetchAdminPonentes,
  updateAdminEvento,
} from '../../api/admin'
import AdminModal from '../../components/admin/AdminModal'
import SearchInput from '../../components/admin/SearchInput'
import AlertMessage from '../../components/ui/AlertMessage'
import LoadingState from '../../components/ui/LoadingState'
import { INPUT_CLASS, SELECT_CLASS } from '../../constants/formStyles'
import { queryKeys } from '../../constants/queryKeys'
import { TIPO_LABELS, TIPO_COLORS, TIPO_COLOR_DEFAULT } from '../../constants/eventos'
import { useAuth } from '../../context/useAuth'
import { getApiErrorMessage } from '../../utils/apiErrors'
import { matchesQuery } from '../../utils/text'

const TIPOS = [
  { value: 'apertura', label: 'Apertura' },
  { value: 'clausura', label: 'Clausura' },
  { value: 'taller', label: 'Taller' },
  { value: 'charla', label: 'Charla' },
]

const EMPTY_FORM = {
  titulo: '',
  descripcion: '',
  tipo: 'charla',
  capacidad: '',
  esta_activo: true,
  horario_id: '',
  ponente_ids: [],
  area_ids: [],
}

function formatHora(dt) {
  if (!dt) return ''
  if (typeof dt === 'string' && dt.includes('T')) return dt.slice(11, 16)
  return dt
}

function nombreCompletoPonente(p) {
  return p.nombre_completo ?? `${p.nombre} ${p.apellidos}`.trim()
}

export default function AdminEventos() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isStaff = user?.tipo_usuario === 'staff'

  const { data: eventos = [], isLoading } = useQuery({ queryKey: queryKeys.adminEventos(), queryFn: fetchAdminEventos })
  const { data: horarios = [] } = useQuery({ queryKey: queryKeys.adminHorarios(), queryFn: fetchAdminHorarios, enabled: !isStaff })
  const { data: ponentes = [] } = useQuery({ queryKey: queryKeys.adminPonentes(), queryFn: fetchAdminPonentes, enabled: !isStaff })
  const { data: areas = [] } = useQuery({ queryKey: queryKeys.adminAreas(), queryFn: fetchAdminAreas, enabled: !isStaff })

  const [modal, setModal] = useState({ open: false, evento: null })
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [search, setSearch] = useState('')
  const [ponenteSearch, setPonenteSearch] = useState('')
  const [verPonentes, setVerPonentes] = useState(null)

  const eventosFiltrados = eventos.filter((ev) => matchesQuery(search, ev.titulo, TIPO_LABELS[ev.tipo]))
  const ponentesVisibles = ponentes.filter(
    (p) => form.ponente_ids.includes(p.id) || matchesQuery(ponenteSearch, p.nombre, p.apellidos)
  )

  const openCrear = () => { setForm(EMPTY_FORM); setError(''); setPonenteSearch(''); setModal({ open: true, evento: null }) }
  const openEditar = (ev) => {
    setForm({
      titulo: ev.titulo,
      descripcion: ev.descripcion ?? '',
      tipo: ev.tipo,
      capacidad: String(ev.capacidad),
      esta_activo: ev.esta_activo,
      horario_id: String(ev.horario?.id ?? ev.horario_id ?? ''),
      ponente_ids: (ev.ponentes ?? []).map((p) => p.id),
      area_ids: (ev.areas ?? []).map((a) => a.id),
    })
    setError('')
    setPonenteSearch('')
    setModal({ open: true, evento: ev })
  }
  const closeModal = () => setModal({ open: false, evento: null })
  const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.adminEventos() })

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        ...data,
        capacidad: Number(data.capacidad),
        horario_id: data.horario_id ? Number(data.horario_id) : undefined,
      }
      return modal.evento
        ? updateAdminEvento(modal.evento.id, payload)
        : createAdminEvento(payload)
    },
    onSuccess: () => { invalidate(); closeModal() },
    onError: (err) => setError(getApiErrorMessage(err, 'No se pudo guardar el evento.')),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAdminEvento,
    onSuccess: () => { invalidate(); setConfirmDelete(null) },
    onError: (err) => setError(getApiErrorMessage(err, 'No se pudo eliminar el evento.')),
  })

  const handleSubmit = (e) => { e.preventDefault(); setError(''); saveMutation.mutate(form) }
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  const setCheck = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.checked }))

  const toggleArea = (id) =>
    setForm((f) => ({
      ...f,
      area_ids: f.area_ids.includes(id)
        ? f.area_ids.filter((a) => a !== id)
        : [...f.area_ids, id],
    }))

  const togglePonente = (id) =>
    setForm((f) => ({
      ...f,
      ponente_ids: f.ponente_ids.includes(id)
        ? f.ponente_ids.filter((p) => p !== id)
        : [...f.ponente_ids, id],
    }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-xl font-bold text-ucr-blue-dark">Eventos</h1>
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar evento..." />
          {!isStaff && (
            <button type="button" onClick={openCrear} className="px-4 py-2 bg-ucr-blue hover:bg-ucr-blue-dark text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap">
              + Nuevo evento
            </button>
          )}
        </div>
      </div>

      <AlertMessage message={error} />

      {isLoading ? (
        <LoadingState message="Cargando eventos..." />
      ) : eventos.length === 0 ? (
        <p className="text-gray-500 text-sm">No hay eventos registrados.</p>
      ) : eventosFiltrados.length === 0 ? (
        <p className="text-gray-500 text-sm">No se encontraron eventos para "{search}".</p>
      ) : (
        <>
          {/* Móvil: tarjetas apiladas */}
          <div className="sm:hidden space-y-3">
            {eventosFiltrados.map((ev) => (
              <div key={ev.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${TIPO_COLORS[ev.tipo] ?? TIPO_COLOR_DEFAULT}`}>
                      {TIPO_LABELS[ev.tipo] ?? ev.tipo}
                    </span>
                    <p className="font-medium text-gray-900 mt-1.5 truncate">{ev.titulo}</p>
                  </div>
                  <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${ev.esta_activo ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {ev.esta_activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <div className="mt-2 space-y-1 text-xs text-gray-500">
                  <p>
                    {ev.horario
                      ? `Día ${ev.horario.numero_dia} · ${formatHora(ev.horario.hora_inicio)}–${formatHora(ev.horario.hora_fin)}`
                      : 'Sin horario asignado'}
                  </p>
                  <p>Cupos: {ev.numero_inscritos ?? 0} / {ev.capacidad}</p>
                  <p>
                    {(ev.ponentes ?? []).length === 0 ? (
                      <span className="text-gray-400">Sin ponentes</span>
                    ) : ev.ponentes.length === 1 ? (
                      nombreCompletoPonente(ev.ponentes[0])
                    ) : (
                      <button
                        type="button"
                        onClick={() => setVerPonentes(ev)}
                        className="text-ucr-blue hover:text-ucr-blue-dark font-medium"
                      >
                        Ver ponentes ({ev.ponentes.length})
                      </button>
                    )}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/eventos/${ev.id}/inscritos`)}
                    className="text-ucr-blue hover:text-ucr-blue-dark text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-ucr-blue-muted transition-colors"
                  >
                    Ver inscritos
                  </button>
                  {!isStaff && (
                    <>
                      <button type="button" onClick={() => openEditar(ev)} className="text-ucr-blue hover:text-ucr-blue-dark text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-ucr-blue-muted transition-colors">Editar</button>
                      <button type="button" onClick={() => { setError(''); setConfirmDelete(ev) }} className="text-rose-600 hover:text-rose-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors">Eliminar</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Escritorio: tabla */}
          <div className="hidden sm:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {(isStaff
                      ? ['Tipo', 'Título', 'Ponente(s)', 'Horario', 'Cupos', 'Estado', 'Inscritos']
                      : ['Tipo', 'Título', 'Ponente(s)', 'Horario', 'Cupos', 'Estado', 'Inscritos', '']
                    ).map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {eventosFiltrados.map((ev) => (
                    <tr key={ev.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${TIPO_COLORS[ev.tipo] ?? TIPO_COLOR_DEFAULT}`}>
                          {TIPO_LABELS[ev.tipo] ?? ev.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{ev.titulo}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs max-w-[180px]">
                        {(ev.ponentes ?? []).length === 0 ? (
                          <span className="text-gray-400">—</span>
                        ) : ev.ponentes.length === 1 ? (
                          <span className="truncate block">{nombreCompletoPonente(ev.ponentes[0])}</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setVerPonentes(ev)}
                            className="text-ucr-blue hover:text-ucr-blue-dark font-medium px-2 py-1 -mx-2 rounded-lg hover:bg-ucr-blue-muted transition-colors whitespace-nowrap"
                          >
                            Ver ponentes ({ev.ponentes.length})
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {ev.horario
                          ? `Día ${ev.horario.numero_dia} · ${formatHora(ev.horario.hora_inicio)}–${formatHora(ev.horario.hora_fin)}`
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{ev.numero_inscritos ?? 0} / {ev.capacidad}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${ev.esta_activo ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                          {ev.esta_activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/eventos/${ev.id}/inscritos`)}
                          className="text-ucr-blue hover:text-ucr-blue-dark text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-ucr-blue-muted transition-colors"
                        >
                          Ver inscritos
                        </button>
                      </td>
                      {!isStaff && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 justify-end">
                            <button type="button" onClick={() => openEditar(ev)} className="text-ucr-blue hover:text-ucr-blue-dark text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-ucr-blue-muted transition-colors">Editar</button>
                            <button type="button" onClick={() => { setError(''); setConfirmDelete(ev) }} className="text-rose-600 hover:text-rose-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors">Eliminar</button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <AdminModal open={modal.open} title={modal.evento ? 'Editar evento' : 'Nuevo evento'} onClose={closeModal}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <AlertMessage message={error} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Título</label>
            <input className={INPUT_CLASS} value={form.titulo} onChange={set('titulo')} required placeholder="Título del evento" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
            <textarea className={INPUT_CLASS} rows={3} value={form.descripcion} onChange={set('descripcion')} placeholder="Descripción del evento..." />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo</label>
              <select className={SELECT_CLASS} value={form.tipo} onChange={set('tipo')} required>
                {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Capacidad</label>
              <input className={INPUT_CLASS} type="number" min={1} value={form.capacidad} onChange={set('capacidad')} required placeholder="30" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Horario</label>
            <select className={SELECT_CLASS} value={form.horario_id} onChange={set('horario_id')} required>
              <option value="">Seleccioná un horario...</option>
              {horarios.map((h) => (
                <option key={h.id} value={h.id}>
                  Día {h.numero_dia} · {formatHora(h.hora_inicio)}–{formatHora(h.hora_fin)} — {h.aula ? `Aula ${h.aula.numero}, ${h.aula.edificio}` : 'Sin aula (actividad general)'}
                </option>
              ))}
            </select>
          </div>
          {ponentes.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ponentes <span className="text-gray-400 font-normal">(opcional, múltiple)</span>
                {form.ponente_ids.length > 0 && (
                  <span className="ml-1.5 text-ucr-blue font-normal">· {form.ponente_ids.length} seleccionado{form.ponente_ids.length !== 1 ? 's' : ''}</span>
                )}
              </label>
              <SearchInput value={ponenteSearch} onChange={setPonenteSearch} placeholder="Buscar ponente por nombre..." className="w-full mb-2.5" />
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {ponentesVisibles.length === 0 ? (
                  <p className="text-gray-400 text-xs py-1">Ningún ponente coincide con "{ponenteSearch}".</p>
                ) : (
                  ponentesVisibles.map((p) => {
                    const selected = form.ponente_ids.includes(p.id)
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => togglePonente(p.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                          selected
                            ? 'bg-ucr-blue text-white border-ucr-blue'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-ucr-blue hover:text-ucr-blue'
                        }`}
                      >
                        {p.nombre} {p.apellidos}
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          )}
          {areas.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Áreas <span className="text-gray-400 font-normal">(opcional, múltiple)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {areas.map((a) => {
                  const selected = form.area_ids.includes(a.id)
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => toggleArea(a.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                        selected
                          ? 'bg-ucr-blue text-white border-ucr-blue'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-ucr-blue hover:text-ucr-blue'
                      }`}
                    >
                      {a.nombre}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              id="esta_activo"
              type="checkbox"
              checked={form.esta_activo}
              onChange={setCheck('esta_activo')}
              className="w-4 h-4 rounded border-gray-300 text-ucr-blue focus:ring-ucr-blue"
            />
            <label htmlFor="esta_activo" className="text-sm font-medium text-gray-700">Evento activo</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={closeModal} className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
            <button type="submit" disabled={saveMutation.isPending} className="flex-1 py-2.5 bg-ucr-blue hover:bg-ucr-blue-dark text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60">
              {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </AdminModal>

      <AdminModal open={!!verPonentes} title="Ponentes del evento" onClose={() => setVerPonentes(null)}>
        <p className="text-sm font-medium text-gray-900 mb-4">{verPonentes?.titulo}</p>
        <ul className="space-y-2">
          {(verPonentes?.ponentes ?? []).map((p) => (
            <li key={p.id} className="border border-gray-100 rounded-lg px-3 py-2">
              <p className="text-sm font-medium text-gray-900">{nombreCompletoPonente(p)}</p>
              {p.grado_academico && <p className="text-xs text-gray-400 mt-0.5">{p.grado_academico}</p>}
            </li>
          ))}
        </ul>
      </AdminModal>

      <AdminModal open={!!confirmDelete} title="Eliminar evento" onClose={() => setConfirmDelete(null)}>
        <AlertMessage message={error} />
        <p className="text-gray-600 text-sm mb-5">
          ¿Eliminás el evento <strong>{confirmDelete?.titulo}</strong>? Esta acción no se puede deshacer.
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
