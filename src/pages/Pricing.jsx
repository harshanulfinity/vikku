import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Kanban, DollarSign, TrendingUp, Clock, LayoutDashboard } from 'lucide-react'
import usePageMeta from '../hooks/usePageMeta'

const TOOLS_COPY = [
  {
    Icon: Kanban,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    name: 'PM Tool',
    hook: 'Still managing projects in scattered WhatsApp groups and endless spreadsheets?',
    outcome: 'What if your entire project - tasks, team, milestones, and client updates - lived in one clean dashboard you could open from anywhere?',
    intro: 'Vikku PM helps founders and freelancers ship products faster without the bloat of Jira or the confusion of Trello. Built for small teams that move fast.',
    steps: [
      'Create a project from a template or blank board in 30 seconds',
      'Add tasks, assign members, set milestones and due dates',
      'Share a live read-only link with your client - no login, no friction',
    ],
    proof: '50+ founders actively managing live projects',
    cta: 'Start your first project free',
    path: '/pm',
  },
  {
    Icon: DollarSign,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    name: 'AI Cost Estimator',
    hook: 'Still guessing how much your app will cost to build?',
    outcome: 'What if you had a full cost breakdown - dev, design, infrastructure - in under 5 minutes, before talking to a single agency?',
    intro: 'The AI Cost Estimator turns plain-English ideas into detailed development cost reports. Know your budget before you negotiate with anyone.',
    steps: [
      'Describe your product idea in plain English - no tech jargon needed',
      'AI breaks it down by features, tech stack, and team size',
      'Get an itemised estimate in ₹ or $ you can share with stakeholders',
    ],
    proof: 'Helped plan over ₹2Cr in development budgets',
    cta: 'Estimate your idea in 5 minutes',
    path: '/dashboard/cost-estimator',
  },
  {
    Icon: TrendingUp,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    name: 'ROI Calculator',
    hook: 'Not sure if a website is worth the investment for your business?',
    outcome: 'What if you could see, in hard numbers, exactly how much revenue you are losing every month without a digital presence?',
    intro: 'The ROI Calculator quantifies the financial impact of going digital with clear numbers you can show to partners, investors, or your own team.',
    steps: [
      'Answer 4 quick questions about your business and current lead flow',
      'AI calculates missed revenue, lead loss, and growth potential',
      'Get a payback timeline and ROI breakdown in under 2 minutes',
    ],
    proof: '30+ businesses used this to justify going digital',
    cta: 'See your ROI in 2 minutes',
    path: '/dashboard/roi-calculator',
  },
  {
    Icon: Clock,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    name: 'Timeline Calculator',
    hook: 'Tired of agencies promising "6 weeks" and delivering in 6 months?',
    outcome: 'What if you had a realistic, phase-by-phase timeline before a single line of code was written or a rupee spent?',
    intro: 'The Timeline Calculator gives you an honest breakdown of every project phase - discovery, design, development, testing, and launch - so you set expectations right from day one.',
    steps: [
      'Describe your project scope, complexity, and design needs',
      'AI maps your project across real-world development phases',
      'Get a week-by-week timeline with buffer notes and dependencies',
    ],
    proof: 'Used to plan 20+ projects with accurate delivery estimates',
    cta: 'Get your honest project timeline',
    path: '/dashboard/timeline-calculator',
  },
  {
    Icon: LayoutDashboard,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    name: 'Tech Stack Recommender',
    hook: 'Stuck in the "React or Vue? Node or Django? AWS or Supabase?" debate?',
    outcome: 'What if an AI architect handed you the perfect tech stack for your product - with clear reasoning, tradeoffs, and cost estimates?',
    intro: 'The Tech Stack Recommender helps founders and non-technical PMs pick the right tools for their product scale and team - without needing a CTO in the room.',
    steps: [
      'Describe your product, expected scale, and team skills',
      'AI evaluates frontend, backend, database, and hosting options',
      'Get a full recommendation with reasoning, risks, and monthly cost estimates',
    ],
    proof: '40+ founders made confident tech decisions using this',
    cta: 'Get your free stack recommendation',
    path: '/dashboard/tech-recommender',
  },
]

