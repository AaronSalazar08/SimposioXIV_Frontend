import { useEffect, useRef, useState, useCallback } from 'react'
import { enviarOtpPassword, verificarOtpPassword, cambiarPassword } from '../../api/auth'
import Spinner from '../ui/Spinner'

const OTP_SECONDS = 120

const maskEmail = (email = '') => {
  const [name, domain] = email.split('@')
  if (!domain) return email
  return `${name.charAt(0)}***@${domain}`
}

const formatCountdown = (s) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

const rules = [
  { id: 'len',     label: 'Al menos 8 caracteres',          test: (p) => p.length >= 8 },
  { id: 'upper',   label: 'Al menos una mayúscula (A–Z)',   test: (p) => /[A-Z]/.test(p) },
  { id: 'num',     label: 'Al menos un número (0–9)',       test: (p) => /[0-9]/.test(p) },
  { id: 'special', label: 'Al menos un carácter especial',  test: (p) => /[^a-zA-Z0-9]/.test(p) },
]

/* ── Step indicator ────────────────────────────────────────────────────── */
function StepBar({ step }) {
  const steps = [
    { label: 'Solicitar' },
    { label: 'Verificar' },
    { label: 'Contraseña' },
  ]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '0 8px' }}>
      {steps.map((s, i) => {
        const done   = step > i + 1
        const active = step === i + 1
        return (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flexShrink: 0 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
                fontFamily: 'var(--font-display)',
                background: done  ? '#005DA4'
                          : active ? 'linear-gradient(135deg, #21BBEF, #005DA4)'
                                   : '#E5EDF5',
                color: done || active ? '#fff' : '#94A3B8',
                boxShadow: active ? '0 0 0 3px rgba(33,187,239,0.22)' : 'none',
                transition: 'all 300ms',
              }}>
                {done ? (
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : i + 1}
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: active ? '#005DA4' : done ? '#64748B' : '#94A3B8', letterSpacing: '0.05em', fontFamily: 'var(--font-display)', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, marginBottom: 18, background: done ? '#005DA4' : '#E5EDF5', transition: 'background 300ms' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ── OTP digit boxes ───────────────────────────────────────────────────── */
function OtpInput({ value, onChange, disabled }) {
  const refs = useRef([])
  const digits = value.split('').concat(Array(6).fill('')).slice(0, 6)

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const next = digits.map((d, idx) => (idx === i ? '' : d))
      onChange(next.join(''))
      if (i > 0) refs.current[i - 1]?.focus()
    } else if (e.key === 'ArrowLeft' && i > 0) {
      refs.current[i - 1]?.focus()
    } else if (e.key === 'ArrowRight' && i < 5) {
      refs.current[i + 1]?.focus()
    }
  }

  const handleInput = (i, e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(-1)
    if (!raw) return
    const next = [...digits]
    next[i] = raw
    onChange(next.join(''))
    if (i < 5) refs.current[i + 1]?.focus()
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(pasted.padEnd(6, '').slice(0, 6))
    const focusIdx = Math.min(pasted.length, 5)
    refs.current[focusIdx]?.focus()
  }

  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      {digits.map((d, i) => {
        const isFilled = d !== ''
        return (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={d}
            disabled={disabled}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onInput={(e) => handleInput(i, e)}
            onPaste={handlePaste}
            onChange={() => {}}
            aria-label={`Dígito ${i + 1} del código`}
            style={{
              width: 46, height: 58,
              textAlign: 'center',
              fontSize: 22, fontWeight: 700,
              fontFamily: 'var(--font-display)',
              letterSpacing: 0,
              border: `2px solid ${isFilled ? '#005DA4' : 'rgba(0,93,164,0.2)'}`,
              borderRadius: 10,
              background: isFilled
                ? 'linear-gradient(145deg, #005DA4, #003A6E)'
                : '#fff',
              color: isFilled ? '#fff' : '#1a1a2e',
              outline: 'none',
              caretColor: '#21BBEF',
              boxShadow: isFilled ? '0 4px 12px rgba(0,93,164,0.25)' : 'none',
              transition: 'border-color 180ms, background 180ms, box-shadow 180ms',
              cursor: disabled ? 'not-allowed' : 'text',
              opacity: disabled ? 0.6 : 1,
            }}
            onFocus={(e) => {
              if (!isFilled) e.target.style.borderColor = '#21BBEF'
              e.target.style.boxShadow = `0 0 0 3px rgba(33,187,239,0.18)`
            }}
            onBlur={(e) => {
              if (!isFilled) e.target.style.borderColor = 'rgba(0,93,164,0.2)'
              if (!isFilled) e.target.style.boxShadow = 'none'
            }}
          />
        )
      })}
    </div>
  )
}

