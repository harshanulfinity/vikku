import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { ArrowLeft, Mail, Lock, AlertCircle, CheckCircle2, Inbox } from 'lucide-react'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const refCode = searchParams.get('ref')

  useEffect(() => {
    if (refCode) sessionStorage.setItem('vikku_ref', refCode)
    const plan = searchParams.get('plan')
    if (plan === 'pro' || plan === 'team') sessionStorage.setItem('vikku_pending_plan', plan)
  }, [refCode, searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    const { error, data } = await signUp(email, password)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      const ref = sessionStorage.getItem('vikku_ref')
      if (ref && data?.user?.id) {
        sessionStorage.removeItem('vikku_ref')
        await supabase.from('referrals').insert({ referrer_code: ref, referred_user_id: data.user.id }).catch(() => {})
      }
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="glass rounded-2xl p-10">
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mx-auto mb-6">
              <Inbox size={28} className="text-black" />
            </div>

            <h1 className="font-display font-extrabold text-2xl text-white mb-3">
              Check your inbox
            </h1>
            <p className="text-white/60 text-sm mb-2 leading-relaxed">
              We sent a confirmation link to
            </p>
            <p className="text-white font-semibold text-sm mb-6">{email}</p>

            <div className="glass rounded-xl p-4 mb-8 text-left space-y-3">
              {[
                'Open the email from Vikku',
                'Click the "Confirm your account" button',
                'You\'ll be signed in automatically',
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] text-white/60 font-bold">{i + 1}</span>
                  </div>
                  <p className="text-xs text-white/70">{step}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-white/30 mb-6">
              Didn't get it? Check your spam folder or wait a minute and try again.
            </p>

            <button
              onClick={() => { setSent(false); setEmail(''); setPassword(''); setConfirmPassword('') }}
              className="text-xs text-white/40 hover:text-white transition-colors"
            >
              Use a different email
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="glass rounded-2xl p-8">
          <div className="mb-8">
            <h1 className="font-display font-extrabold text-2xl text-white mb-2">Create Account</h1>
            <p className="text-white/60 text-sm">Sign up to access AI tools and resources</p>
          </div>

          {error && (
            <div className="glass rounded-lg p-4 mb-6 flex items-start gap-3 border border-red-500/20">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full glass rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full glass rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-white hover:text-white/80 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
