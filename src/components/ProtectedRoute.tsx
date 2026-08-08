import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/* ==================== PROTECTED ROUTE GUARD ==================== */

export default function ProtectedRoute() {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-cyan-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-mono font-semibold text-slate-600">Authenticating Session...</span>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
