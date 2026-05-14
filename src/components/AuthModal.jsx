import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import '../styles/auth-modal.css'

const initialForm = { name: '', email: '', password: '', confirm: '' }

function AuthModal({ open, mode = 'login', onClose, onSwitchMode }) {
  const { login, signup, loginWithGoogle, resendVerification } = useAuth()
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [pending, setPending] = useState(null) // { email, devLink? } when awaiting verification
  const [unverifiedEmail, setUnverifiedEmail] = useState('')

  useEffect(() => {
    if (!open) return
    setForm(initialForm)
    setError('')
    setInfo('')
    setBusy(false)
    setShowPassword(false)
    setPending(null)
    setUnverifiedEmail('')
  }, [open, mode])

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const isSignup = mode === 'signup'

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setInfo('')
    setUnverifiedEmail('')

    if (isSignup && form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }

    setBusy(true)
    try {
      if (isSignup) {
        const result = await signup({
          email: form.email,
          password: form.password,
          name: form.name,
        })
        if (result?.pendingVerification) {
          setPending({ email: result.email })
          return
        }
        onClose?.()
      } else {
        await login({ email: form.email, password: form.password })
        onClose?.()
      }
    } catch (err) {
      if (err?.code === 'unverified') {
        setUnverifiedEmail(err.email || form.email)
        setError(err.message || 'Please verify your email before signing in.')
      } else {
        setError(err?.message || 'Something went wrong.')
      }
    } finally {
      setBusy(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setInfo('')
    setBusy(true)
    try {
      await resendVerification()
      setInfo('Verification email sent. Please check your inbox.')
    } catch (err) {
      setError(err?.message || 'Could not resend verification email.')
    } finally {
      setBusy(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    setBusy(true)
    try {
      await loginWithGoogle()
      onClose?.()
    } catch (err) {
      setError(err?.message || 'Google sign-in failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="auth-modal__dialog" onClick={(event) => event.stopPropagation()}>
        <button
          aria-label="Close"
          className="auth-modal__close"
          onClick={onClose}
          type="button"
        >
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>

        <div className="auth-modal__header">
          <h3>
            {pending
              ? 'Verify your email'
              : isSignup
              ? 'Create your account'
              : 'Welcome back'}
          </h3>
          <p>
            {pending
              ? `We sent a verification link to ${pending.email}. Open the email and click the link to activate your account, then come back here to sign in.`
              : isSignup
              ? 'Sign up to track your projects and inquiries.'
              : 'Login to access your dashboard and saved details.'}
          </p>
        </div>

        {pending && (
          <div className="auth-modal__pending">
            {info && <p className="auth-modal__info">{info}</p>}
            {error && <p className="auth-modal__error">{error}</p>}
            <div className="auth-modal__pending-actions">
              <button
                type="button"
                className="auth-modal__resend"
                disabled={busy}
                onClick={handleResend}
              >
                {busy ? 'Sending…' : 'Resend verification email'}
              </button>
              <button
                type="button"
                className="auth-modal__switch-btn"
                onClick={() => onSwitchMode?.('login')}
              >
                Back to Login
              </button>
            </div>
          </div>
        )}

        {!pending && (
        <>
        <button
          type="button"
          className="auth-modal__google"
          onClick={handleGoogle}
          disabled={busy}
        >
          <span className="auth-modal__google-icon" aria-hidden="true">
            <svg viewBox="0 0 48 48" width="20" height="20">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C33.6 6.1 29.1 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.5-8 19.5-20 0-1.2-.1-2.3-.4-3.5z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 18.9 13 24 13c3 0 5.7 1.1 7.8 3l5.7-5.7C33.6 6.1 29.1 4 24 4 16.4 4 9.8 8.4 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 44c5 0 9.6-1.9 13-5l-6-5.1c-1.9 1.3-4.3 2.1-7 2.1-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.4l6 5.1c-.4.4 6.7-4.9 6.7-14.5 0-1.2-.1-2.3-.4-3.5z" />
            </svg>
          </span>
          Continue with Google
        </button>

        <div className="auth-modal__divider">
          <span>or</span>
        </div>

        <form className="auth-modal__form" onSubmit={handleSubmit}>
          {isSignup && (
            <label className="auth-modal__field">
              <span>Full name</span>
              <input
                autoComplete="name"
                name="name"
                onChange={updateField}
                placeholder="Enter your full name"
                type="text"
                value={form.name}
              />
            </label>
          )}

          <label className="auth-modal__field">
            <span>Email</span>
            <input
              autoComplete="email"
              name="email"
              onChange={updateField}
              placeholder="you@example.com"
              required
              type="email"
              value={form.email}
            />
          </label>

          <label className="auth-modal__field">
            <span>Password</span>
            <div className="auth-modal__password-wrap">
              <input
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                name="password"
                onChange={updateField}
                placeholder={isSignup ? 'At least 6 characters' : 'Your password'}
                required
                minLength={6}
                type={showPassword ? 'text' : 'password'}
                value={form.password}
              />
              <button
                type="button"
                className="auth-modal__eye"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <i
                  className={showPassword ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash'}
                  aria-hidden="true"
                />
              </button>
            </div>
          </label>

          {isSignup && (
            <label className="auth-modal__field">
              <span>Confirm password</span>
              <input
                autoComplete="new-password"
                name="confirm"
                onChange={updateField}
                placeholder="Re-enter your password"
                required
                minLength={6}
                type={showPassword ? 'text' : 'password'}
                value={form.confirm}
              />
            </label>
          )}

          {error && <p className="auth-modal__error">{error}</p>}

          {unverifiedEmail && (
            <button
              type="button"
              className="auth-modal__resend"
              disabled={busy}
              onClick={handleResend}
            >
              {busy ? 'Sending…' : 'Resend verification email'}
            </button>
          )}

          {info && <p className="auth-modal__info">{info}</p>}

          <button className="auth-modal__submit" type="submit" disabled={busy}>
            {busy ? 'Please wait...' : isSignup ? 'Create account' : 'Login'}
          </button>
        </form>

        <p className="auth-modal__switch">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            className="auth-modal__switch-btn"
            onClick={() => onSwitchMode?.(isSignup ? 'login' : 'signup')}
          >
            {isSignup ? 'Login' : 'Sign Up'}
          </button>
        </p>
        </>
        )}
      </div>
    </div>
  )
}

export default AuthModal
