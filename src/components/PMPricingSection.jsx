import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import useSubscription from '../hooks/useSubscription'
import UpgradeModal from './pm/UpgradeModal'
import { priceBreakdown } from '../lib/razorpayService'
import {
  Kanban, Users, Clock, BarChart2, FileText, Zap, Share2, CheckCircle,
  ArrowRight, Star, HardDrive,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Kanban,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    title: 'Kanban + Task Management',
    desc: 'Drag-and-drop boards, priorities, labels, due dates, subtasks, and dependencies - without the Jira complexity.',
  },
  {
    icon: Share2,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    title: 'Client Portal - no login needed',
    desc: 'Share a live project view with your client via a PIN-protected link. They see tasks, milestones, and can approve or leave comments.',
    badge: 'Pro',
  },
  {
    icon: Users,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    title: 'Team Collaboration',
    desc: "Invite teammates, assign tasks, mention members in comments, track who's doing what across every project.",
    badge: 'Team',
  },
  {
    icon: Clock,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    title: 'Time Tracking',
    desc: 'Built-in timer on every task. Log billable hours, set estimates, and generate time reports per project or team member.',
    badge: 'Pro',
  },
  {
    icon: BarChart2,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    title: 'Analytics & Reporting',
    desc: 'Completion rates, velocity charts, milestone burndown, and team performance - all in one view.',
  },
  {
    icon: FileText,
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    title: 'Invoice Generator',
    desc: 'Turn tracked hours and project milestones into a professional invoice PDF in one click.',
  },
  {
    icon: Zap,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    title: 'Workflow Automation',
    desc: 'Auto-move tasks between statuses, trigger reminders, and set recurring tasks - without touching a setting every time.',
    badge: 'Pro',
  },
  {
    icon: Star,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    title: 'AI Project Assistant',
    desc: 'Describe your project goal and the AI breaks it into a full task list with estimates. Start in minutes, not hours.',
  },
  {
    icon: HardDrive,
    color: 'text-teal-400',
    bg: 'bg-teal-500/10',
    title: 'File Storage',
    desc: 'Attach files, screenshots, and docs to any task. Share files with clients directly from the client portal.',
  },
]

const PLANS = [
  {
    key: 'free',
    name: 'Free',
    monthly: { price: '₹0', period: 'forever' },
    annual:  { price: '₹0', period: 'forever' },
    desc: 'For solo founders getting started.',
    color: 'border-white/10',
    cta: 'Start free',
    ctaStyle: 'bg-white/10 text-white hover:bg-white/20',
    features: [
      '3 active projects',
      'Up to 3 members per project',
      'Unlimited tasks',
      'Kanban, timeline & calendar views',
      'Milestones & analytics',
      'PDF export & manual time logging',
      'AI planner (6 plans/month)',
      '200 MB file storage',
    ],
  },
  {
    key: 'pro',
    name: 'Pro',
    monthly: { price: '₹299', period: '/month' },
    annual:  { price: '₹2,999', period: '/year', note: '₹250/mo billed yearly' },
    desc: 'For freelancers and agencies with clients.',
    color: 'border-violet-500/40',
    highlight: true,
    badge: 'Most popular',
    cta: 'Upgrade to Pro',
    ctaStyle: 'bg-white text-black hover:bg-white/90',
    features: [
      'Everything in Free',
      'Unlimited active projects',
      'AI planner (unlimited)',
      'Time tracking, timer & billable hours',
      'Client portal (PIN-protected share link)',
      'Custom workflows',
      'Up to 10 members per project',
      '2 GB file storage',
    ],
  },
  {
    key: 'team',
    name: 'Team',
    monthly: { price: '₹999', period: '/month' },
    annual:  { price: '₹9,999', period: '/year', note: '₹833/mo billed yearly' },
    desc: 'For agencies managing multiple teams.',
    color: 'border-white/10',
    cta: 'Upgrade to Team',
    ctaStyle: 'bg-white/10 text-white hover:bg-white/20',
    features: [
      'Everything in Pro',
      'Unlimited members per project',
      'Unlimited member invite links',
      'Shared access across your whole team',
      '10 GB file storage',
    ],
  },
]

