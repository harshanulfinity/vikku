import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password, name) => {
    if (!supabase) return { data: null, error: { message: 'Authentication not configured' } }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: name?.trim() || '' } },
    })
    return { data, error }
  }

  const signIn = async (email, password) => {
    if (!supabase) return { data: null, error: { message: 'Authentication not configured' } }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const signInWithGoogle = async () => {
    if (!supabase) return { error: { message: 'Authentication not configured' } }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
    return { data, error }
  }

  const signOut = async () => {
    if (!supabase) return { error: null }
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const resetPassword = async (email) => {
    if (!supabase) return { error: { message: 'Authentication not configured' } }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error }
  }

  const updatePassword = async (newPassword) => {
    if (!supabase) return { error: { message: 'Authentication not configured' } }
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    return { error }
  }

  const updateProfile = async (updates) => {
    if (!supabase) return { error: { message: 'Authentication not configured' } }
    const { data, error } = await supabase.auth.updateUser({ data: updates })
    if (!error && data?.user) setUser(data.user)
    return { error }
  }

  const displayName = user?.user_metadata?.name || ''

  return (
    <AuthContext.Provider value={{ user, loading, displayName, signUp, signIn, signInWithGoogle, signOut, resetPassword, updatePassword, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