/* ── Countdown badge ───────────────────────────────────────────────────── */
function Countdown({ seconds }) {
  const pct  = seconds / OTP_SECONDS
  const color = pct > 0.5 ? '#059669' : pct > 0.25 ? '#D97706' : '#DC2626'
  const bg    = pct > 0.5 ? 'rgba(5,150,105,0.08)' : pct > 0.25 ? 'rgba(217,119,6,0.08)' : 'rgba(220,38,38,0.08)'
  const border = pct > 0.5 ? 'rgba(5,150,105,0.25)' : pct > 0.25 ? 'rgba(217,119,6,0.25)' : 'rgba(220,38,38,0.25)'

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: bg, border: `1px solid ${border}`, transition: 'all 500ms' }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
      </svg>
      <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: 'var(--font-display)', fontVariantNumeric: 'tabular-nums' }}>
        {formatCountdown(seconds)}
      </span>
    </div>
  )
}

/* ── Rule chip ─────────────────────────────────────────────────────────── */
function RuleChip({ label, met }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: met ? 'rgba(5,150,105,0.12)' : 'rgba(0,0,0,0.05)',
        border: `1.5px solid ${met ? 'rgba(5,150,105,0.4)' : 'rgba(0,0,0,0.12)'}`,
        transition: 'all 200ms',
      }}>
        {met ? (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round">
            <path d="M5 13l4 4L19 7"/>
          </svg>
        ) : (
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(0,0,0,0.2)' }} />
        )}
      </div>
      <span style={{ fontSize: 13, color: met ? '#059669' : '#6B7280', fontFamily: 'var(--font-display)', fontWeight: met ? 600 : 400, transition: 'color 200ms' }}>
        {label}
      </span>
    </div>
  )
}

