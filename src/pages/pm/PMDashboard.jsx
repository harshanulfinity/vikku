import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, LayoutDashboard, Lock, Users, Gift, CheckCircle, AlertTriangle, TrendingUp, Folder } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { getProjects, getTasks, getSharedProjects } from '../../lib/pmService'
import ProjectCard from '../../components/pm/ProjectCard'
import UpgradeModal from '../../components/pm/UpgradeModal'
import useSubscription from '../../hooks/useSubscription'
import AppHeader from '../../components/AppHeader'

const FREE_PROJECT_LIMIT = 3

export default function PMDashboard() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [sharedProjects, setSharedProjects] = useState([])
  const [taskCounts, setTaskCounts] = useState({})
  const [fetching, setFetching] = useState(true)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const { isPro, loading: subLoading } = useSubscription()

  useEffect(() => {
    if (!loading && !user) navigate('/login')
  }, [user, loading, navigate])

  useEffect(() => {
    if (!user) return
    async function load() {
      setFetching(true)
      const [data, shared] = await Promise.all([
        getProjects(user.id),
        getSharedProjects(user.id).catch(() => []),
      ])
      setProjects(data)
      setSharedProjects(shared)
      const counts = {}
      const allProjects = [...data, ...shared]
      await Promise.all(
        allProjects.map(async (p) => {
          const tasks = await getTasks(p.id)
          counts[p.id] = tasks.reduce((acc, t) => {
            acc[t.status] = (acc[t.status] || 0) + 1
            return acc
          }, {})
        })
      )
      setTaskCounts(counts)
      setFetching(false)
    }
    load()
  }, [user])

  const handleNewProject = () => {
    const activeCount = projects.filter((p) => p.status !== 'archived').length
    if (!isPro && activeCount >= FREE_PROJECT_LIMIT) {
      setShowUpgrade(true)
      return
    }
    navigate('/pm/projects/new')
  }

  if (loading || fetching || subLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  const active = projects.filter((p) => p.status === 'active').length
  const done = projects.filter((p) => p.status === 'completed').length
  const atLimit = !isPro && projects.filter((p) => p.status !== 'archived').length >= FREE_PROJECT_LIMIT

  // Aggregate stats across all projects
  const allCounts = Object.values(taskCounts)
  const totalTasks = allCounts.reduce((s, c) => s + Object.values(c).reduce((a, b) => a + b, 0), 0)
  const doneTasks = allCounts.reduce((s, c) => s + (c.done || 0), 0)
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  return (
    <div className="min-h-screen bg-black text-white">
      {showUpgrade && (
        <UpgradeModal
          reason="Free plan allows 3 active projects. Upgrade to Pro for unlimited projects."
          onClose={() => setShowUpgrade(false)}
          onUpgraded={() => { setShowUpgrade(false); window.location.reload() }}
        />
      )}

      <AppHeader
        breadcrumbs={[{ label: 'PM', href: '/pm' }, { label: 'Projects' }]}
        badge={
          !isPro ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowUpgrade(true)}
                className="text-[11px] text-yellow-400/80 hover:text-yellow-400 transition-colors border border-yellow-400/20 px-2.5 py-1 rounded-lg"
              >
                Free · Upgrade
              </button>
              <button
                onClick={() => navigate('/pm/refer')}
                className="flex items-center gap-1.5 text-[11px] text-white/30 hover:text-white/60 transition-colors border border-white/[0.06] px-2.5 py-1 rounded-lg"
              >
                <Gift size={11} /> Refer &amp; Earn
              </button>
            </div>
          ) : (
            <span className="text-[11px] text-white/30 border border-white/[0.08] px-2.5 py-1 rounded-lg">Pro</span>
          )
        }
      />

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Page header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-display font-extrabold text-3xl text-white mb-2">My Projects</h1>
            <div className="flex items-center gap-4 text-xs text-white/40">
              <span>{projects.length} total</span>
              <span>{active} active</span>
              <span>{done} completed</span>
              {!isPro && (
                <span className="text-yellow-400/60">{FREE_PROJECT_LIMIT - Math.min(projects.length, FREE_PROJECT_LIMIT)} of {FREE_PROJECT_LIMIT} free slots remaining</span>
              )}
            </div>
          </div>
          <button
            onClick={handleNewProject}
            className={`flex items-center gap-2 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors ${
              atLimit
                ? 'bg-white/10 text-white/50 hover:bg-white/15'
                : 'bg-white text-black hover:bg-white/90'
            }`}
          >
            {atLimit ? <Lock size={14} /> : <Plus size={16} />}
            New Project
          </button>
        </div>

        {/* Stats cards */}
        {projects.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                <Folder size={14} className="text-white/50" />
              </div>
              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Projects</p>
                <p className="text-lg font-bold text-white">{projects.length}</p>
              </div>
            </div>
            <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                <CheckCircle size={14} className="text-green-400" />
              </div>
              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Tasks Done</p>
                <p className="text-lg font-bold text-white">{doneTasks}<span className="text-xs text-white/30 font-normal ml-1">/ {totalTasks}</span></p>
              </div>
            </div>
            <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                <TrendingUp size={14} className="text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Completion</p>
                <p className="text-lg font-bold text-white">{completionRate}%</p>
              </div>
            </div>
            <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={14} className="text-yellow-400" />
              </div>
              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Active</p>
                <p className="text-lg font-bold text-white">{active}</p>
              </div>
            </div>
          </div>
        )}

        {/* Limit banner */}
        {atLimit && (
          <div className="mb-6 flex items-center justify-between glass rounded-xl px-5 py-4 border border-yellow-400/10">
            <p className="text-sm text-white/60">
              You've reached the <span className="text-white font-medium">3-project free limit</span>.
            </p>
            <button
              onClick={() => setShowUpgrade(true)}
              className="text-xs text-yellow-400 hover:text-yellow-300 font-semibold transition-colors"
            >
              Upgrade to Pro →
            </button>
          </div>
        )}

        {/* My Projects grid */}
        {projects.length === 0 ? (
          <div className="glass rounded-2xl p-16 text-center">
            <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mx-auto mb-5">
              <LayoutDashboard size={28} className="text-white/30" />
            </div>
            <h3 className="font-display font-semibold text-white text-lg mb-2">No projects yet</h3>
            <p className="text-white/40 text-sm mb-6 max-w-sm mx-auto">
              Create your first project to start tracking tasks, milestones, and client progress.
            </p>
            <button
              onClick={() => navigate('/pm/projects/new')}
              className="bg-white text-black font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-white/90 transition-colors"
            >
              Create first project
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} taskCounts={taskCounts[p.id] || {}} />
            ))}
            {/* Add new card */}
            <div
              onClick={handleNewProject}
              className={`glass rounded-2xl p-5 cursor-pointer hover:border-white/20 transition-all flex flex-col items-center justify-center gap-3 min-h-[180px] border-dashed ${atLimit ? 'opacity-50' : ''}`}
            >
              <div className="w-10 h-10 rounded-xl glass flex items-center justify-center">
                {atLimit ? <Lock size={16} className="text-white/40" /> : <Plus size={18} className="text-white/40" />}
              </div>
              <p className="text-xs text-white/40">{atLimit ? 'Upgrade to add more' : 'New project'}</p>
            </div>
          </div>
        )}

        {/* Shared with me */}
        {sharedProjects.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center gap-2 mb-4">
              <Users size={14} className="text-white/30" />
              <h2 className="font-display font-semibold text-white/60 text-sm">Shared with me</h2>
              <span className="text-xs text-white/20">({sharedProjects.length})</span>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sharedProjects.map((p) => (
                <ProjectCard key={p.id} project={p} taskCounts={taskCounts[p.id] || {}} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
