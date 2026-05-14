import { useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useAuthModal } from '../hooks/useAuthModal'

/**
 * Gates a section behind login. While the user is unauthenticated:
 *   - opens the auth modal once on mount
 *   - renders a friendly fallback with Login/Sign Up buttons instead of `children`
 *
 * Once the user logs in, `children` renders normally.
 */
function RequireAuth({ children, title = 'Login required to continue', message }) {
  const { isAuthenticated, authReady } = useAuth()
  const { openAuthModal, isOpen } = useAuthModal()
  const autoOpenedRef = useRef(false)

  useEffect(() => {
    if (isAuthenticated) {
      autoOpenedRef.current = false
      return
    }
    if (!authReady) return
    if (!autoOpenedRef.current && !isOpen) {
      autoOpenedRef.current = true
      const delay = document.getElementById('preloader') ? 2100 : 0
      const timer = setTimeout(() => openAuthModal('login'), delay)
      return () => clearTimeout(timer)
    }
  }, [authReady, isAuthenticated, isOpen, openAuthModal])

  if (isAuthenticated) return children
  if (!authReady) return null

  return (
    <section className="require-auth-gate">
      <div className="require-auth-gate__card">
        <div className="require-auth-gate__icon" aria-hidden="true">
          <i className="fa-solid fa-lock" />
        </div>
        <h2>{title}</h2>
        <p>
          {message ||
            'Please log in or create an account to fill out and submit this form. Your details are saved against your account.'}
        </p>
        <div className="require-auth-gate__actions">
          <button
            type="button"
            className="require-auth-gate__btn require-auth-gate__btn--login"
            onClick={() => openAuthModal('login')}
          >
            Login
          </button>
          <button
            type="button"
            className="require-auth-gate__btn require-auth-gate__btn--signup"
            onClick={() => openAuthModal('signup')}
          >
            Sign Up
          </button>
        </div>
      </div>
    </section>
  )
}

export default RequireAuth