export default function Pricing() {
  const navigate = useNavigate()

  usePageMeta({
    title: 'Tools - Vikku | Free Founder Tools',
    description: 'Free tools to help founders validate ideas, estimate costs, plan timelines, pick tech stacks, and manage projects.',
    url: 'https://vikku.in/tools',
  })

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 glass border-b border-white/[0.05] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <span className="font-display font-bold text-lg text-white">Tools</span>
          <button
            onClick={() => navigate('/signup')}
            className="text-xs bg-white text-black px-4 py-2 rounded-lg hover:bg-white/90 transition-colors font-medium"
          >
            Get free access
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Heading */}
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-3 sm:mb-4">Free Founder Tools</p>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-white mb-4 leading-tight">
            Tools that help you<br />build smarter
          </h1>
          <p className="text-white/50 text-sm max-w-lg mx-auto leading-relaxed">
            Before you hire a dev or spend a rupee - use these to validate your idea, estimate costs, plan timelines, and manage your build.
          </p>
        </div>

        {/* Tools */}
        <div className="space-y-5">
          {TOOLS_COPY.map((tool) => {
            const Icon = tool.Icon
            return (
              <div key={tool.name} className="glass rounded-2xl p-5 sm:p-8 md:p-10">
                {/* Tool label */}
                <div className="flex items-center gap-2.5 mb-4 sm:mb-5">
                  <div className={`w-8 h-8 rounded-xl ${tool.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={15} className={tool.color} />
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-widest ${tool.color}`}>{tool.name}</span>
                </div>

                {/* Hook */}
                <h2 className="font-display font-bold text-lg sm:text-xl md:text-2xl text-white mb-3 leading-snug">
                  {tool.hook}
                </h2>

                {/* Outcome */}
                <p className="text-white/50 text-sm mb-6 sm:mb-8 max-w-2xl leading-relaxed">
                  {tool.outcome}
                </p>

                <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
                  {/* Left: intro + steps */}
                  <div>
                    <p className="text-white/70 text-sm leading-relaxed mb-6">{tool.intro}</p>
                    <div className="space-y-3">
                      {tool.steps.map((step, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded-full ${tool.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                            <Check size={10} strokeWidth={3} className={tool.color} />
                          </div>
                          <p className="text-sm text-white/60 leading-relaxed">
                            <span className="text-white/30 font-semibold">Step {i + 1}: </span>
                            {step}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: proof + CTA */}
                  <div className="flex flex-col justify-between gap-6">
                    <div className={`${tool.bg} border ${tool.border} rounded-xl px-5 py-4 w-fit`}>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1 font-semibold">Social Proof</p>
                      <p className={`text-sm font-semibold ${tool.color}`}>{tool.proof}</p>
                    </div>
                    <button
                      onClick={() => navigate(tool.path)}
                      className={`w-full md:w-auto py-3 px-7 rounded-xl font-semibold text-sm transition-all border ${tool.border} ${tool.bg} ${tool.color} hover:brightness-110`}
                    >
                      {tool.cta} →
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="glass-strong rounded-2xl p-6 sm:p-10 text-center mt-8 sm:mt-10">
          <h3 className="font-display font-bold text-xl sm:text-2xl text-white mb-3">All tools. Free account. No credit card.</h3>
          <p className="text-white/50 text-sm mb-6 max-w-md mx-auto">
            Sign up and get instant access to every tool - plus the PM tool to manage your projects once you're ready to build.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="bg-white text-black font-semibold px-8 py-3 rounded-xl hover:bg-white/90 transition-colors text-sm"
          >
            Create free account
          </button>
        </div>
      </div>
    </div>
  )
}
