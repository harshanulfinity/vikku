import { useState, useEffect, useRef } from 'react'
import { Bell, CheckCircle, AlertCircle, X } from 'lucide-react'
import { getProjects, getTasks, getMilestones } from '../../lib/pmService'
import { useAuth } from '../../contexts/AuthContext'

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
      await Promise.all(projects.slice(0, 5).map(async (p) => {
        const [tasks, milestones] = await Promise.all([getTasks(p.id), getMilestones(p.id)])
        const overdue = tasks.filter(
          (t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done'
        )
        overdue.forEach((t) => notes.push({
          id: `task-${t.id}`,
          type: 'overdue',
          message: `"${t.title}" is overdue`,
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
      }))
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
        <div className="absolute right-0 top-10 w-72 bg-[#111] border border-white/10 rounded-2xl shadow-2xl z-[9999] overflow-hidden">
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
                <div key={n.id} className="flex gap-3 px-4 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                  <AlertCircle size={13} className={n.type === 'overdue' ? 'text-red-400 flex-shrink-0 mt-0.5' : 'text-yellow-400 flex-shrink-0 mt-0.5'} />
                  <div>
                    <p className="text-xs text-white/70 leading-snug">{n.message}</p>
                    <p className="text-[10px] text-white/30 mt-0.5">{n.sub}</p>
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
