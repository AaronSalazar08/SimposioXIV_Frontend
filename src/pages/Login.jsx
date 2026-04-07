import { useState } from 'react'
import { useAuth } from '../context/useAuth'
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
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Credenciales inválidas. Intente de nuevo.'
      setError(msg)
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

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ucr-blue focus:border-transparent transition placeholder-gray-400"
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ucr-blue focus:border-transparent transition placeholder-gray-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-ucr-blue hover:bg-ucr-blue-dark text-white font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
