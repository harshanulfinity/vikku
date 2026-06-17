import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Share2, Trash2, Copy, Check, LayoutDashboard, GitBranch, BarChart2, Calendar, Lock, UserPlus, FileDown, Search, X as XIcon, Receipt, Timer, Sparkles, MessageSquare, AlertCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { getProject, getTasks, getMilestones, deleteProject, getProjectTimeLogs, getClientComments } from '../../lib/pmService'
import { supabase } from '../../lib/supabaseClient'
import KanbanBoard from '../../components/pm/KanbanBoard'
import MilestoneList from '../../components/pm/MilestoneList'
import TimelineView from '../../components/pm/TimelineView'
import CalendarView from '../../components/pm/CalendarView'
import AnalyticsPanel from '../../components/pm/AnalyticsPanel'
import AIAssistant from '../../components/pm/AIAssistant'
import InviteMemberModal from '../../components/pm/InviteMemberModal'
import MembersPanel from '../../components/pm/MembersPanel'
import ActivityFeed from '../../components/pm/ActivityFeed'
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
  share:     'Client share links are Pro-only. Share a read-only link with clients - no login needed.',
  ai:        'AI Project Planner is a Pro feature. Describe your project and get tasks + milestones in seconds.',
  analytics: 'Project analytics are available on Pro. Track completion rates, priority breakdown, and more.',
}

