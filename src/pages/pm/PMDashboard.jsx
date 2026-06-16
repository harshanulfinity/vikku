import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, LayoutDashboard, Lock, Users, Gift, CheckCircle, AlertTriangle, TrendingUp, Folder, CalendarClock, ChevronDown, ChevronUp, Zap } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { getProjects, getTasks, getSharedProjects } from '../../lib/pmService'
import ProjectCard from '../../components/pm/ProjectCard'
import UpgradeModal from '../../components/pm/UpgradeModal'
import QuickAdd from '../../components/pm/QuickAdd'
import useSubscription from '../../hooks/useSubscription'
import AppHeader from '../../components/AppHeader'

const FREE_PROJECT_LIMIT = 3

export default function PMDashboard() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [sharedProjects, setSharedProjects] = useState([])
  const [taskCounts, setTaskCounts] = useState({})
  const [allTasks, setAllTasks] = useState([])
  const [fetching, setFetching] = useState(true)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [showMyTasks, setShowMyTasks] = useState(true)
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
      const collected = []
      const allProjects = [...data, ...shared]
      await Promise.all(
        allProjects.map(async (p) => {
          const tasks = await getTasks(p.id)
          counts[p.id] = tasks.reduce((acc, t) => {
            acc[t.status] = (acc[t.status] || 0) + 1
            return acc
          }, {})
          tasks.forEach((t) => collected.push({ ...t, _projectName: p.name }))
        })
      )
      setTaskCounts(counts)
      setAllTasks(collected)
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

  // My Tasks grouping
  const todayStr = new Date().toISOString().slice(0, 10)
  const nextWeekStr = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const pendingTasks = allTasks.filter((t) => t.status !== 'done')
  const overdueGroup = pendingTasks.filter((t) => t.due_date && t.due_date < todayStr)
  const todayGroup = pendingTasks.filter((t) => t.due_date === todayStr)
  const weekGroup = pendingTasks.filter((t) => t.due_date && t.due_date > todayStr && t.due_date <= nextWeekStr)
  const unscheduledGroup = pendingTasks.filter((t) => !t.due_date)
  const myTaskGroups = [
    { label: 'Overdue', tasks: overdueGroup, color: 'text-red-400', dotColor: 'bg-red-400' },
    { label: 'Due Today', tasks: todayGroup, color: 'text-yellow-400', dotColor: 'bg-yellow-400' },
    { label: 'This Week', tasks: weekGroup, color: 'text-blue-400', dotColor: 'bg-blue-400' },
    { label: 'Unscheduled', tasks: unscheduledGroup, color: 'text-white/40', dotColor: 'bg-white/30' },
  ].filter((g) => g.tasks.length > 0)

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
              <ProjectCard
                key={p.id}
                project={p}
                taskCounts={taskCounts[p.id] || {}}
                onDuplicated={(newP) => setProjects((prev) => [newP, ...prev])}
              />
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

        {/* My Tasks - cross-project task view */}
        {pendingTasks.length > 0 && (
          <div className="mt-12">
            <button
              onClick={() => setShowMyTasks((v) => !v)}
              className="flex items-center gap-2 mb-5 group w-full"
            >
              <CalendarClock size={14} className="text-white/30" />
              <h2 className="font-display font-semibold text-white/60 text-sm group-hover:text-white/80 transition-colors">My Tasks</h2>
              <span className="text-xs text-white/20">({pendingTasks.length} pending)</span>
              <div className="ml-auto text-white/20 group-hover:text-white/40 transition-colors">
                {showMyTasks ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
            </button>

            {showMyTasks && (
              <div className="space-y-6">
                {myTaskGroups.map(({ label, tasks, color, dotColor }) => (
                  <div key={label}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                      <span className={`text-xs font-semibold ${color}`}>{label}</span>
                      <span className="text-[10px] text-white/20">({tasks.length})</span>
                    </div>
                    <div className="space-y-1.5">
                      {tasks.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => navigate(`/pm/projects/${t.project_id}`)}
                          className="glass rounded-xl px-4 py-2.5 flex items-center gap-3 cursor-pointer hover:border-white/20 transition-all group/task"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-white font-medium truncate">{t.title}</p>
                          </div>
                          <span className="text-[10px] text-white/25 flex-shrink-0 group-hover/task:text-white/50 transition-colors">
                            {t._projectName}
                          </span>
                          {t.due_date && (
                            <span className={`text-[10px] flex-shrink-0 ${t.due_date < todayStr ? 'text-red-400/70' : 'text-white/30'}`}>
                              {new Date(t.due_date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 ${
                            t.status === 'in_progress' ? 'bg-blue-500/15 text-blue-400'
                            : t.status === 'review' ? 'bg-yellow-500/15 text-yellow-400'
                            : 'bg-white/[0.06] text-white/30'
                          }`}>
                            {t.status.replace('_', ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Add hint */}
        <div className="mt-8 flex items-center justify-center gap-2 text-white/20 text-xs">
          <Zap size={11} />
          <span>Press <kbd className="border border-white/10 rounded px-1 py-0.5 text-[10px]">{typeof navigator !== 'undefined' && navigator.platform?.includes('Mac') ? '⌘K' : 'Ctrl+K'}</kbd> to quick-add a task anywhere</span>
        </div>
      </div>
      <QuickAdd />
    </div>
  )
}
