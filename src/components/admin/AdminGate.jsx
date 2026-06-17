import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const ADMIN_EMAILS = ['sanikommuharshavardhanreddy6@gmail.com', 'harshas@nulfinity.com']

export default function AdminGate({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
      </div>
    )
  }
  if (!user || !ADMIN_EMAILS.includes(user.email)) {
    return <Navigate to="/" replace />
  }
  return children
}