export default function PMPricingSection() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { plan: currentPlan } = useSubscription()
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [billingCycle, setBillingCycle] = useState('monthly')
  const isAnnual = billingCycle === 'annual'

  const handleCTA = (planKey) => {
    if (planKey === 'free') {
      navigate('/signup')
      return
    }
    if (!user) {
      // Store plan + billing intent so PMDashboard can open upgrade modal after signup
      sessionStorage.setItem('vikku_pending_plan', planKey)
      sessionStorage.setItem('vikku_pending_cycle', billingCycle)
      navigate(`/signup?plan=${planKey}`)
      return
    }
    // Logged-in user - open upgrade modal directly
    setShowUpgrade(true)
  }

  return (
    <section id="pm-pricing" className="py-24 px-6 bg-black relative overflow-hidden">
      {showUpgrade && (
        <UpgradeModal
          currentPlan={currentPlan}
          initialBillingCycle={billingCycle}
          onClose={() => setShowUpgrade(false)}
          onUpgraded={() => { setShowUpgrade(false); navigate('/pm/dashboard') }}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-violet-950/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 mb-5">
            <Kanban size={12} className="text-violet-400" />
            <span className="text-[11px] font-semibold text-violet-400 tracking-wide uppercase">Vikku PM</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white leading-tight mb-4">
            The PM tool built for<br />
            <span className="text-violet-400">agencies with clients</span>
          </h2>
          <p className="text-white/50 text-sm max-w-xl mx-auto leading-relaxed">
            Every other PM tool was built for internal teams. Vikku PM was built for agencies -
            with a built-in client portal so your clients can see progress, approve tasks, and leave
            feedback without ever creating an account.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
          {FEATURES.map((f) => {
            const Icon = f.icon
            const badgeColor = f.badge === 'Pro'
              ? 'text-violet-400 bg-violet-500/10 border-violet-500/20'
              : 'text-blue-400 bg-blue-500/10 border-blue-500/20'
            return (
              <div key={f.title} className="relative glass rounded-2xl p-5 flex flex-col gap-3">
                {f.badge && (
                  <span className={`absolute top-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border ${badgeColor}`}>
                    {f.badge}
                  </span>
                )}
                <div className={`w-9 h-9 rounded-xl ${f.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={16} className={f.color} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-1">{f.title}</p>
                  <p className="text-xs text-white/45 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Pricing */}
        <div className="text-center mb-8">
          <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white mb-2">Simple, honest pricing</h3>
          <p className="text-white/40 text-sm">Start free. Upgrade when you need client features.</p>
        </div>

        {/* Billing cycle toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center bg-white/[0.06] border border-white/[0.08] rounded-xl p-0.5">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`text-xs font-semibold px-5 py-2 rounded-lg transition-all ${!isAnnual ? 'bg-white text-black' : 'text-white/50 hover:text-white/80'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`text-xs font-semibold px-5 py-2 rounded-lg transition-all flex items-center gap-2 ${isAnnual ? 'bg-white text-black' : 'text-white/50 hover:text-white/80'}`}
            >
              Annual
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isAnnual ? 'bg-green-500/20 text-green-600' : 'bg-green-500/15 text-green-400'}`}>
                Save ~16%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
          {PLANS.map((plan) => {
            const isCurrentPlan = user && currentPlan === plan.key
            const pricing = isAnnual ? plan.annual : plan.monthly
            return (
              <div
                key={plan.name}
                className={`relative glass rounded-2xl p-7 flex flex-col border ${plan.color} ${plan.highlight ? 'ring-1 ring-violet-500/30' : ''}`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold text-black bg-violet-400 px-3 py-1 rounded-full uppercase tracking-wide whitespace-nowrap">
                    {plan.badge}
                  </span>
                )}

                <div className="mb-5">
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">{plan.name}</p>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="font-display font-extrabold text-3xl text-white">{pricing.price}</span>
                    <span className="text-sm text-white/40">{pricing.period}</span>
                  </div>
                  <p className="text-[10px] text-green-400/70 mb-1 h-3.5">{pricing.note || ''}</p>
                  <p className="text-[10px] text-white/30 mb-2 h-3.5">
                    {plan.key !== 'free'
                      ? `+18% GST · ₹${priceBreakdown(plan.key, billingCycle).total.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ${isAnnual ? '/yr' : '/mo'} total`
                      : ''}
                  </p>
                  <p className="text-xs text-white/50 leading-relaxed">{plan.desc}</p>
                </div>

                <ul className="space-y-2.5 flex-1 mb-7">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <CheckCircle size={13} className="text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-white/60">{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleCTA(plan.key)}
                  disabled={isCurrentPlan}
                  className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-default ${plan.ctaStyle}`}
                >
                  {isCurrentPlan ? 'Current plan' : <>{plan.cta} <ArrowRight size={14} /></>}
                </button>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA strip */}
        <div className="glass rounded-2xl px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-8 flex-wrap justify-center sm:justify-start">
            {[
              { value: 'Free', label: 'To start - no card needed' },
              { value: '< 2 min', label: 'To set up your first project' },
              { value: 'Cancel', label: 'Anytime, keeps access till period end' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center sm:text-left">
                <p className="font-display font-extrabold text-xl text-white">{value}</p>
                <p className="text-[11px] text-white/40">{label}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => handleCTA('free')}
            className="flex items-center gap-2 bg-white text-black font-semibold px-6 py-2.5 rounded-xl hover:bg-white/90 transition-colors text-sm flex-shrink-0"
          >
            Start free <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  )
}
