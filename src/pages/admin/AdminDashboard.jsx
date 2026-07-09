import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { fetchAdminUsuarios } from '../../api/admin'
import { fetchAdminEventos } from '../../api/admin'
import { fetchAdminHorarios } from '../../api/admin'
import { fetchAdminAulas } from '../../api/admin'
import HorarioGrid from '../../components/admin/HorarioGrid'
import { queryKeys } from '../../constants/queryKeys'
import { useAuth } from '../../context/useAuth'

const CARDS = [
  { label: 'Usuarios', to: '/admin/usuarios', key: 'usuarios', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  { label: 'Eventos', to: '/admin/eventos', key: 'eventos', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { label: 'Horarios', to: '/admin/horarios', key: 'horarios', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { label: 'Aulas', to: '/admin/aulas', key: 'aulas', color: 'bg-violet-50 text-violet-700 border-violet-200' },
]

export default function AdminDashboard() {
  const { user } = useAuth()

  const { data: usuarios = [] } = useQuery({ queryKey: queryKeys.adminUsuarios(), queryFn: fetchAdminUsuarios })
  const { data: eventos = [] } = useQuery({ queryKey: queryKeys.adminEventos(), queryFn: fetchAdminEventos })
  const { data: horarios = [] } = useQuery({ queryKey: queryKeys.adminHorarios(), queryFn: fetchAdminHorarios })
  const { data: aulas = [] } = useQuery({ queryKey: queryKeys.adminAulas(), queryFn: fetchAdminAulas })

  const counts = { usuarios: usuarios.length, eventos: eventos.length, horarios: horarios.length, aulas: aulas.length }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ucr-blue-dark">
          Bienvenido, {user?.name ?? 'Administrador'}
        </h1>
        <p className="text-gray-500 text-sm mt-1">Panel de administración del Simposio UCR</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {CARDS.map(({ label, to, key, color }) => (
          <Link
            key={key}
            to={to}
            className={`rounded-xl border p-5 flex flex-col gap-2 hover:shadow-md transition-shadow ${color}`}
          >
            <span className="text-3xl font-bold">{counts[key]}</span>
            <span className="text-sm font-medium">{label}</span>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <HorarioGrid eventos={eventos} />
      </div>
    </div>
  )
}
