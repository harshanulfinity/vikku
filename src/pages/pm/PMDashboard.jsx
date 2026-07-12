import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, LayoutDashboard, Lock, Users, Gift, CheckCircle, AlertTriangle, TrendingUp, Folder, CalendarClock, ChevronDown, ChevronUp, Zap, Mail, Settings, X, CreditCard, Sparkles, HardDrive } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { getProjects, getTasks, getSharedProjects, getStorageUsedMb } from '../../lib/pmService'
import { STORAGE_LIMITS_MB } from '../../lib/entitlements'
import { sendWeeklyDigest } from '../../lib/openaiService'
import useLockBodyScroll from '../../hooks/useLockBodyScroll'

import ProjectCard from '../../components/pm/ProjectCard'
import UpgradeModal from '../../components/pm/UpgradeModal'
import QuickAdd from '../../components/pm/QuickAdd'
import useSubscription from '../../hooks/useSubscription'
import AppHeader from '../../components/AppHeader'

const FREE_PROJECT_LIMIT = 3
const MY_TASKS_LIMIT = 6

export default function PMDashboard() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [sharedProjects, setSharedProjects] = useState([])
  const [taskCounts, setTaskCounts] = useState({})
  const [allTasks, setAllTasks] = useState([])
  const [fetching, setFetching] = useState(true)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [pendingCycle, setPendingCycle] = useState('monthly')
  const [showManageSub, setShowManageSub] = useState(false)
  useLockBodyScroll(showManageSub)
  const [showMyTasks, setShowMyTasks] = useState(true)
  const [showAllTasks, setShowAllTasks] = useState(false)
  const [sendingDigest, setSendingDigest] = useState(false)
  const [digestSent, setDigestSent] = useState(false)
  const [storageUsedMb, setStorageUsedMb] = useState(null)
  const { isPro, plan, subscription, setSubscription, loading: subLoading } = useSubscription()

  // Auto-show upgrade modal if user signed up via a plan CTA
  useEffect(() => {
    const pending = sessionStorage.getItem('vikku_pending_plan')
    if (pending && user) {
      sessionStorage.removeItem('vikku_pending_plan')
      const cycle = sessionStorage.getItem('vikku_pending_cycle')
      if (cycle) { setPendingCycle(cycle); sessionStorage.removeItem('vikku_pending_cycle') }
      setShowUpgrade(true)
    }
  }, [user])


  const handleSendDigest = async () => {
    setSendingDigest(true)
    try {
      await sendWeeklyDigest(user.id)
      setDigestSent(true)
      setTimeout(() => setDigestSent(false), 4000)
    } catch (err) {
      console.error('Digest error:', err)
    } finally {
      setSendingDigest(false)
    }
  }

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
          tasks.forEach((t) => collected.push({ ...t, _projectName: p.name, _projectSlug: p.slug || p.id }))
        })
      )
      setTaskCounts(counts)
      setAllTasks(collected)
      setFetching(false)
    }
    load()
    getStorageUsedMb(user.id).then(setStorageUsedMb)
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
          currentPlan={plan}
          initialBillingCycle={pendingCycle}
          reason={plan === 'pro' ? 'Upgrade to Team for unlimited members across your projects.' : 'Free plan allows 3 active projects. Upgrade to Pro for unlimited projects.'}
          onClose={() => setShowUpgrade(false)}
          onUpgraded={() => { setShowUpgrade(false); window.location.reload() }}
        />
      )}

      {/* Manage Subscription Modal */}
      {showManageSub && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => { setShowManageSub(false) }}
        >
          <div
            className="w-full max-w-[300px] bg-[#111] border border-white/10 rounded-2xl p-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-bold text-white text-sm">My Subscription</h2>
              <button onClick={() => { setShowManageSub(false) }} className="text-white/60 hover:text-white transition-colors" aria-label="Close">
                <X size={15} />
              </button>
            </div>

            <div className="glass rounded-xl p-3 mb-2.5">
              <div className="flex items-center justify-between mb-2.5">
                <div>
                  <p className="text-[10px] text-white/60 uppercase tracking-wider mb-0.5">Current plan</p>
                  <p className="font-display font-bold text-white capitalize text-sm">{plan}</p>
                </div>
                <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <CreditCard size={13} className="text-violet-400" />
                </div>
              </div>
              {subscription?.current_period_end && (
                <div>
                  <p className="text-[10px] text-white/60 uppercase tracking-wider mb-0.5">Access until</p>
                  <p className="text-xs text-white">
                    {new Date(subscription.current_period_end).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-[10px] text-white/60 mt-2">One-time plan - it won't auto-renew. Pay again before this date to keep access.</p>
                </div>
              )}
            </div>

            {plan === 'pro' && subscription?.status !== 'cancelling' && (
              <button
                onClick={() => { setShowManageSub(false); setShowUpgrade(true) }}
                className="w-full text-xs font-semibold text-white bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 rounded-xl py-2 mb-2 transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles size={12} className="text-violet-400" />
                Upgrade to Team - ₹999/mo
              </button>
            )}

            <button
              onClick={() => { setShowManageSub(false); setShowUpgrade(true) }}
              className="w-full text-xs font-semibold text-white/70 hover:text-white transition-colors py-2 border border-white/[0.06] rounded-xl"
            >
              Renew {plan === 'team' ? 'Team' : 'Pro'}
            </button>
          </div>
        </div>
      )}

      <AppHeader
        breadcrumbs={[{ label: 'PM', href: '/pm' }, { label: 'Projects' }]}
        badge={
          !isPro ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setShowUpgrade(true)}
                className="text-[11px] text-yellow-400 hover:text-yellow-300 transition-colors border border-yellow-400/30 px-2 sm:px-2.5 py-1 rounded-lg whitespace-nowrap"
              >
                <span className="hidden sm:inline">Free · </span>Upgrade
              </button>
              <button
                onClick={() => navigate('/pm/refer')}
                className="flex items-center gap-1.5 text-[11px] text-white/60 hover:text-white transition-colors border border-white/10 px-2 sm:px-2.5 py-1 rounded-lg whitespace-nowrap"
                aria-label="Refer & Earn"
                title="Refer & Earn"
              >
                <Gift size={11} className="flex-shrink-0" /> <span className="hidden sm:inline">Refer &amp; Earn</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => navigate('/pm/refer')}
                className="flex items-center gap-1.5 text-[11px] text-white/60 hover:text-white transition-colors border border-white/10 px-2 sm:px-2.5 py-1 rounded-lg whitespace-nowrap"
                aria-label="Refer & Earn"
                title="Refer & Earn"
              >
                <Gift size={11} className="flex-shrink-0" /> <span className="hidden sm:inline">Refer &amp; Earn</span>
              </button>
              <button
                onClick={() => setShowManageSub(true)}
                className="flex items-center gap-1.5 text-[11px] text-white/60 hover:text-white border border-white/10 hover:border-white/20 px-2 sm:px-2.5 py-1 rounded-lg transition-all capitalize whitespace-nowrap"
                aria-label={`${plan} plan, manage subscription`}
                title="Manage subscription"
              >
                <Settings size={10} className="flex-shrink-0" /> <span className="hidden sm:inline">{plan} · Manage</span>
              </button>
            </div>
          )
        }
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Page header */}
        <div className="flex items-start justify-between gap-3 mb-6 sm:mb-8">
          <div className="min-w-0">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white mb-1.5 sm:mb-2">My Projects</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/60">
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
            className={`flex items-center gap-1.5 sm:gap-2 font-semibold text-xs sm:text-sm px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl transition-colors flex-shrink-0 ${
              atLimit
                ? 'bg-white/10 text-white/50 hover:bg-white/15'
                : 'bg-white text-black hover:bg-white/90'
            }`}
          >
            {atLimit ? <Lock size={14} /> : <Plus size={15} />}
            <span className="hidden sm:inline">New </span>Project
          </button>
        </div>

        {/* Stats cards */}
        {projects.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                <Folder size={14} className="text-white/60" />
              </div>
              <div>
                <p className="text-[10px] text-white/60 uppercase tracking-wider">Projects</p>
                <p className="text-lg font-bold text-white">{projects.length}</p>
              </div>
            </div>
            <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                <CheckCircle size={14} className="text-green-400" />
              </div>
              <div>
                <p className="text-[10px] text-white/60 uppercase tracking-wider">Tasks Done</p>
                <p className="text-lg font-bold text-white">{doneTasks}<span className="text-xs text-white/50 font-normal ml-1">/ {totalTasks}</span></p>
              </div>
            </div>
            <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                <TrendingUp size={14} className="text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] text-white/60 uppercase tracking-wider">Completion</p>
                <p className="text-lg font-bold text-white">{completionRate}%</p>
              </div>
            </div>
            <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={14} className="text-yellow-400" />
              </div>
              <div>
                <p className="text-[10px] text-white/60 uppercase tracking-wider">Active</p>
                <p className="text-lg font-bold text-white">{active}</p>
              </div>
            </div>
          </div>
        )}

        {/* Storage usage bar */}
        {storageUsedMb !== null && (() => {
          const limitMb = STORAGE_LIMITS_MB[plan] || STORAGE_LIMITS_MB.free
          const pct = Math.min(Math.round((storageUsedMb / limitMb) * 100), 100)
          const nearLimit = pct >= 80
          return (
            <div className={`mb-4 glass rounded-xl px-4 py-3 flex items-center gap-4 ${nearLimit ? 'border border-yellow-400/15' : ''}`}>
              <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                <HardDrive size={14} className={nearLimit ? 'text-yellow-400' : 'text-white/60'} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] text-white/60 uppercase tracking-wider">Storage</p>
                  <p className="text-[10px] text-white/70">
                    {storageUsedMb} MB / {limitMb >= 1024 ? `${limitMb / 1024} GB` : `${limitMb} MB`}
                  </p>
                </div>
                <div
                  className="h-1.5 rounded-full bg-white/10 overflow-hidden"
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Storage used"
                >
                  <div
                    className={`h-full rounded-full transition-all ${nearLimit ? 'bg-yellow-400' : 'bg-white/70'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              {nearLimit && !isPro && (
                <button
                  onClick={() => setShowUpgrade(true)}
                  className="text-[10px] font-semibold text-yellow-400 border border-yellow-400/30 hover:bg-yellow-400/10 px-2.5 py-1.5 rounded-lg transition-colors flex-shrink-0"
                >
                  Upgrade
                </button>
              )}
            </div>
          )
        })()}

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

        {/* My Projects - grouped by status */}
        {projects.length === 0 ? (
          <div className="glass rounded-2xl flex flex-col items-center justify-center text-center py-12 px-6 sm:py-14 min-h-[280px]">
            <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center mb-4">
              <LayoutDashboard size={24} className="text-white/50" />
            </div>
            <h3 className="font-display font-semibold text-white text-lg mb-2">No projects yet</h3>
            <p className="text-white/60 text-sm mb-6 max-w-xs">
              Create your first project to start tracking tasks, milestones, and client progress.
            </p>
            <button
              onClick={() => navigate('/pm/projects/new')}
              className="flex items-center gap-1.5 sm:gap-2 bg-white text-black font-semibold text-xs sm:text-sm px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl hover:bg-white/90 transition-colors"
            >
              <Plus size={15} /> Create first project
            </button>
          </div>
        ) : (
          <>
            {[
              { key: 'active',    label: 'Active',    dotColor: 'bg-green-400' },
              { key: 'on_hold',   label: 'On Hold',   dotColor: 'bg-yellow-400' },
              { key: 'completed', label: 'Completed', dotColor: 'bg-blue-400' },
              { key: 'archived',  label: 'Archived',  dotColor: 'bg-white/20' },
            ].map(({ key, label, dotColor }) => {
              const group = projects.filter((p) => (p.status || 'active') === key)
              if (group.length === 0) return null
              return (
                <div key={key} className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-2 h-2 rounded-full ${dotColor}`} />
                    <h2 className="font-display font-semibold text-white/60 text-sm">{label}</h2>
                    <span className="text-xs text-white/40">({group.length})</span>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.map((p) => (
                      <ProjectCard
                        key={p.id}
                        project={p}
                        taskCounts={taskCounts[p.id] || {}}
                        onDuplicated={(newP) => setProjects((prev) => [newP, ...prev])}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
            {/* Add new card */}
            <div
              onClick={handleNewProject}
              className={`glass rounded-2xl p-5 cursor-pointer hover:border-white/20 transition-all flex flex-col items-center justify-center gap-3 min-h-[140px] border-dashed ${atLimit ? 'opacity-50' : ''}`}
            >
              <div className="w-10 h-10 rounded-xl glass flex items-center justify-center">
                {atLimit ? <Lock size={16} className="text-white/50" /> : <Plus size={18} className="text-white/50" />}
              </div>
              <p className="text-xs text-white/50">{atLimit ? 'Upgrade to add more' : 'New project'}</p>
            </div>
          </>
        )}

        {/* Shared with me */}
        {sharedProjects.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center gap-2 mb-4">
              <Users size={14} className="text-white/30" />
              <h2 className="font-display font-semibold text-white/60 text-sm">Shared with me</h2>
              <span className="text-xs text-white/40">({sharedProjects.length})</span>
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
              <span className="text-xs text-white/40">({pendingTasks.length} pending)</span>
              <div className="ml-auto text-white/30 group-hover:text-white/50 transition-colors">
                {showMyTasks ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
            </button>

            {showMyTasks && (() => {
              // Cap the number of task rows shown across all groups until "Show more"
              let budget = showAllTasks ? Infinity : MY_TASKS_LIMIT
              return (
              <div className="space-y-6">
                {myTaskGroups.map(({ label, tasks, color, dotColor }) => {
                  const visibleTasks = showAllTasks ? tasks : tasks.slice(0, Math.max(0, budget))
                  budget -= visibleTasks.length
                  if (visibleTasks.length === 0) return null
                  return (
                  <div key={label}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                      <span className={`text-xs font-semibold ${color}`}>{label}</span>
                      <span className="text-[10px] text-white/40">({tasks.length})</span>
                    </div>
                    <div className="space-y-1.5">
                      {visibleTasks.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => navigate(`/pm/projects/${t._projectSlug || t.project_id}`)}
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
                  )
                })}

                {pendingTasks.length > MY_TASKS_LIMIT && (
                  <button
                    onClick={() => setShowAllTasks((v) => !v)}
                    className="w-full flex items-center justify-center gap-1 text-xs text-white/40 hover:text-white/70 border border-white/[0.06] hover:border-white/15 rounded-xl py-2 transition-all"
                  >
                    {showAllTasks ? (
                      <>Show less <ChevronUp size={13} /></>
                    ) : (
                      <>Show {pendingTasks.length - MY_TASKS_LIMIT} more <ChevronDown size={13} /></>
                    )}
                  </button>
                )}
              </div>
              )
            })()}
          </div>
        )}

        {/* Quick Add hint + Weekly digest */}
        <div className="mt-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white/50 text-xs">
            <Zap size={11} />
            <span>Press <kbd className="border border-white/10 rounded px-1 py-0.5 text-[10px]">{typeof navigator !== 'undefined' && navigator.platform?.includes('Mac') ? '⌘K' : 'Ctrl+K'}</kbd> to quick-add a task anywhere</span>
          </div>
          {projects.length > 0 && (
            <button
              onClick={handleSendDigest}
              disabled={sendingDigest || digestSent}
              className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 border border-white/[0.06] hover:border-white/20 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
            >
              <Mail size={11} />
              {digestSent ? 'Digest sent!' : sendingDigest ? 'Sending...' : 'Send weekly digest'}
            </button>
          )}
        </div>
      </div>
      <QuickAdd />
    </div>
  )
}
