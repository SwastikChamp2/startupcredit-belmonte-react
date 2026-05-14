import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import AuthModal from '../components/AuthModal'

const AuthModalContext = createContext(null)

export function AuthModalProvider({ children }) {
  const [state, setState] = useState({ open: false, mode: 'login' })

  const openAuthModal = useCallback((mode = 'login') => {
    setState({ open: true, mode: mode === 'signup' ? 'signup' : 'login' })
  }, [])

  const closeAuthModal = useCallback(() => {
    setState((current) => ({ ...current, open: false }))
  }, [])

  const switchMode = useCallback((mode) => {
    setState({ open: true, mode })
  }, [])

  const value = useMemo(
    () => ({ openAuthModal, closeAuthModal, isOpen: state.open, mode: state.mode }),
    [openAuthModal, closeAuthModal, state.open, state.mode]
  )

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      <AuthModal
        open={state.open}
        mode={state.mode}
        onClose={closeAuthModal}
        onSwitchMode={switchMode}
      />
    </AuthModalContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthModal() {
  const ctx = useContext(AuthModalContext)
  if (!ctx) {
    throw new Error('useAuthModal must be used within an AuthModalProvider')
  }
  return ctx
}
