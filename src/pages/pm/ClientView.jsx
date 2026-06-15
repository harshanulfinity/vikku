import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle2, Circle, Clock, Flag } from 'lucide-react'
import { getProjectByToken, getTasks, getMilestones } from '../../lib/pmService'

const STATUS_LABELS = {
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'In Review',
  done: 'Done',
}

const STATUS_COLORS = {
  todo: 'text-white/40',
  in_progress: 'text-blue-400',
  review: 'text-yellow-400',
  done: 'text-green-400',
}

export default function ClientView() {
  const { token } = useParams()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [milestones, setMilestones] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      const p = await getProjectByToken(token)
      if (!p) { setNotFound(true); setLoading(false); return }
      const [t, m] = await Promise.all([getTasks(p.id), getMilestones(p.id)])
      setProject(p)
      setTasks(t)
      setMilestones(m.sort((a, b) => new Date(a.due_date) - new Date(b.due_date)))
      setLoading(false)
    }
    load()
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="font-display font-bold text-2xl mb-2">Project not found</h1>
          <p className="text-white/50 text-sm">This share link may have expired or is invalid.</p>
        </div>
      </div>
    )
  }

  const totalTasks = tasks.length
  const doneTasks = tasks.filter((t) => t.status === 'done').length
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  const nextMilestone = milestones.find((m) => !m.completed)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/[0.05] px-6 py-5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: project.color }} />
            <div>
              <h1 className="font-display font-semibold text-white">{project.name}</h1>
              {project.client_name && (
                <p className="text-xs text-white/40 mt-0.5">For {project.client_name}</p>
              )}
            </div>
          </div>
          <div className="text-xs text-white/30 text-right">
            <p>Project update</p>
            <p>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Overall Progress', value: `${progress}%`, sub: `${doneTasks} of ${totalTasks} tasks done` },
            { label: 'In Progress', value: inProgress, sub: 'tasks being worked on' },
            { label: 'Next Milestone', value: nextMilestone ? new Date(nextMilestone.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—', sub: nextMilestone?.title || 'All milestones done' },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-5 text-center">
              <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-[10px] text-white/40 leading-tight">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-white">Project Progress</p>
            <p className="text-sm font-bold text-white">{progress}%</p>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(STATUS_LABELS).map(([status, label]) => {
              const count = tasks.filter((t) => t.status === status).length
              return (
                <div key={status} className="text-center">
                  <p className={`text-sm font-bold ${STATUS_COLORS[status]}`}>{count}</p>
                  <p className="text-[10px] text-white/30">{label}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Tasks by status */}
        {['in_progress', 'review', 'todo', 'done'].map((status) => {
          const filtered = tasks.filter((t) => t.status === status)
          if (filtered.length === 0) return null
          return (
            <div key={status}>
              <div className="flex items-center gap-2 mb-3">
                {status === 'done'
                  ? <CheckCircle2 size={14} className="text-green-400" />
                  : status === 'in_progress'
                    ? <Clock size={14} className="text-blue-400" />
                    : <Circle size={14} className="text-white/40" />
                }
                <h2 className={`text-xs font-semibold ${STATUS_COLORS[status]}`}>{STATUS_LABELS[status]}</h2>
                <span className="text-[10px] text-white/30">({filtered.length})</span>
              </div>
              <div className="space-y-2">
                {filtered.map((task) => (
                  <div key={task.id} className="glass rounded-xl px-4 py-3">
                    <p className={`text-sm ${status === 'done' ? 'line-through text-white/40' : 'text-white'}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-white/40 mt-1">{task.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* Milestones */}
        {milestones.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Flag size={14} className="text-white/60" />
              <h2 className="text-xs font-semibold text-white/80">Milestones</h2>
            </div>
            <div className="space-y-2">
              {milestones.map((m) => {
                const isPast = !m.completed && new Date(m.due_date) < new Date()
                return (
                  <div key={m.id} className="glass rounded-xl px-4 py-3 flex items-center gap-3">
                    {m.completed
                      ? <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
                      : <Circle size={16} className={`flex-shrink-0 ${isPast ? 'text-red-400/60' : 'text-white/30'}`} />
                    }
                    <p className={`text-sm flex-1 ${m.completed ? 'line-through text-white/30' : 'text-white'}`}>{m.title}</p>
                    <p className={`text-xs flex-shrink-0 ${isPast && !m.completed ? 'text-red-400/60' : 'text-white/40'}`}>
                      {new Date(m.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-6 border-t border-white/[0.05]">
          <p className="text-xs text-white/20">Powered by <span className="text-white/40">Vikku PM</span></p>
        </div>
      </div>
    </div>
  )
}
