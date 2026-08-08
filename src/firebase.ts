import { initializeApp, getApps, getApp } from 'firebase/app'
import {
  initializeAuth,
  browserLocalPersistence,
  browserPopupRedirectResolver,
  GoogleAuthProvider
} from 'firebase/auth'

/* ==================== FIREBASE INITIALIZATION ==================== */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyYourFirebaseApiKeyHere',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'thermalriskai.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'thermalriskai',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'thermalriskai.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1234567890:web:abcdef123456',
}

// Initialize Firebase App
console.log(firebaseConfig)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

// Export Firebase Authentication & Providers
export const auth = initializeAuth(app, {
  persistence: browserLocalPersistence,
  popupRedirectResolver: browserPopupRedirectResolver,
})
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })
