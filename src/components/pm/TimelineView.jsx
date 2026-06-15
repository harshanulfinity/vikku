import { Flag } from 'lucide-react'
import { updateMilestone } from '../../lib/pmService'

export default function TimelineView({ milestones, onMilestonesChange }) {
  const sorted = [...milestones].sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
  const completedCount = sorted.filter((m) => m.completed).length
  const pct = sorted.length > 0 ? (completedCount / sorted.length) * 100 : 0

  const handleToggle = async (m) => {
    const updated = await updateMilestone(m.id, { completed: !m.completed })
    onMilestonesChange(milestones.map((x) => x.id === m.id ? { ...x, ...updated } : x))
  }

  if (sorted.length === 0) {
    return (
      <div className="glass rounded-2xl flex flex-col items-center justify-center py-24 text-center">
        <Flag size={36} className="text-white/15 mb-4" />
        <p className="text-sm text-white/40 mb-1">No milestones yet</p>
        <p className="text-xs text-white/25">Add milestones in the sidebar to see your project timeline</p>
      </div>
    )
  }

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Flag size={14} className="text-white/60" />
          <h3 className="font-display font-semibold text-sm text-white">Milestone Timeline</h3>
        </div>
        <span className="text-xs text-white/40">{completedCount}/{sorted.length} completed</span>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="relative min-w-max" style={{ padding: '56px 48px 72px' }}>
          {/* Track */}
          <div className="absolute left-12 right-12 h-px bg-white/10" style={{ top: '50%' }} />
          {/* Progress fill */}
          <div
            className="absolute left-12 h-px bg-white/50 transition-all duration-700"
            style={{
              top: '50%',
              width: sorted.length > 1
                ? `calc(${(completedCount / (sorted.length)) * 100}% - ${completedCount === sorted.length ? '0px' : '0px'})`
                : '0%',
            }}
          />

          <div className="relative flex items-center">
            {sorted.map((m) => {
              const isPast = !m.completed && new Date(m.due_date) < new Date()
              return (
                <div key={m.id} className="flex flex-col items-center" style={{ width: '140px' }}>
                  {/* Title above */}
                  <div className="mb-5 w-28 text-center">
                    <p className={`text-[11px] font-medium leading-snug ${
                      m.completed ? 'text-white/30 line-through' : 'text-white'
                    }`}>
                      {m.title}
                    </p>
                  </div>

                  {/* Node */}
                  <button
                    onClick={() => handleToggle(m)}
                    title={m.completed ? 'Mark incomplete' : 'Mark complete'}
                    className={`w-5 h-5 rounded-full border-2 transition-all duration-200 hover:scale-125 relative z-10 ${
                      m.completed
                        ? 'bg-green-400 border-green-400 shadow-lg shadow-green-400/30'
                        : isPast
                          ? 'bg-red-500/20 border-red-400 hover:bg-red-500/30'
                          : 'bg-black border-white/50 hover:border-white hover:bg-white/10'
                    }`}
                  />

                  {/* Date below */}
                  <div className="mt-5 w-24 text-center">
                    <p className={`text-[10px] ${isPast && !m.completed ? 'text-red-400/70' : 'text-white/40'}`}>
                      {new Date(m.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </p>
                    {m.completed && <p className="text-[9px] text-green-400/60 mt-0.5">Done</p>}
                    {isPast && !m.completed && <p className="text-[9px] text-red-400/60 mt-0.5">Overdue</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5 pt-4 border-t border-white/[0.06]">
        {[
          { cls: 'bg-green-400', label: 'Completed' },
          { cls: 'bg-black border border-white/40', label: 'Pending' },
          { cls: 'bg-red-500/30 border border-red-400', label: 'Overdue' },
        ].map(({ cls, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${cls}`} />
            <span className="text-[10px] text-white/35">{label}</span>
          </div>
        ))}
        <p className="ml-auto text-[10px] text-white/25">Click node to toggle</p>
      </div>
    </div>
  )
}
