import { useState } from 'react'
import { useAuth } from '../context/useAuth'
import AlertMessage from '../components/ui/AlertMessage'
import Spinner from '../components/ui/Spinner'
import { INPUT_CLASS } from '../constants/formStyles'
import { getApiErrorMessage } from '../utils/apiErrors'
import logoUcr from '../assets/logo_ucr.png'

export default function Login() {
  const { login } = useAuth()
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Credenciales inválidas. Intente de nuevo.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ucr-blue-muted flex items-center justify-center px-4">
      {/* Franja decorativa superior */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-ucr-blue" />

      <div className="w-full max-w-md">
        {/* Card principal */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Cabecera azul */}
          <div className="bg-ucr-blue px-8 py-8 flex flex-col items-center gap-4">
            <img
              src={logoUcr}
              alt="Logo Universidad de Costa Rica"
              className="h-20 w-auto object-contain drop-shadow"
            />
            <div className="text-center">
              <h1 className="text-white text-2xl font-bold leading-tight">
                Simposio UCR
              </h1>
              <p className="text-blue-200 text-sm mt-1">
                Sistema de gestión del simposio
              </p>
            </div>
          </div>

          {/* Formulario */}
          <div className="px-8 py-8">
            <h2 className="text-ucr-blue-dark text-lg font-semibold mb-6 text-center">
              Iniciar sesión
            </h2>

            <AlertMessage message={error} />

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="identifier"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Carnet o correo electrónico
                </label>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  required
                  value={form.identifier}
                  onChange={handleChange}
                  placeholder="B12345 o usuario@ucr.ac.cr"
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={INPUT_CLASS}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-ucr-blue hover:bg-ucr-blue-dark text-white font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <>
                    <Spinner size="md" />
                    Ingresando...
                  </>
                ) : (
                  'Ingresar'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-5">
          © {new Date().getFullYear()} Universidad de Costa Rica — Todos los derechos reservados
        </p>
      </div>
    </div>
  )
}
