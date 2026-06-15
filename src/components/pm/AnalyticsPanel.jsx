import { BarChart2 } from 'lucide-react'

const STATUS_CONFIG = [
  { key: 'done',        label: 'Done',        color: 'bg-green-400' },
  { key: 'in_progress', label: 'In Progress', color: 'bg-blue-400' },
  { key: 'review',      label: 'Review',      color: 'bg-yellow-400' },
  { key: 'todo',        label: 'To Do',       color: 'bg-white/40' },
]

const PRIORITY_CONFIG = [
  { key: 'urgent', label: 'Urgent', color: 'bg-red-400' },
  { key: 'high',   label: 'High',   color: 'bg-orange-400' },
  { key: 'medium', label: 'Medium', color: 'bg-yellow-400' },
  { key: 'low',    label: 'Low',    color: 'bg-white/30' },
]

function Bar({ pct, color, label, count, total }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-[11px] text-white/50 w-20 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }}
        />
      </div>
      <span className="text-[11px] text-white/30 w-8 text-right">{count}</span>
    </div>
  )
}

export default function AnalyticsPanel({ tasks, milestones }) {
  const total = tasks.length
  const done = tasks.filter((t) => t.status === 'done').length
  const overdueTasks = tasks.filter(
    (t) => t.due_date && t.status !== 'done' && new Date(t.due_date) < new Date()
  ).length
  const overdueMilestones = milestones.filter(
    (m) => !m.completed && new Date(m.due_date) < new Date()
  ).length
  const milestoneDone = milestones.filter((m) => m.completed).length
  const completionPct = total > 0 ? Math.round((done / total) * 100) : 0

  if (total === 0 && milestones.length === 0) {
    return (
      <div className="glass rounded-2xl flex flex-col items-center justify-center py-24 text-center">
        <BarChart2 size={36} className="text-white/15 mb-4" />
        <p className="text-sm text-white/40 mb-1">No data yet</p>
        <p className="text-xs text-white/25">Add tasks and milestones to see analytics</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Tasks', value: total, sub: `${done} done`, color: 'text-white' },
          { label: 'Completion', value: `${completionPct}%`, sub: `${total - done} remaining`, color: completionPct === 100 ? 'text-green-400' : 'text-white' },
          { label: 'Overdue Tasks', value: overdueTasks, sub: overdueTasks > 0 ? 'needs attention' : 'all on track', color: overdueTasks > 0 ? 'text-red-400' : 'text-green-400' },
          { label: 'Milestones', value: `${milestoneDone}/${milestones.length}`, sub: overdueMilestones > 0 ? `${overdueMilestones} overdue` : 'on track', color: overdueMilestones > 0 ? 'text-red-400' : 'text-white' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="glass rounded-xl p-4">
            <p className="text-[10px] text-white/40 mb-1">{label}</p>
            <p className={`font-display font-bold text-xl mb-0.5 ${color}`}>{value}</p>
            <p className="text-[10px] text-white/25">{sub}</p>
          </div>
        ))}
      </div>

      {/* Overall progress bar */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-white/70">Overall Progress</p>
          <span className="text-sm font-bold text-white">{completionPct}%</span>
        </div>
        <div className="h-3 bg-white/[0.06] rounded-full overflow-hidden mb-1">
          <div
            className="h-full bg-gradient-to-r from-white/60 to-white rounded-full transition-all duration-700"
            style={{ width: `${completionPct}%` }}
          />
        </div>
        <p className="text-[10px] text-white/30">{done} of {total} tasks completed</p>
      </div>

      {/* Tasks by status */}
      <div className="glass rounded-2xl p-5">
        <p className="text-xs font-semibold text-white/70 mb-4">Tasks by Status</p>
        {STATUS_CONFIG.map(({ key, label, color }) => (
          <Bar
            key={key}
            label={label}
            color={color}
            count={tasks.filter((t) => t.status === key).length}
            total={total}
          />
        ))}
      </div>

      {/* Tasks by priority */}
      <div className="glass rounded-2xl p-5">
        <p className="text-xs font-semibold text-white/70 mb-4">Tasks by Priority</p>
        {PRIORITY_CONFIG.map(({ key, label, color }) => (
          <Bar
            key={key}
            label={label}
            color={color}
            count={tasks.filter((t) => t.priority === key).length}
            total={total}
          />
        ))}
      </div>

      {/* Milestones */}
      {milestones.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-white/70">Milestones</p>
            <span className="text-xs text-white/40">{milestoneDone}/{milestones.length}</span>
          </div>
          <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-green-400 rounded-full transition-all duration-700"
              style={{ width: milestones.length > 0 ? `${(milestoneDone / milestones.length) * 100}%` : '0%' }}
            />
          </div>
          <div className="space-y-2">
            {[...milestones]
              .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
              .map((m) => {
                const isPast = !m.completed && new Date(m.due_date) < new Date()
                return (
                  <div key={m.id} className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      m.completed ? 'bg-green-400' : isPast ? 'bg-red-400' : 'bg-white/30'
                    }`} />
                    <span className={`text-[11px] flex-1 ${m.completed ? 'line-through text-white/30' : 'text-white/70'}`}>
                      {m.title}
                    </span>
                    <span className={`text-[10px] ${isPast && !m.completed ? 'text-red-400/60' : 'text-white/30'}`}>
                      {new Date(m.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}
