import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Sparkles, Loader2, AlertCircle, Check, Minus } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { openRazorpayCheckout } from '../../lib/razorpayService'

// Feature comparison table: [label, free, pro, team]
// true = check, false = dash, string = custom text
const FEATURE_GROUPS = [
  {
    title: 'Pro Features',
    rows: [
      ['AI Project Planner',      false,        true,         true],
      ['Client share links',      false,        true,         true],
      ['Client comments on share', false,       true,         true],
      ['Time log CSV export',     false,        true,         true],
      ['Priority email support',  false,        true,         true],
    ],
  },
  {
    title: 'Team Collaboration',
    rows: [
      ['Team members per project', '1 (you)',   '1 (you)',    'Up to 10'],
      ['Role-based access',       false,        false,        true],
      ['Member invite links',     false,        false,        true],
      ['Project duplication',     false,        false,        true],
    ],
  },
  {
    title: 'Projects & Tasks',
    rows: [
      ['Active projects',         '3',         'Unlimited',  'Unlimited'],
      ['Kanban board (4 columns)', true,        true,         true],
      ['List view (mobile-friendly)', true,     true,         true],
      ['Task labels & priorities', true,        true,         true],
      ['Due dates & reminders',   true,         true,         true],
      ['Task comments & activity feed', true,   true,         true],
      ['Bulk task actions',       true,         true,         true],
      ['Cmd+K quick-add',         true,         true,         true],
    ],
  },
  {
    title: 'Planning & Views',
    rows: [
      ['Milestones & timeline',   true,         true,         true],
      ['Calendar view',           true,         true,         true],
      ['Project analytics',       true,         true,         true],
      ['Project templates (5)',   true,         true,         true],
      ['Time logging',            true,         true,         true],
      ['PDF export',              true,         true,         true],
      ['PWA (install as app)',    true,         true,         true],
    ],
  },
]

function Cell({ value, isHighlight }) {
  if (value === true)
    return (
      <div className={`w-5 h-5 rounded-full flex items-center justify-center mx-auto ${isHighlight ? 'bg-green-500/20' : 'bg-yellow-500/15'}`}>
        <Check size={11} strokeWidth={3} className={isHighlight ? 'text-green-600' : 'text-yellow-400'} />
      </div>
    )
  if (value === false)
    return <Minus size={14} strokeWidth={2} className="text-white/20 mx-auto" />
  return (
    <span className={`text-[11px] font-medium leading-tight text-center ${isHighlight ? 'text-black/70' : 'text-white/50'}`}>
      {value}
    </span>
  )
}

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

  const modal = (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-2xl bg-[#111] border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] flex-shrink-0">
          <div>
            <h2 className="font-display font-bold text-white text-base">Compare plans</h2>
            {reason && <p className="text-xs text-white/40 mt-0.5">{reason}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="p-5">
            {/* Plan header row */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {/* Feature label column */}
              <div />
              {/* Free */}
              <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-2.5 text-center">
                <p className="text-[10px] font-semibold text-white/40 mb-0.5">Free</p>
                <p className="font-display font-extrabold text-base text-white">₹0</p>
                <p className="text-[9px] text-white/30">/month</p>
                <div className="mt-2 py-1 rounded-lg bg-white/[0.06] text-[9px] text-white/30 font-medium">
                  Current plan
                </div>
              </div>
              {/* Pro */}
              <div className="bg-white rounded-xl p-2.5 text-center relative">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-black text-white text-[8px] font-bold px-2 py-0.5 rounded-full border border-white/20">
                  POPULAR
                </div>
                <p className="text-[10px] font-semibold text-black/50 mb-0.5">Pro</p>
                <p className="font-display font-extrabold text-base text-black">₹499</p>
                <p className="text-[9px] text-black/40">/month</p>
                <button
                  onClick={() => handleUpgrade('pro')}
                  disabled={!!processing}
                  className="mt-2 w-full py-1 rounded-lg bg-black text-white font-semibold text-[9px] hover:bg-black/80 transition-all flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  {processing === 'pro' ? <><Loader2 size={9} className="animate-spin" /> Processing</> : <><Sparkles size={9} /> Upgrade</>}
                </button>
              </div>
              {/* Team */}
              <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-2.5 text-center">
                <p className="text-[10px] font-semibold text-white/40 mb-0.5">Team</p>
                <p className="font-display font-extrabold text-base text-white">₹2,499</p>
                <p className="text-[9px] text-white/30">/month</p>
                <button
                  onClick={() => handleUpgrade('team')}
                  disabled={!!processing}
                  className="mt-2 w-full py-1 rounded-lg bg-white text-black font-semibold text-[9px] hover:bg-white/90 transition-all flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  {processing === 'team' ? <><Loader2 size={9} className="animate-spin" /> Processing</> : 'Upgrade'}
                </button>
              </div>
            </div>

            {/* Feature groups */}
            {FEATURE_GROUPS.map((group) => (
              <div key={group.title} className="mb-4">
                <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1.5 px-1">
                  {group.title}
                </p>
                <div className="rounded-xl overflow-hidden">
                  {group.rows.map((row, i) => {
                    const [label, free, pro, team] = row
                    return (
                      <div
                        key={label}
                        className="grid grid-cols-4 gap-2 items-center px-3 py-2"
                      >
                        <span className="text-[11px] text-white/50 col-span-1">{label}</span>
                        <div className="flex justify-center"><Cell value={free} isHighlight={false} /></div>
                        <div className="flex justify-center"><Cell value={pro} isHighlight={true} /></div>
                        <div className="flex justify-center"><Cell value={team} isHighlight={false} /></div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/10 px-4 py-2.5 rounded-xl mb-3">
                <AlertCircle size={12} />
                {error}
              </div>
            )}

            <p className="text-center text-[10px] text-white/20">
              Secured by Razorpay · Cancel anytime · GST applicable
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
