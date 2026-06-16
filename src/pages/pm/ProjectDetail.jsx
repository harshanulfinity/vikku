import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Share2, Trash2, Copy, Check, LayoutDashboard, GitBranch, BarChart2, Calendar, Lock, UserPlus } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { getProject, getTasks, getMilestones, deleteProject } from '../../lib/pmService'
import KanbanBoard from '../../components/pm/KanbanBoard'
import MilestoneList from '../../components/pm/MilestoneList'
import TimelineView from '../../components/pm/TimelineView'
import CalendarView from '../../components/pm/CalendarView'
import AnalyticsPanel from '../../components/pm/AnalyticsPanel'
import AIAssistant from '../../components/pm/AIAssistant'
import InviteMemberModal from '../../components/pm/InviteMemberModal'
import MembersPanel from '../../components/pm/MembersPanel'
import useSubscription from '../../hooks/useSubscription'
import UpgradeModal from '../../components/pm/UpgradeModal'
import AppHeader from '../../components/AppHeader'

const TABS = [
  { key: 'kanban',    label: 'Kanban',    icon: LayoutDashboard },
  { key: 'timeline',  label: 'Timeline',  icon: GitBranch },
  { key: 'analytics', label: 'Analytics', icon: BarChart2, pro: true },
  { key: 'calendar',  label: 'Calendar',  icon: Calendar },
]

const UPGRADE_REASONS = {
  share:     'Client share links are Pro-only. Share a read-only link with clients — no login needed.',
  ai:        'AI Project Planner is a Pro feature. Describe your project and get tasks + milestones in seconds.',
  analytics: 'Project analytics are available on Pro. Track completion rates, priority breakdown, and more.',
}

export default function ProjectDetail() {
  const { id } = useParams()
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [milestones, setMilestones] = useState([])
  const [fetching, setFetching] = useState(true)
  const [activeTab, setActiveTab] = useState('kanban')
  const [shareTab, setShareTab] = useState(false)
  const [copied, setCopied] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState('')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const { isPro } = useSubscription()

  useEffect(() => {
    if (!loading && !user) navigate('/login')
  }, [user, loading, navigate])

  useEffect(() => {
    if (!user || !id) return
    async function load() {
      setFetching(true)
      const [p, t, m] = await Promise.all([getProject(id), getTasks(id), getMilestones(id)])
      if (!p) { navigate('/pm/dashboard'); return }
      setProject(p)
      setTasks(t)
      setMilestones(m)
      setFetching(false)
    }
    load()
  }, [user, id, navigate])

  const triggerUpgrade = (reason) => {
    setUpgradeReason(UPGRADE_REASONS[reason] || '')
    setShowUpgrade(true)
  }

  const handleTabClick = (tab) => {
    if (tab.pro && !isPro) { triggerUpgrade(tab.key); return }
    setActiveTab(tab.key)
  }

  const shareUrl = project ? `${window.location.origin}/pm/share/${project.share_token}` : ''

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${project.name}"? This will delete all tasks and milestones too. This cannot be undone.`)) return
    setDeleting(true)
    await deleteProject(id)
    navigate('/pm/dashboard')
  }

  const totalTasks = tasks.length
  const doneTasks = tasks.filter((t) => t.status === 'done').length
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (!project) return null

  return (
    <div className="min-h-screen bg-black text-white">
      {showUpgrade && (
        <UpgradeModal
          reason={upgradeReason}
          onClose={() => setShowUpgrade(false)}
          onUpgraded={() => { setShowUpgrade(false); window.location.reload() }}
        />
      )}

      {showInviteModal && (
        <InviteMemberModal
          projectId={id}
          projectName={project.name}
          onClose={() => setShowInviteModal(false)}
          onInvited={() => {
            setShowInviteModal(false)
          }}
        />
      )}

      <AppHeader
        breadcrumbs={[
          { label: 'PM', href: '/pm' },
          { label: 'Projects', href: '/pm/dashboard' },
          { label: project.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors"
            >
              <UserPlus size={14} />
              <span className="hidden sm:inline">Invite</span>
            </button>
            <AIAssistant
              projectId={id}
              projectName={project.name}
              isPro={isPro}
              onDone={async () => {
                const [t, m] = await Promise.all([getTasks(id), getMilestones(id)])
                setTasks(t)
                setMilestones(m)
              }}
            />
            <button
              onClick={() => isPro ? setShareTab(!shareTab) : triggerUpgrade('share')}
              className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors"
            >
              <Share2 size={14} />
              <span className="hidden sm:inline">Share</span>
              {!isPro && <span className="text-[10px] text-yellow-400/60">Pro</span>}
            </button>
          </div>
        }
      />

      {/* Share panel */}
      {shareTab && (
        <div className="border-b border-white/[0.05] bg-white/[0.02] px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <p className="text-xs text-white/50 mb-2">Client share link — anyone with this link can view the project (read-only, no login needed)</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs text-white/70 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 truncate">
                {shareUrl}
              </code>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs bg-white text-black px-3 py-2 rounded-lg font-medium hover:bg-white/90 transition-colors flex-shrink-0"
              >
                {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy link</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Progress bar */}
        <div className="glass rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4 text-xs text-white/50">
              <span>{doneTasks}/{totalTasks} tasks done</span>
              {project.client_name && <span>Client: {project.client_name}</span>}
              <span className="capitalize">{project.status}</span>
            </div>
            <span className="text-sm font-bold text-white">{progress}%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 w-fit">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.key
            const locked = tab.pro && !isPro
            return (
              <button
                key={tab.key}
                onClick={() => handleTabClick(tab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  active
                    ? 'bg-white text-black'
                    : 'text-white/40 hover:text-white/80'
                }`}
              >
                <Icon size={12} />
                {tab.label}
                {locked && <Lock size={9} className="text-yellow-400/60" />}
              </button>
            )
          })}
        </div>

        {/* Main + Sidebar */}
        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            {activeTab === 'kanban' && (
              <KanbanBoard projectId={id} tasks={tasks} onTasksChange={setTasks} />
            )}
            {activeTab === 'timeline' && (
              <TimelineView milestones={milestones} onMilestonesChange={setMilestones} />
            )}
            {activeTab === 'analytics' && (
              <AnalyticsPanel tasks={tasks} milestones={milestones} />
            )}
            {activeTab === 'calendar' && (
              <CalendarView tasks={tasks} milestones={milestones} />
            )}
          </div>

          {/* Sidebar */}
          <div className="w-64 flex-shrink-0 space-y-4">
            <div className="glass rounded-2xl p-5">
              <MilestoneList projectId={id} milestones={milestones} onMilestonesChange={setMilestones} />
            </div>

            <div className="glass rounded-2xl p-5">
              <MembersPanel
                projectId={id}
                ownerUserId={project.user_id}
                currentUserId={user?.id}
              />
            </div>

            {project.description && (
              <div className="glass rounded-2xl p-5">
                <p className="text-xs text-white/40 mb-2">About</p>
                <p className="text-xs text-white/70 leading-relaxed">{project.description}</p>
              </div>
            )}

            <div className="glass rounded-2xl p-5">
              <p className="text-xs text-white/40 mb-3">Danger zone</p>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 text-xs text-red-400/70 hover:text-red-400 transition-colors disabled:opacity-40"
              >
                <Trash2 size={12} /> {deleting ? 'Deleting...' : 'Delete project'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
