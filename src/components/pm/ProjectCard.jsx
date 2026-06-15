import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Circle, Clock } from 'lucide-react'

const STATUS_COLORS = {
  active: 'bg-green-500/20 text-green-400',
  completed: 'bg-blue-500/20 text-blue-400',
  'on-hold': 'bg-yellow-500/20 text-yellow-400',
  archived: 'bg-white/10 text-white/40',
}

export default function ProjectCard({ project, taskCounts = {} }) {
  const navigate = useNavigate()
  const total = (taskCounts.todo || 0) + (taskCounts.in_progress || 0) + (taskCounts.review || 0) + (taskCounts.done || 0)
  const done = taskCounts.done || 0
  const progress = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div
      onClick={() => navigate(`/pm/projects/${project.id}`)}
      className="glass rounded-2xl p-5 cursor-pointer hover:border-white/20 transition-all group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: project.color || '#ffffff' }}
          />
          <h3 className="font-display font-semibold text-white text-sm group-hover:text-white/90 transition-colors line-clamp-1">
            {project.name}
          </h3>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-2 ${STATUS_COLORS[project.status] || STATUS_COLORS.active}`}>
          {project.status}
        </span>
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-white/50 text-xs leading-relaxed mb-4 line-clamp-2">{project.description}</p>
      )}

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-white/40">Progress</span>
          <span className="text-[10px] text-white/60 font-medium">{progress}%</span>
        </div>
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-white/60 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-[10px] text-white/40">
        <span className="flex items-center gap-1">
          <CheckCircle2 size={10} className="text-green-400/60" />
          {done} done
        </span>
        <span className="flex items-center gap-1">
          <Clock size={10} className="text-yellow-400/60" />
          {(taskCounts.in_progress || 0)} in progress
        </span>
        <span className="flex items-center gap-1">
          <Circle size={10} />
          {(taskCounts.todo || 0)} to do
        </span>
      </div>

      {/* Client */}
      {project.client_name && (
        <div className="mt-3 pt-3 border-t border-white/[0.06] text-[10px] text-white/40">
          Client: <span className="text-white/60">{project.client_name}</span>
        </div>
      )}
    </div>
  )
}
