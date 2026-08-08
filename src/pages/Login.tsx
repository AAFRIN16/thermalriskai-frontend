import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Activity, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react'

/* ==================== LOGIN PAGE COMPONENT ==================== */

export default function Login() {
  const { currentUser, login } = useAuth()
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const navigate = useNavigate()

  // Redirect to home if user is already authenticated
  if (currentUser) {
    return <Navigate to="/" replace />
  }

  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true)
    setErrorMessage(null)
    try {
      await login()
      navigate('/')
    } catch (err: any) {
      console.error('Firebase Auth Error:', err)
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Sign in window was closed before completing.')
      } else if (err.code === 'auth/unauthorized-domain') {
        setErrorMessage('This domain is not authorized in Firebase Console. Please add it under Authentication settings.')
      } else {
        setErrorMessage(err.message || 'Failed to sign in with Google. Please check your credentials.')
      }
    } finally {
      setIsLoggingIn(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 bg-grid flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl shadow-lg p-8 sm:p-10 space-y-8 relative overflow-hidden">

        {/* Subtle decorative background blur */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />

        {/* Logo & Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 text-white shadow-md mb-2">
            <Activity className="w-7 h-7" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200">
            <Sparkles className="w-3.5 h-3.5 text-cyan-700" />
            <span className="text-[11px] font-mono font-bold text-cyan-800 uppercase tracking-wider">
              Research Platform
            </span>
          </div>

          <h1 className="text-xl sm:text-xl lg:text-2xl font-black text-slate-900 tracking-tight whitespace-nowrap">
            Welcome to ThermalRisk <span className="gradient-text">AI</span>
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed font-normal">
            Sign in with Google to access your personalized Digital Twin.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs font-medium">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="space-y-4 pt-2">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoggingIn}
            className="w-full py-3.5 px-4 bg-white border border-slate-300 hover:border-cyan-500 rounded-xl text-slate-800 font-bold text-sm shadow-xs hover:shadow-md hover:bg-slate-50 transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed group"
          >
            {isLoggingIn ? (
              <div className="w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>{isLoggingIn ? 'Signing in...' : 'Sign in with Google'}</span>
          </button>
        </div>

        {/* Security Footer */}
        <div className="pt-6 border-t border-slate-100 text-center">
          <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Secure Firebase Authenticated Session</span>
          </div>
        </div>

      </div>
    </div>
  )
}
