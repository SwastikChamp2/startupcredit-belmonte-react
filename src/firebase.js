import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const clean = (value) => (value || '').replace(/^['"]|['"]$/g, '').replace(/,$/, '').trim()

const firebaseConfig = {
  apiKey: clean(import.meta.env.VITE_APP_API_KEY),
  authDomain: clean(import.meta.env.VITE_APP_AUTHDOMAIN),
  projectId: clean(import.meta.env.VITE_APP_PROJECTID),
  storageBucket: clean(import.meta.env.VITE_APP_STORAGE_BUCKET),
  messagingSenderId: clean(import.meta.env.VITE_APP_SENSERID),
  appId: clean(import.meta.env.VITE_APP_APPID),
  measurementId: clean(import.meta.env.VITE_APP_MEASUREMENTID),
}

// Default app — used by the public site (signup/login modal, form submissions,
// public reference-data reads). Public users sign in here.
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(app)

// Separate app instance for the admin panel. Firebase Auth keeps sessions
// scoped per app, so an admin signed into `adminAuth` is NOT affected when a
// public user signs in via the public `auth` instance (and vice versa). The
// underlying Firebase project and user database are still shared — only the
// in-browser session state is isolated.
const adminApp = initializeApp(firebaseConfig, 'admin')
export const adminAuth = getAuth(adminApp)
export const adminDb = getFirestore(adminApp)
