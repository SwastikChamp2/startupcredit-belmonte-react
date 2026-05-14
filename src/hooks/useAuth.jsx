import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from '../firebase'

const AuthContext = createContext(null)

const friendlyFirebaseError = (err) => {
  const code = err?.code || ''
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 6 characters.'
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.'
    case 'auth/user-not-found':
      return 'No account exists with this email.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a few minutes and try again.'
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.'
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled.'
    default:
      return err?.message || 'Something went wrong.'
  }
}

const wrapFirebaseError = (err) => {
  const wrapped = new Error(friendlyFirebaseError(err))
  if (err?.code) wrapped.code = err.code
  return wrapped
}

// Upsert a Firestore /users/{uid} doc with our app-level fields. Idempotent.
const upsertUserDoc = async (firebaseUser, extras = {}) => {
  const ref = doc(db, 'users', firebaseUser.uid)
  const snap = await getDoc(ref)
  const provider =
    extras.provider ||
    (firebaseUser.providerData?.[0]?.providerId === 'google.com' ? 'google' : 'password')
  const baseFields = {
    uid: firebaseUser.uid,
    email: (firebaseUser.email || '').toLowerCase(),
    name: extras.name ?? firebaseUser.displayName ?? '',
    provider,
    emailVerified: Boolean(firebaseUser.emailVerified),
  }
  if (snap.exists()) {
    await setDoc(ref, { ...baseFields, updatedAt: serverTimestamp() }, { merge: true })
    return { ...snap.data(), ...baseFields }
  }
  const newDoc = { ...baseFields, createdAt: serverTimestamp() }
  await setDoc(ref, newDoc)
  return newDoc
}

const userFromFirebase = (firebaseUser, doc) => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email || doc?.email || '',
  name: doc?.name || firebaseUser.displayName || '',
  role: doc?.role || '',
  provider: doc?.provider || (firebaseUser.providerData?.[0]?.providerId === 'google.com' ? 'google' : 'password'),
  emailVerified: firebaseUser.emailVerified,
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)

  // React to Firebase Auth state changes. This is the single source of truth.
  useEffect(() => {
    let unsubscribeUserDoc = null

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      unsubscribeUserDoc?.()
      unsubscribeUserDoc = null

      if (!firebaseUser) {
        setUser(null)
        setAuthReady(true)
        return
      }
      // For password users, only consider them "logged in" once verified.
      const isPasswordProvider =
        firebaseUser.providerData?.[0]?.providerId === 'password'
      if (isPasswordProvider && !firebaseUser.emailVerified) {
        // Keep firebaseUser around so resendVerification works, but treat as
        // unauthenticated from our app's perspective.
        setUser(null)
        setAuthReady(true)
        return
      }
      try {
        // Upsert + check for disabled flag (admin can disable accounts via Firestore).
        const userDoc = await upsertUserDoc(firebaseUser)
        if (userDoc.disabled) {
          await firebaseSignOut(auth).catch(() => {})
          setUser(null)
        } else {
          setUser(userFromFirebase(firebaseUser, userDoc))
          unsubscribeUserDoc = onSnapshot(
            doc(db, 'users', firebaseUser.uid),
            (snap) => {
              const liveDoc = snap.exists() ? snap.data() : userDoc
              if (liveDoc.disabled) {
                firebaseSignOut(auth).catch(() => {})
                setUser(null)
                return
              }
              setUser(userFromFirebase(firebaseUser, liveDoc))
            },
            (err) => {
              console.warn('user doc subscription failed:', err)
            }
          )
        }
      } catch (err) {
        // If Firestore is unavailable, still let the user in based on Firebase auth alone.
        console.warn('upsertUserDoc failed:', err)
        setUser(userFromFirebase(firebaseUser, null))
      } finally {
        setAuthReady(true)
      }
    })
    return () => {
      unsubscribeUserDoc?.()
      unsubscribe()
    }
  }, [])

  const signup = useCallback(async ({ email, password, name }) => {
    let credential
    try {
      credential = await createUserWithEmailAndPassword(auth, email, password)
    } catch (err) {
      throw wrapFirebaseError(err)
    }
    const fbUser = credential.user
    if (name) {
      try {
        await updateProfile(fbUser, { displayName: name })
      } catch {
        // non-fatal
      }
    }
    // Pre-create the Firestore user doc so admin pages can list this account
    // even before email verification completes.
    try {
      await upsertUserDoc(fbUser, { name, provider: 'password' })
    } catch (err) {
      console.warn('upsertUserDoc on signup failed:', err)
    }
    try {
      await sendEmailVerification(fbUser, {
        url: `${window.location.origin}/`,
        handleCodeInApp: false,
      })
    } catch (err) {
      throw wrapFirebaseError(err)
    }
    // Sign the user out so they must verify before they can use the app.
    await firebaseSignOut(auth).catch(() => {})
    return { pendingVerification: true, email }
  }, [])

  const login = useCallback(async ({ email, password }) => {
    let credential
    try {
      credential = await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      throw wrapFirebaseError(err)
    }
    const fbUser = credential.user
    if (!fbUser.emailVerified) {
      const err = new Error(
        'Please verify your email before signing in. Check your inbox for the verification link.'
      )
      err.code = 'unverified'
      err.email = email
      throw err
    }

    // Check for disabled flag immediately so we can show an error in the AuthModal.
    const userDoc = await upsertUserDoc(fbUser)
    if (userDoc.disabled) {
      await firebaseSignOut(auth).catch(() => {})
      const err = new Error('Your account has been disabled. Please contact support.')
      err.code = 'disabled'
      throw err
    }

    return userFromFirebase(fbUser, userDoc)
  }, [])

  const loginWithGoogle = useCallback(async () => {
    let credential
    try {
      credential = await signInWithPopup(auth, googleProvider)
    } catch (err) {
      throw wrapFirebaseError(err)
    }

    const fbUser = credential.user
    const userDoc = await upsertUserDoc(fbUser)
    if (userDoc.disabled) {
      await firebaseSignOut(auth).catch(() => {})
      const err = new Error('Your account has been disabled. Please contact support.')
      err.code = 'disabled'
      throw err
    }

    return userFromFirebase(fbUser, userDoc)
  }, [])

  const resendVerification = useCallback(async () => {
    const fbUser = auth.currentUser
    if (!fbUser) {
      throw new Error('Please sign up or try logging in again to resend the verification email.')
    }
    try {
      await sendEmailVerification(fbUser, {
        url: `${window.location.origin}/`,
        handleCodeInApp: false,
      })
    } catch (err) {
      throw wrapFirebaseError(err)
    }
    return { delivered: true }
  }, [])

  const logout = useCallback(async () => {
    await firebaseSignOut(auth).catch(() => {})
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      authReady,
      isAuthenticated: Boolean(user),
      signup,
      login,
      loginWithGoogle,
      logout,
      resendVerification,
    }),
    [user, authReady, signup, login, loginWithGoogle, logout, resendVerification]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
