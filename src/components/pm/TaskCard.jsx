import { useState } from 'react'
import { GripVertical, Calendar } from 'lucide-react'
import TaskEditModal from './TaskEditModal'

const PRIORITY_STYLES = {
  urgent: 'bg-red-500/20 text-red-400 border-red-500/20',
  high:   'bg-orange-500/20 text-orange-400 border-orange-500/20',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20',
  low:    'bg-white/10 text-white/40 border-white/10',
}

export default function TaskCard({ task, onDelete, onUpdate, draggable, onDragStart }) {
  const [editing, setEditing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  return (
    <>
      {editing && (
        <TaskEditModal
          task={task}
          onClose={() => setEditing(false)}
          onUpdated={(updated) => { onUpdate?.(updated); setEditing(false) }}
          onDeleted={(id) => { onDelete?.(id); setEditing(false) }}
        />
      )}
      <div
        draggable={draggable}
        onDragStart={(e) => { e.stopPropagation(); onDragStart?.(); setIsDragging(true) }}
        onDragEnd={() => setIsDragging(false)}
        onClick={() => !isDragging && setEditing(true)}
        className={`glass rounded-xl p-3 cursor-pointer group transition-all duration-150 hover:border-white/20 select-none ${
          isDragging ? 'scale-105 rotate-1 shadow-2xl shadow-black/60 opacity-70 border-white/30' : ''
        }`}
      >
        <div className="flex items-start gap-2">
          <GripVertical
            size={14}
            className="text-white/20 mt-0.5 flex-shrink-0 group-hover:text-white/40 transition-colors"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white font-medium leading-snug mb-1.5 line-clamp-2">{task.title}</p>
            {task.description && (
              <p className="text-[10px] text-white/40 leading-relaxed mb-2 line-clamp-2">{task.description}</p>
            )}
            <div className="flex items-center justify-between gap-2">
              <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium ${PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium}`}>
                {task.priority}
              </span>
              {task.due_date && (
                <span className={`flex items-center gap-1 text-[9px] ${
                  new Date(task.due_date) < new Date() ? 'text-red-400/70' : 'text-white/30'
                }`}>
                  <Calendar size={8} />
                  {new Date(task.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
