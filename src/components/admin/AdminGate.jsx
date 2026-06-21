import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabaseClient'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

export default function AdminGate({ children }) {
  const { user, loading } = useAuth()
  const [isAdmin, setIsAdmin]   = useState(null)
  const [checkErr, setCheckErr] = useState('')

  useEffect(() => {
    if (loading) return
    if (!user) { setIsAdmin(false); return }

    supabase.auth.getSession().then(({ data }) => {
      const token = data?.session?.access_token
      if (!token) { setIsAdmin(false); return }

      fetch(`${SUPABASE_URL}/functions/v1/admin-stats?type=overview`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      })
        .then(res => {
          if (res.ok) { setIsAdmin(true) }
          else { res.json().then(j => setCheckErr(j.error || `HTTP ${res.status}`)).catch(() => setCheckErr(`HTTP ${res.status}`)); setIsAdmin(false) }
        })
        .catch(err => { setCheckErr(err.message); setIsAdmin(false) })
    })
  }, [user, loading])

  if (loading || isAdmin === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center flex-col gap-3">
        <p className="text-white/60 text-sm">Access denied</p>
        {checkErr && <p className="text-red-400 text-xs font-mono">{checkErr}</p>}
      </div>
    )
  }

  return children
}
