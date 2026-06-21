import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabaseClient'

export default function AdminGate({ children }) {
  const { user, loading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(null) // null = checking

  useEffect(() => {
    if (!user) { setIsAdmin(false); return }
    // Probe the admin-stats endpoint — it verifies server-side.
    // A 403 means not admin; any 2xx means admin.
    supabase.functions.invoke('admin-stats', { body: null, method: 'GET' })
      .then(({ error }) => setIsAdmin(!error))
      .catch(() => setIsAdmin(false))
  }, [user])

  if (loading || isAdmin === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
      </div>
    )
  }
  if (!user || !isAdmin) {
    return <Navigate to="/" replace />
  }
  return children
}
