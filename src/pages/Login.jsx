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

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

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
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #001a3a 0%, #002F58 45%, #003A6E 100%)' }}
    >
      {/* Background decoration */}
      <div
        className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(33,187,239,0.07) 0%, transparent 65%)', transform: 'translate(30%, -30%)' }}
      />
      <div
        className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,93,164,0.12) 0%, transparent 65%)', transform: 'translate(-30%, 30%)' }}
      />

      {/* Circuit grid */}
      <svg aria-hidden className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
        <defs>
          <pattern id="login-grid" x="0" y="0" width="56" height="56" patternUnits="userSpaceOnUse">
            <path d="M0 0 H56 V56" fill="none" stroke="white" strokeWidth="0.3" strokeOpacity="0.15" />
            <circle cx="0" cy="0" r="1.5" fill="white" fillOpacity="0.2" />
            <circle cx="28" cy="28" r="1" fill="white" fillOpacity="0.1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#login-grid)" />
      </svg>

      {/* Top accent stripe */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent 0%, #21BBEF 40%, #005DA4 70%, transparent 100%)' }}
      />

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        {/* Card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 32px 80px -12px rgba(0,0,0,0.5), 0 8px 24px -4px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.08)' }}
        >
          {/* Header */}
          <div
            className="px-8 py-8 flex flex-col items-center gap-5 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #005DA4 0%, #004A87 60%, #003A6E 100%)' }}
          >
            <div
              className="absolute top-0 right-0 w-56 h-56 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(33,187,239,0.15), transparent 65%)', transform: 'translate(30%, -30%)' }}
            />
            <div className="relative z-10 flex flex-col items-center gap-3">
              <img
                src={logoUcr}
                alt="Logo Universidad de Costa Rica"
                className="h-40 w-auto object-contain"
              />
              <div className="text-center">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold mb-3"
                  style={{ background: 'rgba(33,187,239,0.18)', border: '1px solid rgba(33,187,239,0.35)', color: '#7DD3FC', fontFamily: 'var(--font-mono-stack)', letterSpacing: '0.08em' }}
                >
                  XIV EDICIÓN · 2026
                </div>
                <h1 className="text-white text-2xl font-bold leading-tight font-display">
                  Simposio de<br/>Informática Empresarial
                </h1>
                <p className="text-blue-200/70 text-sm mt-1.5">Sistema de gestión del simposio</p>
              </div>
            </div>
          </div>

          {/* Form section */}
          <div className="px-8 py-8 bg-white">
            <h2 className="text-ucr-blue-dark text-lg font-semibold mb-6 font-display">
              Iniciar sesión
            </h2>

            <AlertMessage message={error} />

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="identifier" className="block text-sm font-semibold text-gray-700 mb-1.5">
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
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
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
                className="w-full py-3 font-semibold rounded-xl text-sm text-white disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #005DA4, #004A87)',
                  boxShadow: '0 4px 14px 0 rgba(0,93,164,0.3)',
                }}
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

        <p className="text-center text-sm text-white/30 mt-6">
          © {new Date().getFullYear()} Universidad de Costa Rica — Todos los derechos reservados
        </p>
      </div>
    </div>
  )
}
