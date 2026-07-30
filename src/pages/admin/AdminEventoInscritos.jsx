import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchAdminEventoInscritos, fetchAdminEventos } from '../../api/admin'
import AlertMessage from '../../components/ui/AlertMessage'
import LoadingState from '../../components/ui/LoadingState'
import { queryKeys } from '../../constants/queryKeys'
import { getApiErrorMessage } from '../../utils/apiErrors'

export default function AdminEventoInscritos() {
  const { eventoId } = useParams()
  const navigate = useNavigate()

  const { data: eventos = [] } = useQuery({ queryKey: queryKeys.adminEventos(), queryFn: fetchAdminEventos })
  const evento = eventos.find((ev) => String(ev.id) === String(eventoId))

  const { data: inscritos = [], isLoading, isError, error } = useQuery({
    queryKey: queryKeys.adminEventoInscritos(eventoId),
    queryFn: () => fetchAdminEventoInscritos(eventoId),
  })

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

      {isLoading ? (
        <LoadingState message="Cargando inscritos..." />
      ) : inscritos.length === 0 ? (
        <p className="text-gray-500 text-sm">Todavía no hay usuarios inscritos en este evento.</p>
      ) : (
        <>
          {/* Móvil: tarjetas apiladas */}
          <div className="sm:hidden space-y-3">
            {inscritos.map((u) => (
              <div key={u.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <p className="font-medium text-gray-900 truncate">{u.nombre}</p>
                <p className="text-gray-600 text-xs truncate mt-0.5">{u.email}</p>
                <p className="text-gray-400 text-xs mt-0.5">Carné: {u.carnet ?? '—'}</p>
              </div>
            ))}
          </div>

          {/* Escritorio: tabla */}
          <div className="hidden sm:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Nombre', 'Correo', 'Carné'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {inscritos.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{u.nombre}</td>
                      <td className="px-4 py-3 text-gray-600">{u.email}</td>
                      <td className="px-4 py-3 text-gray-500">{u.carnet ?? '—'}</td>
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
