import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchAdminEventoInscritos, fetchAdminEventos, updateAsistenciaInscrito } from '../../api/admin'
import AlertMessage from '../../components/ui/AlertMessage'
import LoadingState from '../../components/ui/LoadingState'
import { queryKeys } from '../../constants/queryKeys'
import { getApiErrorMessage } from '../../utils/apiErrors'

export default function AdminEventoInscritos() {
  const { eventoId } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [asistenciaError, setAsistenciaError] = useState('')

  const { data: eventos = [] } = useQuery({ queryKey: queryKeys.adminEventos(), queryFn: fetchAdminEventos })
  const evento = eventos.find((ev) => String(ev.id) === String(eventoId))

  const { data: inscritos = [], isLoading, isError, error } = useQuery({
    queryKey: queryKeys.adminEventoInscritos(eventoId),
    queryFn: () => fetchAdminEventoInscritos(eventoId),
  })

  const asistenciaMutation = useMutation({
    mutationFn: ({ inscripcionId, asistio }) => updateAsistenciaInscrito(eventoId, inscripcionId, asistio),
    onMutate: async ({ inscripcionId, asistio }) => {
      setAsistenciaError('')
      await qc.cancelQueries({ queryKey: queryKeys.adminEventoInscritos(eventoId) })
      const previous = qc.getQueryData(queryKeys.adminEventoInscritos(eventoId))
      qc.setQueryData(queryKeys.adminEventoInscritos(eventoId), (old = []) =>
        old.map((i) => (i.id === inscripcionId ? { ...i, asistio } : i)),
      )
      return { previous }
    },
    onError: (err, _vars, context) => {
      if (context?.previous) qc.setQueryData(queryKeys.adminEventoInscritos(eventoId), context.previous)
      setAsistenciaError(getApiErrorMessage(err, 'No se pudo actualizar la asistencia.'))
    },
  })

  const filaPendiente = (inscripcionId) =>
    asistenciaMutation.isPending && asistenciaMutation.variables?.inscripcionId === inscripcionId

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            type="button"
            onClick={() => navigate('/admin/eventos')}
            className="text-ucr-blue hover:text-ucr-blue-dark text-xs font-medium mb-2 inline-flex items-center gap-1"
          >
            ← Volver a eventos
          </button>
          <h1 className="text-xl font-bold text-ucr-blue-dark">
            Inscritos{evento ? ` — ${evento.titulo}` : ''}
          </h1>
        </div>
      </div>

      <AlertMessage message={isError ? getApiErrorMessage(error, 'No se pudieron cargar los inscritos.') : ''} />
      <AlertMessage message={asistenciaError} />

      {isLoading ? (
        <LoadingState message="Cargando inscritos..." />
      ) : inscritos.length === 0 ? (
        <p className="text-gray-500 text-sm">Todavía no hay usuarios inscritos en este evento.</p>
      ) : (
        <>
          {/* Móvil: tarjetas apiladas */}
          <div className="sm:hidden space-y-3">
            {inscritos.map((insc) => (
              <div key={insc.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{insc.user.nombre}</p>
                    <p className="text-gray-600 text-xs truncate mt-0.5">{insc.user.email}</p>
                    <p className="text-gray-400 text-xs mt-0.5">Carné: {insc.user.carnet ?? '—'}</p>
                  </div>
                  <label className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-gray-600">
                    <input
                      type="checkbox"
                      checked={insc.asistio}
                      disabled={filaPendiente(insc.id)}
                      onChange={(e) => asistenciaMutation.mutate({ inscripcionId: insc.id, asistio: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-ucr-blue focus:ring-ucr-blue disabled:opacity-50"
                    />
                    Asistió
                  </label>
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
                    {['Nombre', 'Correo', 'Carné', 'Asistió'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {inscritos.map((insc) => (
                    <tr key={insc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{insc.user.nombre}</td>
                      <td className="px-4 py-3 text-gray-600">{insc.user.email}</td>
                      <td className="px-4 py-3 text-gray-500">{insc.user.carnet ?? '—'}</td>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={insc.asistio}
                          disabled={filaPendiente(insc.id)}
                          onChange={(e) => asistenciaMutation.mutate({ inscripcionId: insc.id, asistio: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-ucr-blue focus:ring-ucr-blue disabled:opacity-50"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
