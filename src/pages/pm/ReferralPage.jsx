import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Gift, Copy, Check, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import AppHeader from '../../components/AppHeader'

export default function ReferralPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const referralLink = `${window.location.origin}/signup?ref=${user?.id?.slice(0, 8)}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <AppHeader breadcrumbs={[{ label: 'PM', href: '/pm' }, { label: 'Projects', href: '/pm/dashboard' }, { label: 'Refer & Earn' }]} />

      <div className="max-w-lg mx-auto px-6 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mx-auto mb-6">
          <Gift size={28} className="text-yellow-400" />
        </div>

        <h1 className="font-display font-extrabold text-3xl text-white mb-3">Refer & Earn</h1>
        <p className="text-white/50 text-sm leading-relaxed mb-8">
          Share Vikku PM with a teammate or friend. When they sign up and upgrade,{' '}
          <span className="text-white font-medium">both of you get 1 month Pro free</span>.
        </p>

        <div className="glass rounded-2xl p-6 text-left mb-6">
          <p className="text-[10px] text-white/40 mb-2 uppercase tracking-wider">Your referral link</p>
          <div className="flex gap-2">
            <code className="flex-1 text-xs text-white/70 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 truncate">
              {referralLink}
            </code>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs bg-white text-black px-4 py-2 rounded-xl font-semibold hover:bg-white/90 transition-colors flex-shrink-0"
            >
              {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { step: '1', label: 'Share your link' },
            { step: '2', label: 'They sign up' },
            { step: '3', label: 'Both get 1 month Pro' },
          ].map((s) => (
            <div key={s.step} className="glass rounded-xl p-4 text-center">
              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2">
                <span className="text-xs font-bold text-white">{s.step}</span>
              </div>
              <p className="text-[11px] text-white/50 leading-snug">{s.label}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/pm/dashboard')}
          className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors mx-auto"
        >
          <ArrowLeft size={14} /> Back to projects
        </button>
      </div>
    </div>
  )
}