/* ── Main component ────────────────────────────────────────────────────── */
export default function CambiarPasswordModal({ user, onClose }) {
  const [step, setStep]             = useState(1)
  const [otp, setOtp]               = useState('')
  const [password, setPassword]     = useState('')
  const [confirm, setConfirm]       = useState('')
  const [showPass, setShowPass]     = useState(false)
  const [showConf, setShowConf]     = useState(false)
  const [secondsLeft, setSeconds]   = useState(0)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState(false)

  /* Escape key */
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  /* Countdown tick */
  useEffect(() => {
    if (step !== 2 || secondsLeft <= 0) return
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [step, secondsLeft])

  const rulesMet = rules.map((r) => r.test(password))
  const passwordsMatch = password === confirm && password !== ''
  const allValid = rulesMet.every(Boolean) && passwordsMatch

  /* ── Actions ── */
  const handleEnviarOtp = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      await enviarOtpPassword()
      setOtp('')
      setSeconds(OTP_SECONDS)
      setStep(2)
    } catch {
      setError('No se pudo enviar el código. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleReenviar = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      await enviarOtpPassword()
      setOtp('')
      setSeconds(OTP_SECONDS)
    } catch {
      setError('No se pudo reenviar el código.')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleVerificarOtp = useCallback(async () => {
    if (otp.replace(/\D/g, '').length < 6) return
    setLoading(true)
    setError('')
    try {
      await verificarOtpPassword({ codigo: otp.replace(/\D/g, '') })
      setStep(3)
    } catch (err) {
      const msg = err?.response?.data?.errors?.codigo?.[0]
        ?? 'El código es incorrecto o ha expirado.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [otp])

  const handleCambiarPassword = useCallback(async () => {
    if (!allValid) return
    setLoading(true)
    setError('')
    try {
      await cambiarPassword({ password, password_confirmation: confirm })
      setSuccess(true)
    } catch (err) {
      const msgs = err?.response?.data?.errors
      if (msgs) {
        setError(Object.values(msgs).flat().join(' '))
      } else {
        setError('No se pudo actualizar la contraseña.')
      }
    } finally {
      setLoading(false)
    }
  }, [password, confirm, allValid])

  /* ── Shared input style ── */
  const inputStyle = {
    width: '100%', padding: '11px 42px 11px 14px',
    border: '1.5px solid rgba(0,93,164,0.2)', borderRadius: 10,
    fontSize: 15, fontFamily: 'var(--font-display)', color: '#111827',
    background: '#fff', outline: 'none',
    transition: 'border-color 150ms, box-shadow 150ms',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ background: 'rgba(0,15,35,0.55)', backdropFilter: 'blur(4px)' }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cambiar-pass-title"
        className="bg-white w-full max-w-md animate-scale-in overflow-hidden"
        style={{ borderRadius: 20, boxShadow: '0 24px 64px -12px rgba(0,0,0,0.35), 0 8px 24px -4px rgba(0,0,0,0.15)' }}
      >
        {/* Accent stripe */}
        <div style={{ height: 3, background: 'linear-gradient(90deg, #21BBEF 0%, #005DA4 60%, #003A6E 100%)' }} />

        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 id="cambiar-pass-title" style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#003A6E', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
              Cambiar contraseña
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#94A3B8', display: 'flex', transition: 'background 150ms, color 150ms' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#374151' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8' }}
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {!success && <StepBar step={step} />}
        </div>

        {/* Body */}
        <div style={{ padding: '24px 24px 8px' }}>

          {/* ── SUCCESS ── */}
          {success && (
            <div style={{ textAlign: 'center', padding: '16px 8px 24px' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(5,150,105,0.1)', border: '2px solid rgba(5,150,105,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700, color: '#003A6E', fontFamily: 'var(--font-display)' }}>
                ¡Contraseña actualizada!
              </p>
              <p style={{ margin: 0, fontSize: 14, color: '#6B7280', fontFamily: 'var(--font-display)' }}>
                Tu nueva contraseña está activa.
              </p>
            </div>
          )}

          {/* ── STEP 1: Solicitar ── */}
          {!success && step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(33,187,239,0.12), rgba(0,93,164,0.12))', border: '1.5px solid rgba(0,93,164,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#005DA4" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <p style={{ margin: 0, fontSize: 14, color: '#374151', fontFamily: 'var(--font-display)', lineHeight: 1.55 }}>
                  Enviaremos un código de 6 dígitos a tu correo:
                </p>
                <p style={{ margin: '6px 0 0', fontSize: 15, fontWeight: 700, color: '#005DA4', fontFamily: 'var(--font-display)' }}>
                  {maskEmail(user?.email)}
                </p>
                <p style={{ margin: '8px 0 0', fontSize: 12, color: '#94A3B8', fontFamily: 'var(--font-display)' }}>
                  El código expira a los 2 minutos de ser enviado.
                </p>
              </div>
              {error && <ErrorBanner msg={error} />}
            </div>
          )}

          {/* ── STEP 2: Verificar OTP ── */}
          {!success && step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <p style={{ margin: 0, fontSize: 14, color: '#374151', fontFamily: 'var(--font-display)', textAlign: 'center', lineHeight: 1.55 }}>
                Ingresá el código enviado a{' '}
                <strong style={{ color: '#005DA4' }}>{maskEmail(user?.email)}</strong>
              </p>

              <OtpInput value={otp} onChange={setOtp} disabled={loading} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                {secondsLeft > 0 ? (
                  <Countdown seconds={secondsLeft} />
                ) : (
                  <span style={{ fontSize: 13, color: '#DC2626', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                    Código expirado
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleReenviar}
                  disabled={loading || secondsLeft > 0}
                  style={{ fontSize: 13, color: secondsLeft > 0 ? '#94A3B8' : '#005DA4', fontFamily: 'var(--font-display)', fontWeight: 600, background: 'none', border: 'none', cursor: secondsLeft > 0 ? 'default' : 'pointer', padding: 0, textDecoration: secondsLeft > 0 ? 'none' : 'underline', textDecorationColor: 'rgba(0,93,164,0.4)' }}
                >
                  Reenviar código
                </button>
              </div>

              {error && <ErrorBanner msg={error} />}
            </div>
          )}

          {/* ── STEP 3: Nueva contraseña ── */}
          {!success && step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Nueva contraseña */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', fontFamily: 'var(--font-display)', marginBottom: 6, letterSpacing: '0.01em' }}>
                  Nueva contraseña
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = '#21BBEF'; e.target.style.boxShadow = '0 0 0 3px rgba(33,187,239,0.14)' }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(0,93,164,0.2)'; e.target.style.boxShadow = 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    tabIndex={-1}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 2, display: 'flex' }}
                  >
                    {showPass ? (
                      <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirmar contraseña */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', fontFamily: 'var(--font-display)', marginBottom: 6, letterSpacing: '0.01em' }}>
                  Confirmar contraseña
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConf ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repetí la contraseña"
                    autoComplete="new-password"
                    style={{
                      ...inputStyle,
                      borderColor: confirm && !passwordsMatch ? 'rgba(220,38,38,0.5)' : 'rgba(0,93,164,0.2)',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#21BBEF'; e.target.style.boxShadow = '0 0 0 3px rgba(33,187,239,0.14)' }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = 'none'
                      e.target.style.borderColor = confirm && !passwordsMatch ? 'rgba(220,38,38,0.5)' : 'rgba(0,93,164,0.2)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConf((v) => !v)}
                    tabIndex={-1}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 2, display: 'flex' }}
                  >
                    {showConf ? (
                      <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Rules checklist */}
              {password && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, padding: '12px 14px', background: '#F8FAFD', borderRadius: 10, border: '1px solid rgba(0,93,164,0.08)' }}>
                  {rules.map((r, i) => (
                    <RuleChip key={r.id} label={r.label} met={rulesMet[i]} />
                  ))}
                  {confirm && (
                    <RuleChip label="Las contraseñas coinciden" met={passwordsMatch} />
                  )}
                </div>
              )}

              {error && <ErrorBanner msg={error} />}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div style={{ padding: '16px 24px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {success ? (
            <button
              type="button"
              onClick={onClose}
              style={{ width: '100%', padding: '12px 0', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #005DA4, #003A6E)', color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)', cursor: 'pointer', letterSpacing: '-0.01em', boxShadow: '0 4px 14px rgba(0,93,164,0.3)' }}
            >
              Cerrar
            </button>
          ) : step === 1 ? (
            <button
              type="button"
              onClick={handleEnviarOtp}
              disabled={loading}
              style={{ width: '100%', padding: '12px 0', borderRadius: 12, border: 'none', background: loading ? '#94A3B8' : 'linear-gradient(135deg, #005DA4, #003A6E)', color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '-0.01em', boxShadow: loading ? 'none' : '0 4px 14px rgba(0,93,164,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 150ms' }}
            >
              {loading ? <><Spinner size="sm" />Enviando...</> : 'Enviar código al correo'}
            </button>
          ) : step === 2 ? (
            <>
              <button
                type="button"
                onClick={handleVerificarOtp}
                disabled={loading || otp.replace(/\D/g, '').length < 6}
                style={{ width: '100%', padding: '12px 0', borderRadius: 12, border: 'none', background: (loading || otp.replace(/\D/g, '').length < 6) ? '#94A3B8' : 'linear-gradient(135deg, #005DA4, #003A6E)', color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)', cursor: (loading || otp.replace(/\D/g, '').length < 6) ? 'not-allowed' : 'pointer', letterSpacing: '-0.01em', boxShadow: (loading || otp.replace(/\D/g, '').length < 6) ? 'none' : '0 4px 14px rgba(0,93,164,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 150ms' }}
              >
                {loading ? <><Spinner size="sm" />Verificando...</> : 'Verificar código'}
              </button>
              <button
                type="button"
                onClick={() => { setStep(1); setOtp(''); setError('') }}
                style={{ width: '100%', padding: '10px 0', borderRadius: 12, border: '1.5px solid rgba(0,0,0,0.1)', background: 'transparent', color: '#64748B', fontSize: 14, fontFamily: 'var(--font-display)', cursor: 'pointer' }}
              >
                Volver
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleCambiarPassword}
              disabled={loading || !allValid}
              style={{ width: '100%', padding: '12px 0', borderRadius: 12, border: 'none', background: (loading || !allValid) ? '#94A3B8' : 'linear-gradient(135deg, #005DA4, #003A6E)', color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)', cursor: (loading || !allValid) ? 'not-allowed' : 'pointer', letterSpacing: '-0.01em', boxShadow: (loading || !allValid) ? 'none' : '0 4px 14px rgba(0,93,164,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 150ms' }}
            >
              {loading ? <><Spinner size="sm" />Actualizando...</> : 'Cambiar contraseña'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function ErrorBanner({ msg }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, padding: '10px 14px', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 10 }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
      </svg>
      <span style={{ fontSize: 13, color: '#B91C1C', fontFamily: 'var(--font-display)', lineHeight: 1.45 }}>{msg}</span>
    </div>
  )
}
