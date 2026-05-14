import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import { adminAuth } from '../../firebase'
import './admin-login.css'

const SUPER_ADMIN = {
  username: 'admin@startupcredit.com',
  password: 'startupcredit@2026',
}

function AdminLogin() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (localStorage.getItem('startupCreditAdminAuth') === 'true') {
    return <Navigate to="/admin/users" replace />
  }

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    // Step 1: hardcoded gate (legacy admin auth — keeps the existing UX).
    if (
      form.username.trim() !== SUPER_ADMIN.username ||
      form.password !== SUPER_ADMIN.password
    ) {
      setError('Invalid username or password.')
      return
    }

    setBusy(true)
    setError('')

    // Step 2: also sign in to Firebase so Firestore security rules see the
    // admin as authenticated (required for onSnapshot listeners on admin pages).
    // The first ever login auto-creates the admin's Firebase user.
    try {
      try {
        await signInWithEmailAndPassword(adminAuth, SUPER_ADMIN.username, SUPER_ADMIN.password)
      } catch (signInErr) {
        if (
          signInErr?.code === 'auth/user-not-found' ||
          signInErr?.code === 'auth/invalid-credential'
        ) {
          // First-time setup — create the admin Firebase user, then continue.
          await createUserWithEmailAndPassword(
            adminAuth,
            SUPER_ADMIN.username,
            SUPER_ADMIN.password
          )
        } else {
          throw signInErr
        }
      }

      localStorage.setItem('startupCreditAdminAuth', 'true')
      navigate('/admin/users', { replace: true })
    } catch (err) {
      // Surface a useful diagnostic — most common cause is that Email/Password
      // sign-in isn't enabled in the Firebase console.
      const code = err?.code || ''
      if (code === 'auth/operation-not-allowed') {
        setError(
          'Email/Password sign-in is disabled in Firebase. Enable it in Firebase Console → Authentication → Sign-in method.'
        )
      } else if (code === 'auth/network-request-failed') {
        setError('Network error reaching Firebase. Check your connection and try again.')
      } else {
        setError(err?.message || 'Could not sign in. Please try again.')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-brand-panel" aria-label="Startup Credit overview">
        <div className="admin-login-logo-row">
          <img src="/assets/img/logo/logo-2.png" alt="Startup Credit" />
        </div>

        <div className="admin-login-pitch">
          <p className="admin-login-kicker">
            <span aria-hidden="true"></span>
            Simplifying Startup Financing
          </p>
          <h1>Smart Financing for Every Startup</h1>
          <p>
            From government schemes to private investors, we simplify startup
            financing by connecting you with the right funding options and
            expert guidance.
          </p>

          <div className="admin-login-trust-row" aria-label="Platform highlights">
            <div>
              <i className="fa-solid fa-shield-halved" aria-hidden="true"></i>
              <span>Trusted Platform</span>
            </div>
            <div>
              <i className="fa-solid fa-users" aria-hidden="true"></i>
              <span>Expert Guidance</span>
            </div>
            <div>
              <i className="fa-solid fa-chart-line" aria-hidden="true"></i>
              <span>Better Opportunities</span>
            </div>
          </div>
        </div>

        <div className="admin-login-ground-circle" aria-hidden="true"></div>
        <img
          className="admin-login-skyline"
          src="/assets/img/admin/admin-login-skyline.svg"
          alt=""
          aria-hidden="true"
        />
      </section>

      <section className="admin-login-form-panel" aria-label="Admin login">
        <form className="admin-login-card" onSubmit={handleSubmit}>
          <div className="admin-login-heading">
            <p>Welcome back!</p>
            <h2>Login to your account</h2>
            <span>Access your dashboard and manage everything in one place.</span>
          </div>

          <label className="admin-login-field">
            <span>Username</span>
            <div className="admin-login-input-wrap">
              <i className="fa-regular fa-envelope" aria-hidden="true"></i>
              <input
                autoComplete="username"
                name="username"
                onChange={updateField}
                placeholder="Enter your username"
                type="text"
                value={form.username}
              />
            </div>
          </label>

          <label className="admin-login-field">
            <span>Password</span>
            <div className="admin-login-input-wrap">
              <i className="fa-solid fa-lock" aria-hidden="true"></i>
              <input
                autoComplete="current-password"
                name="password"
                onChange={updateField}
                placeholder="Enter your password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
              />
              <button
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="admin-login-password-toggle"
                onClick={() => setShowPassword((current) => !current)}
                type="button"
              >
                <i
                  className={showPassword ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash'}
                  aria-hidden="true"
                ></i>
              </button>
            </div>
          </label>

          {error && <p className="admin-login-error">{error}</p>}

          <button className="admin-login-submit" type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Login'}
          </button>
        </form>

        <p className="admin-login-footer">&copy; 2026 Startup Credit. All rights reserved.</p>
      </section>
    </main>
  )
}

export default AdminLogin
