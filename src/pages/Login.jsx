import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, Mail, Lock, AlertCircle } from 'lucide-react'

const TURNSTILE_SITE_KEY = '0x4AAAAAADojMJZNzVnM0Jv9'
const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 5 * 60 * 1000 // 5 minutes

function getLockoutState() {
  try {
    const raw = sessionStorage.getItem('login_lockout')
    if (!raw) return { attempts: 0, lockedUntil: 0 }
    return JSON.parse(raw)
  } catch { return { attempts: 0, lockedUntil: 0 } }
}

function saveLockoutState(state) {
  sessionStorage.setItem('login_lockout', JSON.stringify(state))
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [lockoutSecsLeft, setLockoutSecsLeft] = useState(0)
  const [captchaToken, setCaptchaToken] = useState('')
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const timerRef = useRef(null)
  const turnstileRef = useRef(null)
  const widgetIdRef = useRef(null)

  useEffect(() => {
    const { lockedUntil } = getLockoutState()
    if (lockedUntil > Date.now()) startLockoutTimer(lockedUntil)
    return () => clearInterval(timerRef.current)
  }, [])

  useEffect(() => {
    const render = () => {
      if (!turnstileRef.current || !window.turnstile) return
      widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: 'dark',
        callback: (token) => setCaptchaToken(token),
        'expired-callback': () => setCaptchaToken(''),
        'error-callback': () => setCaptchaToken(''),
      })
    }
    if (window.turnstile) render()
    else window.addEventListener('load', render, { once: true })
    return () => {
      if (widgetIdRef.current != null && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
      }
    }
  }, [])

  function startLockoutTimer(lockedUntil) {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      const secs = Math.ceil((lockedUntil - Date.now()) / 1000)
      if (secs <= 0) {
        clearInterval(timerRef.current)
        setLockoutSecsLeft(0)
        saveLockoutState({ attempts: 0, lockedUntil: 0 })
      } else {
        setLockoutSecsLeft(secs)
      }
    }, 1000)
    setLockoutSecsLeft(Math.ceil((lockedUntil - Date.now()) / 1000))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const state = getLockoutState()
    if (state.lockedUntil > Date.now()) return

    setError('')
    setLoading(true)

    const { error } = await signIn(email, password, captchaToken)

    if (error) {
      const newAttempts = state.attempts + 1
      if (newAttempts >= MAX_ATTEMPTS) {
        const lockedUntil = Date.now() + LOCKOUT_MS
        saveLockoutState({ attempts: newAttempts, lockedUntil })
        startLockoutTimer(lockedUntil)
        setError('')
      } else {
        saveLockoutState({ attempts: newAttempts, lockedUntil: 0 })
        setError(`${error.message} (${MAX_ATTEMPTS - newAttempts} attempt${MAX_ATTEMPTS - newAttempts === 1 ? '' : 's'} left)`)
      }
      // Reset Turnstile so user gets a fresh token on next attempt
      if (widgetIdRef.current != null && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current)
      }
      setCaptchaToken('')
      setLoading(false)
    } else {
      saveLockoutState({ attempts: 0, lockedUntil: 0 })
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Back button */}
        <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        {/* Login card */}
        <div className="glass rounded-2xl p-8">
          <div className="mb-8">
            <h1 className="font-display font-extrabold text-2xl text-white mb-2">Welcome Back</h1>
            <p className="text-white/60 text-sm">Sign in to access AI tools and resources</p>
          </div>

          {lockoutSecsLeft > 0 && (
            <div className="glass rounded-lg p-4 mb-6 flex items-start gap-3 border border-red-500/20">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">
                Too many failed attempts. Try again in {Math.floor(lockoutSecsLeft / 60)}:{String(lockoutSecsLeft % 60).padStart(2, '0')}.
              </p>
            </div>
          )}

          {error && lockoutSecsLeft === 0 && (
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

            <div ref={turnstileRef} className="flex justify-center" />

            <button
              type="submit"
              disabled={loading || lockoutSecsLeft > 0 || !captchaToken}
              className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : lockoutSecsLeft > 0 ? `Locked (${lockoutSecsLeft}s)` : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-white hover:text-white/80 transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
