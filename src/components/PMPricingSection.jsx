import { useNavigate } from 'react-router-dom'
import {
  Kanban, Users, Clock, BarChart2, FileText, Zap, Share2, CheckCircle,
  ArrowRight, Star,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Kanban,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    title: 'Kanban + Task Management',
    desc: 'Drag-and-drop boards, priorities, labels, due dates, subtasks, and dependencies — without the Jira complexity.',
  },
  {
    icon: Share2,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    title: 'Client Portal — no login needed',
    desc: 'Share a live project view with your client via a PIN-protected link. They see tasks, milestones, and can approve or leave comments.',
    badge: 'Unique to Vikku',
  },
  {
    icon: Users,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    title: 'Team Collaboration',
    desc: "Invite teammates, assign tasks, mention members in comments, track who's doing what across every project.",
  },
  {
    icon: Clock,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    title: 'Time Tracking',
    desc: 'Built-in timer on every task. Log billable hours, set estimates, and generate time reports per project or team member.',
  },
  {
    icon: BarChart2,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    title: 'Analytics & Reporting',
    desc: 'Completion rates, velocity charts, milestone burndown, and team performance — all in one view.',
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
    desc: 'Auto-move tasks between statuses, trigger reminders, and set recurring tasks — without touching a setting every time.',
  },
  {
    icon: Star,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    title: 'AI Project Assistant',
    desc: 'Describe your project goal and the AI breaks it into a full task list with estimates. Start in minutes, not hours.',
  },
]

const PLANS = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    desc: 'Perfect for freelancers and solo founders.',
    color: 'border-white/10',
    cta: 'Start free',
    ctaStyle: 'bg-white/10 text-white hover:bg-white/20',
    features: [
      '3 active projects',
      'Unlimited tasks',
      'Kanban + list view',
      'Client portal (share link)',
      'Team invite (up to 3 members)',
      'Milestone tracking',
      'Basic activity feed',
    ],
  },
  {
    name: 'Pro',
    price: '₹499',
    period: '/month',
    desc: 'For agencies and teams shipping client work.',
    color: 'border-violet-500/40',
    highlight: true,
    badge: 'Most popular',
    cta: 'Start Pro',
    ctaStyle: 'bg-white text-black hover:bg-white/90',
    features: [
      'Unlimited projects',
      'Time tracking + billable hours',
      'Analytics & velocity charts',
      'Workflow automation',
      'AI project assistant',
      'PDF export (invoice + report)',
      'Custom task labels & workflows',
      'Calendar view',
      'Priority support',
    ],
  },
  {
    name: 'Team',
    price: '₹2,499',
    period: '/month',
    desc: 'For growing agencies with multiple teams.',
    color: 'border-white/10',
    cta: 'Start Team',
    ctaStyle: 'bg-white/10 text-white hover:bg-white/20',
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'Custom client branding on portal',
      'Team analytics & reporting',
      'Dedicated onboarding call',
      'SLA-backed support',
    ],
  },
]

export default function PMPricingSection() {
  const navigate = useNavigate()

  return (
    <section id="pm-pricing" className="py-24 px-6 bg-black relative overflow-hidden">
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
            Every other PM tool was built for internal teams. Vikku PM was built for agencies —
            with a built-in client portal so your clients can see progress, approve tasks, and leave
            feedback without ever creating an account.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <div key={f.title} className="relative glass rounded-2xl p-5 flex flex-col gap-3">
                {f.badge && (
                  <span className="absolute top-3 right-3 text-[9px] font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full uppercase tracking-wide">
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
        <div className="text-center mb-10">
          <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white mb-2">Simple, honest pricing</h3>
          <p className="text-white/40 text-sm">Start free. Upgrade when you're ready.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
          {PLANS.map((plan) => (
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
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="font-display font-extrabold text-3xl text-white">{plan.price}</span>
                  <span className="text-sm text-white/40">{plan.period}</span>
                </div>
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
                onClick={() => navigate('/signup')}
                className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${plan.ctaStyle}`}
              >
                {plan.cta} <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Social proof strip */}
        <div className="glass rounded-2xl px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 flex-wrap justify-center sm:justify-start">
            {[
              { value: '50+', label: 'Active projects' },
              { value: '₹0', label: 'To get started' },
              { value: '< 2 min', label: 'To set up a project' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center sm:text-left">
                <p className="font-display font-extrabold text-xl text-white">{value}</p>
                <p className="text-[11px] text-white/40">{label}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/signup')}
            className="flex items-center gap-2 bg-white text-black font-semibold px-6 py-2.5 rounded-xl hover:bg-white/90 transition-colors text-sm flex-shrink-0"
          >
            Start free — no card needed <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  )
}
