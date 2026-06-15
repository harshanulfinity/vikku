import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { DollarSign, Clock, LayoutDashboard, TrendingUp, Kanban, ArrowRight } from 'lucide-react'
import AppHeader from '../components/AppHeader'

export default function Dashboard() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const tools = [
    {
      icon: DollarSign,
      title: 'AI Cost Estimator',
      description: 'Get accurate project cost estimates in your local currency',
      status: 'Available',
      comingSoon: false,
      path: '/dashboard/cost-estimator',
    },
    {
      icon: TrendingUp,
      title: 'ROI Calculator',
      description: 'See how much revenue you\'re losing without a website — and how fast it pays back',
      status: 'Available',
      comingSoon: false,
      path: '/dashboard/roi-calculator',
    },
    {
      icon: Clock,
      title: 'Project Timeline Calculator',
      description: 'Get a realistic timeline with phase breakdown and milestones',
      status: 'Available',
      comingSoon: false,
      path: '/dashboard/timeline-calculator',
    },
    {
      icon: LayoutDashboard,
      title: 'Tech Stack Recommender',
      description: 'Get an AI architect\'s pick for the best tech stack for your project',
      status: 'Available',
      comingSoon: false,
      path: '/dashboard/tech-recommender',
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <AppHeader breadcrumbs={[{ label: 'AI Tools' }]} />

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h2 className="font-display font-extrabold text-3xl text-white mb-3">AI Tools</h2>
          <p className="text-white/60 text-sm max-w-xl">
            Access powerful AI-powered tools to help you plan, estimate, and build your projects.
          </p>
        </div>

        {/* PM Tool banner */}
        <div
          onClick={() => navigate('/pm')}
          className="mb-8 glass rounded-2xl p-6 cursor-pointer hover:border-white/20 transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
              <Kanban size={22} className="text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-display font-semibold text-white">Vikku PM — Project Management</h3>
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/60">New</span>
              </div>
              <p className="text-sm text-white/50">Manage client projects, tasks & milestones. AI planning + client share links.</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-white/30 group-hover:text-white transition-colors flex-shrink-0 ml-4" />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <div
                key={tool.title}
                className={`glass rounded-2xl p-6 group transition-all ${
                  tool.comingSoon ? 'opacity-60' : 'hover:border-white/20 cursor-pointer'
                }`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl glass flex items-center justify-center flex-shrink-0">
                    <Icon size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-semibold text-lg text-white">{tool.title}</h3>
                      {tool.comingSoon && (
                        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/60">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/60">{tool.description}</p>
                  </div>
                </div>
                {!tool.comingSoon && (
                  <button
                    onClick={() => navigate(tool.path)}
                    className="w-full bg-white text-black font-semibold py-2.5 rounded-xl hover:bg-white/90 transition-colors text-sm"
                  >
                    Open Tool
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Stats section */}
        <div className="mt-12 glass rounded-2xl p-6">
          <h3 className="font-display font-semibold text-lg text-white mb-4">Your Usage</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white mb-1">0</p>
              <p className="text-xs text-white/60">Tools Used</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white mb-1">0</p>
              <p className="text-xs text-white/60">Estimates Generated</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white mb-1">Free</p>
              <p className="text-xs text-white/60">Plan</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