export default function ProjectDetail() {
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const aiRef = useRef(null)
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
  const [searchQuery, setSearchQuery] = useState('')
  const [overdueOnly, setOverdueOnly] = useState(false)
  const [showOnboard, setShowOnboard] = useState(false)
  const [clientComments, setClientComments] = useState([])
  const [seenCommentCount, setSeenCommentCount] = useState(0)
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
      if (p.share_token) getClientComments(p.share_token).then((comments) => {
        setClientComments(comments)
        setSeenCommentCount(Number(localStorage.getItem(`seen_comments_${id}`) || 0))
      })
      if (searchParams.get('onboard') === '1') {
        setShowOnboard(true)
        setSearchParams({}, { replace: true })
      }
    }
    load()
  }, [user, id, navigate])

  useEffect(() => {
    if (!id || !supabase) return
    const channel = supabase
      .channel(`tasks_${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pm_tasks', filter: `project_id=eq.${id}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTasks((prev) => prev.some((t) => t.id === payload.new.id) ? prev : [...prev, payload.new])
        } else if (payload.eventType === 'UPDATE') {
          setTasks((prev) => prev.map((t) => t.id === payload.new.id ? { ...t, ...payload.new } : t))
        } else if (payload.eventType === 'DELETE') {
          setTasks((prev) => prev.filter((t) => t.id !== payload.old.id))
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [id])

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

  const handleExportPDF = () => {
    const done = tasks.filter((t) => t.status === 'done').length
    const total = tasks.length
    const pct = total > 0 ? Math.round((done / total) * 100) : 0
    const win = window.open('', '_blank')
    win.document.write(`<!DOCTYPE html><html><head><title>${project.name} - Project Report</title>
    <style>
      body{font-family:system-ui,sans-serif;background:#fff;color:#111;padding:40px;max-width:700px;margin:0 auto}
      h1{font-size:24px;font-weight:800;margin-bottom:4px}
      .meta{color:#888;font-size:13px;margin-bottom:32px}
      .stat-row{display:flex;gap:24px;margin-bottom:32px}
      .stat{background:#f5f5f5;border-radius:12px;padding:16px 20px;flex:1;text-align:center}
      .stat .val{font-size:28px;font-weight:800;color:#111}
      .stat .lbl{font-size:11px;color:#888;margin-top:2px}
      .progress-bar{height:8px;background:#eee;border-radius:99px;overflow:hidden;margin-bottom:32px}
      .progress-fill{height:100%;background:#111;border-radius:99px}
      h2{font-size:14px;font-weight:700;margin:24px 0 12px;text-transform:uppercase;letter-spacing:.05em;color:#888}
      .task{padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;display:flex;align-items:center;gap:8px}
      .badge{font-size:10px;padding:2px 7px;border-radius:99px;font-weight:600}
      .todo{background:#f0f0f0;color:#888}
      .in_progress{background:#dbeafe;color:#1d4ed8}
      .review{background:#fef9c3;color:#854d0e}
      .done{background:#dcfce7;color:#166534;text-decoration:line-through}
      .milestone{padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;display:flex;justify-content:space-between}
      @media print{body{padding:20px}}
    </style></head><body>
    <h1>${project.name}</h1>
    <p class="meta">Generated ${new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}${project.client_name ? ' · Client: '+project.client_name : ''}</p>
    <div class="stat-row">
      <div class="stat"><div class="val">${pct}%</div><div class="lbl">Progress</div></div>
      <div class="stat"><div class="val">${done}/${total}</div><div class="lbl">Tasks Done</div></div>
      <div class="stat"><div class="val">${milestones.filter(m=>m.completed).length}/${milestones.length}</div><div class="lbl">Milestones</div></div>
    </div>
    <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
    <h2>Tasks</h2>
    ${tasks.map(t=>`<div class="task"><span class="badge ${t.status}">${t.status.replace('_',' ')}</span>${t.title}</div>`).join('')}
    ${milestones.length>0?`<h2>Milestones</h2>${milestones.map(m=>`<div class="milestone"><span>${m.completed?'✓ ':''} ${m.title}</span><span style="color:#888">${new Date(m.due_date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span></div>`).join('')}`:''}
    <script>window.onload=()=>window.print()</script></body></html>`)
    win.document.close()
  }

  const handleTimeCSV = async () => {
    const logs = await getProjectTimeLogs(id)
    if (!logs.length) { alert('No time logs recorded for this project yet.'); return }
    const taskMap = {}
    tasks.forEach((t) => { taskMap[t.id] = t.title })
    const rows = [
      ['Task', 'Duration (min)', 'Note', 'Logged At'],
      ...logs.map((l) => [
        `"${(taskMap[l.task_id] || 'Unknown task').replace(/"/g, '""')}"`,
        l.minutes,
        `"${(l.note || '').replace(/"/g, '""')}"`,
        new Date(l.created_at).toLocaleString('en-IN'),
      ]),
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.name.replace(/\s+/g, '_')}_time_logs.csv`
    a.click()
    URL.revokeObjectURL(url)
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
          ownerUserId={project.user_id}
          onClose={() => setShowInviteModal(false)}
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
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors"
            >
              <FileDown size={14} />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={handleTimeCSV}
              className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors"
              title="Download time logs as CSV"
            >
              <Timer size={14} />
              <span className="hidden sm:inline">Time CSV</span>
            </button>
            <button
              onClick={() => navigate(`/pm/projects/${id}/invoice`)}
              className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors"
            >
              <Receipt size={14} />
              <span className="hidden sm:inline">Invoice</span>
            </button>
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
            <p className="text-xs text-white/50 mb-2">Client share link - anyone with this link can view the project (read-only, no login needed)</p>
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

      {/* Onboarding banner */}
      {showOnboard && (
        <div className="border-b border-white/[0.05] bg-gradient-to-r from-purple-500/10 to-blue-500/10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <Sparkles size={16} className="text-purple-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white">Project created! Add tasks to get started.</p>
                <p className="text-xs text-white/50">Use AI to generate a task plan instantly, or add tasks manually.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span ref={aiRef} />
              {isPro ? (
                <button
                  onClick={() => { setShowOnboard(false); aiRef.current?.previousSibling?.click?.() }}
                  className="flex items-center gap-1.5 text-xs bg-white text-black font-semibold px-3 py-1.5 rounded-lg hover:bg-white/90 transition-colors"
                >
                  <Sparkles size={11} /> Plan with AI
                </button>
              ) : (
                <button
                  onClick={() => { setShowOnboard(false); triggerUpgrade('ai') }}
                  className="flex items-center gap-1.5 text-xs bg-white text-black font-semibold px-3 py-1.5 rounded-lg hover:bg-white/90 transition-colors"
                >
                  <Sparkles size={11} /> Plan with AI (Pro)
                </button>
              )}
              <button
                onClick={() => setShowOnboard(false)}
                className="text-white/30 hover:text-white/60 transition-colors"
              >
                <XIcon size={14} />
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

        {/* Search + Tabs row */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
        {/* Search */}
        <div className="relative">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="bg-white/[0.04] border border-white/[0.08] rounded-xl pl-8 pr-8 py-1.5 text-xs text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors w-44"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
              <XIcon size={11} />
            </button>
          )}
        </div>
        {/* Overdue filter */}
        {(() => {
          const overdueCount = tasks.filter((t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length
          return overdueCount > 0 ? (
            <button
              onClick={() => setOverdueOnly(!overdueOnly)}
              className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                overdueOnly ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'border-white/[0.08] text-red-400/60 hover:border-red-500/30 hover:text-red-400'
              }`}
            >
              <AlertCircle size={10} />
              {overdueCount} overdue
            </button>
          ) : null
        })()}
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 w-fit">
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
        </div>

        {/* Main + Sidebar */}
        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            {(() => {
              let filtered = tasks
              if (searchQuery) filtered = filtered.filter((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || (t.description || '').toLowerCase().includes(searchQuery.toLowerCase()))
              if (overdueOnly) filtered = filtered.filter((t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done')
              return (
                <>
                  {activeTab === 'kanban' && <KanbanBoard projectId={id} tasks={filtered} onTasksChange={setTasks} user={user} />}
                  {activeTab === 'timeline' && <TimelineView milestones={milestones} onMilestonesChange={setMilestones} />}
                  {activeTab === 'analytics' && <AnalyticsPanel tasks={filtered} milestones={milestones} />}
                  {activeTab === 'calendar' && <CalendarView tasks={filtered} milestones={milestones} />}
                </>
              )
            })()}
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

            <ActivityFeed projectId={id} />

            {clientComments.length > 0 && (
              <div
                className="glass rounded-2xl p-5 cursor-pointer"
                onClick={() => {
                  localStorage.setItem(`seen_comments_${id}`, String(clientComments.length))
                  setSeenCommentCount(clientComments.length)
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare size={13} className="text-white/40" />
                  <p className="text-xs text-white/40">Client Feedback</p>
                  {clientComments.length > seenCommentCount && (
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  )}
                  <span className="text-[10px] text-white/25 bg-white/[0.05] px-1.5 py-0.5 rounded-full ml-auto">{clientComments.length}</span>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {clientComments.map((c) => (
                    <div key={c.id} className="border-b border-white/[0.05] pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[8px] text-white/50 flex-shrink-0">
                          {c.author_name?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-[10px] font-medium text-white/60">{c.author_name}</span>
                        <span className="text-[9px] text-white/20 ml-auto">
                          {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/50 leading-relaxed pl-6">{c.content}</p>
                    </div>
                  ))}
                </div>
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
