import { useState } from 'react'
import { X, Sparkles, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { openRazorpayCheckout } from '../../lib/razorpayService'

const PLANS = [
  {
    key: 'pro',
    name: 'Pro',
    price: '₹10',
    period: '/month',
    features: [
      'Unlimited projects',
      'AI Project Planner',
      'Client share links',
      'Priority support',
    ],
    highlight: true,
  },
  {
    key: 'team',
    name: 'Team',
    price: '₹2,499',
    period: '/month',
    features: [
      'Everything in Pro',
      'Team members',
      'Role-based access',
      'Custom branding',
    ],
    highlight: false,
  },
]

export default function UpgradeModal({ onClose, onUpgraded, reason }) {
  const { user } = useAuth()
  const [processing, setProcessing] = useState(null)
  const [error, setError] = useState('')

  const handleUpgrade = (planKey) => {
    setError('')
    setProcessing(planKey)
    openRazorpayCheckout({
      plan: planKey,
      user,
      onSuccess: () => {
        setProcessing(null)
        onUpgraded?.()
        onClose?.()
      },
      onFailure: (msg) => {
        setProcessing(null)
        setError(msg || 'Payment failed. Please try again.')
      },
    })
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#111] border border-white/10 rounded-2xl shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
          <div>
            <h2 className="font-display font-bold text-white text-base">Upgrade your plan</h2>
            {reason && <p className="text-xs text-white/40 mt-0.5">{reason}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5">
          {/* Free tier note */}
          <div className="flex items-start gap-2.5 bg-yellow-400/5 border border-yellow-400/10 rounded-xl px-4 py-3 mb-5">
            <AlertCircle size={13} className="text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-white/50 leading-relaxed">
              You're on the <span className="text-white font-medium">Free plan</span>. Upgrade to unlock AI planning, unlimited projects, and client sharing.
            </p>
          </div>

          {/* Plan cards */}
          <div className="grid grid-cols-2 gap-3">
            {PLANS.map((plan) => (
              <div
                key={plan.key}
                className={`rounded-xl p-4 flex flex-col ${
                  plan.highlight ? 'bg-white' : 'bg-white/[0.04] border border-white/[0.08]'
                }`}
              >
                <p className={`text-[11px] font-semibold mb-1 ${plan.highlight ? 'text-black/50' : 'text-white/40'}`}>
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-0.5 mb-4">
                  <span className={`font-display font-extrabold text-xl ${plan.highlight ? 'text-black' : 'text-white'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-xs ${plan.highlight ? 'text-black/40' : 'text-white/30'}`}>
                    {plan.period}
                  </span>
                </div>

                <ul className="space-y-2 flex-1 mb-4">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-1.5">
                      <span className={`text-xs font-bold mt-px ${plan.highlight ? 'text-black/50' : 'text-green-400'}`}>✓</span>
                      <span className={`text-xs leading-snug ${plan.highlight ? 'text-black/70' : 'text-white/60'}`}>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(plan.key)}
                  disabled={!!processing}
                  className={`w-full py-2 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                    plan.highlight
                      ? 'bg-black text-white hover:bg-black/80'
                      : 'bg-white text-black hover:bg-white/90'
                  }`}
                >
                  {processing === plan.key ? (
                    <><Loader2 size={12} className="animate-spin" /> Processing...</>
                  ) : plan.highlight ? (
                    <><Sparkles size={12} /> Upgrade to {plan.name}</>
                  ) : (
                    `Upgrade to ${plan.name}`
                  )}
                </button>
              </div>
            ))}
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/10 px-4 py-2.5 rounded-xl">
              <AlertCircle size={12} />
              {error}
            </div>
          )}

          <p className="text-center text-[10px] text-white/20 mt-4">
            Secured by Razorpay · Cancel anytime · GST applicable
          </p>
        </div>
      </div>
    </div>
  )
}
