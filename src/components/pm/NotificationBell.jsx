import { useState, useEffect, useRef } from 'react'
import { Bell, CheckCircle, AlertCircle, X, ThumbsUp, ThumbsDown, Clock, Megaphone } from 'lucide-react'
import { getProjects, getTasks, getMilestones } from '../../lib/pmService'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabaseClient'

export default function NotificationBell() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const ref = useRef(null)

  useEffect(() => {
    if (!user) return
    async function load() {
      const projects = await getProjects(user.id)
      const notes = []
      await Promise.all(projects.slice(0, 10).map(async (p) => {
        const [tasks, milestones] = await Promise.all([getTasks(p.id), getMilestones(p.id)])
        const todayStr = new Date().toISOString().slice(0, 10)
        const overdue = tasks.filter(
          (t) => t.due_date && t.due_date < todayStr && t.status !== 'done'
        )
        overdue.forEach((t) => notes.push({
          id: `task-${t.id}`,
          type: 'overdue',
          message: `"${t.title}" is overdue`,
          sub: p.name,
        }))
        const dueToday = tasks.filter(
          (t) => t.due_date === todayStr && t.status !== 'done'
        )
        dueToday.forEach((t) => notes.push({
          id: `due-today-${t.id}`,
          type: 'due_today',
          message: `"${t.title}" is due today`,
          sub: p.name,
        }))
        const upcomingMs = milestones.filter(
          (m) => !m.completed && new Date(m.due_date) > new Date() &&
            (new Date(m.due_date) - Date.now()) < 3 * 86400 * 1000
        )
        upcomingMs.forEach((m) => notes.push({
          id: `ms-${m.id}`,
          type: 'milestone',
          message: `Milestone "${m.title}" due soon`,
          sub: p.name,
        }))
        // Client milestone reviews
        milestones
          .filter((m) => m.approval_status === 'approved' || m.approval_status === 'rejected')
          .forEach((m) => notes.push({
            id: `ms-approval-${m.id}`,
            type: m.approval_status === 'approved' ? 'approved' : 'revision',
            message: m.approval_status === 'approved'
              ? `Client approved "${m.title}"`
              : `Client requested revision on "${m.title}"`,
            sub: p.name,
          }))
      }))
      // Fetch active announcements targeting this user's plan
      try {
        const { data: subData } = await supabase.from('user_subscriptions')
          .select('plan').eq('user_id', user.id).maybeSingle()
        const userPlan = subData?.plan || 'free'

        const { data: announcements } = await supabase
          .from('admin_announcements').select('id, title, body, target').eq('active', true)

        const readIds = JSON.parse(localStorage.getItem('readAnnouncements') || '[]')
        ;(announcements || [])
          .filter(a => !readIds.includes(a.id))
          .filter(a => a.target === 'all' || a.target === userPlan)
          .forEach(a => notes.push({
            id: `ann-${a.id}`,
            annId: a.id,
            type: 'announcement',
            message: a.title,
            sub: a.body,
          }))
      } catch { /* announcements are best-effort */ }

      setNotifications(notes)
    }
    load()
  }, [user])

  // Close on outside click
  useEffect(() => {
    function handle(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const count = notifications.length

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative w-8 h-8 flex items-center justify-center rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all"
      >
        <Bell size={15} />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed top-[60px] inset-x-4 sm:absolute sm:inset-x-auto sm:right-0 sm:top-10 sm:w-72 bg-[#111] border border-white/10 rounded-2xl shadow-2xl z-[9999] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
            <p className="text-xs font-semibold text-white">Notifications</p>
            <button onClick={() => setOpen(false)} className="text-white/30 hover:text-white transition-colors">
              <X size={13} />
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <CheckCircle size={20} className="text-white/10 mx-auto mb-2" />
              <p className="text-xs text-white/30">All caught up</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={n.type === 'announcement' ? () => {
                    const readIds = JSON.parse(localStorage.getItem('readAnnouncements') || '[]')
                    if (!readIds.includes(n.annId)) {
                      localStorage.setItem('readAnnouncements', JSON.stringify([...readIds, n.annId]))
                    }
                    setNotifications(prev => prev.filter(x => x.id !== n.id))
                  } : undefined}
                  className={`flex gap-3 px-4 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors ${n.type === 'announcement' ? 'cursor-pointer' : ''}`}
                >
                  {n.type === 'approved' ? (
                    <ThumbsUp size={13} className="text-green-400 flex-shrink-0 mt-0.5" />
                  ) : n.type === 'revision' ? (
                    <ThumbsDown size={13} className="text-orange-400 flex-shrink-0 mt-0.5" />
                  ) : n.type === 'due_today' ? (
                    <Clock size={13} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                  ) : n.type === 'announcement' ? (
                    <Megaphone size={13} className="text-orange-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle size={13} className={n.type === 'overdue' ? 'text-red-400 flex-shrink-0 mt-0.5' : 'text-yellow-400 flex-shrink-0 mt-0.5'} />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/70 leading-snug">{n.message}</p>
                    <p className="text-[10px] text-white/30 mt-0.5 line-clamp-2">{n.sub}</p>
                    {n.type === 'announcement' && (
                      <p className="text-[9px] text-white/20 mt-0.5">Click to dismiss</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
