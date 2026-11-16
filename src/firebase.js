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
export const firebaseProjectId = firebaseConfig.projectId

// Shared app used by both the public site and the role-protected admin panel.
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(app)
