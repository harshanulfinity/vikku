import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabaseClient'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

export default function AdminGate({ children }) {
  const { user, loading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(null)

  useEffect(() => {
    if (!user) { setIsAdmin(false); return }
    supabase.auth.getSession().then(({ data }) => {
      const token = data?.session?.access_token
      if (!token) { setIsAdmin(false); return }
      fetch(`${SUPABASE_URL}/functions/v1/admin-stats?type=overview`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      })
        .then(res => setIsAdmin(res.ok))
        .catch(() => setIsAdmin(false))
    })
  }, [user])

  if (loading || isAdmin === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
      </div>
    )
  }
  if (!user || !isAdmin) return <Navigate to="/" replace />
  return children
}
