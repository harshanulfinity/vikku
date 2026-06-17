import { useState } from 'react'
import { GripVertical, Calendar, CheckSquare, ExternalLink, GitMerge, RotateCcw, ThumbsUp, ThumbsDown } from 'lucide-react'
import TaskEditModal from './TaskEditModal'
import { LABEL_STYLES } from '../../lib/pmConstants'

const PRIORITY_STYLES = {
  urgent: 'bg-red-500/20 text-red-400 border-red-500/20',
  high:   'bg-orange-500/20 text-orange-400 border-orange-500/20',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20',
  low:    'bg-white/10 text-white/40 border-white/10',
}

export default function TaskCard({ task, onDelete, onUpdate, draggable, onDragStart, selectMode, selected, onToggleSelect }) {
  const [editing, setEditing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const assigneeInitial = task.assigned_to_email ? task.assigned_to_email[0].toUpperCase() : null
  const hasSubtasks = task._subtasksTotal > 0
  const labelStyle = task.label ? LABEL_STYLES[task.label] : null
  const isBlocked = task._isBlocked

  const handleClick = () => {
    if (selectMode) { onToggleSelect?.(); return }
    if (!isDragging) setEditing(true)
  }

  return (
    <>
      {editing && !selectMode && (
        <TaskEditModal
          task={task}
          onClose={() => setEditing(false)}
          onUpdated={(updated) => { onUpdate?.(updated); setEditing(false) }}
          onDeleted={(id) => { onDelete?.(id); setEditing(false) }}
        />
      )}
      <div
        draggable={draggable && !selectMode}
        onDragStart={(e) => { e.stopPropagation(); onDragStart?.(); setIsDragging(true) }}
        onDragEnd={() => setIsDragging(false)}
        onClick={handleClick}
        className={`glass rounded-xl p-3 cursor-pointer group transition-all duration-150 hover:border-white/20 select-none relative ${
          isDragging ? 'scale-105 rotate-1 shadow-2xl shadow-black/60 opacity-70 border-white/30' : ''
        } ${selected ? 'border-white/30 bg-white/[0.06]' : ''} ${isBlocked ? 'border-red-500/20' : ''}`}
      >
        {/* Select checkbox overlay */}
        {selectMode && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
              selected ? 'bg-white border-white' : 'border-white/40 bg-transparent'
            }`}>
              {selected && <div className="w-2 h-2 bg-black rounded-sm" />}
            </div>
          </div>
        )}

        <div className={`flex items-start gap-2 ${selectMode ? 'pl-5' : ''}`}>
          {!selectMode && (
            <GripVertical
              size={14}
              className="text-white/20 mt-0.5 flex-shrink-0 group-hover:text-white/40 transition-colors"
              onClick={(e) => e.stopPropagation()}
            />
          )}
          <div className="flex-1 min-w-0">
            {/* Label */}
            {labelStyle && (
              <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded border font-medium mb-1 ${labelStyle.bg} ${labelStyle.text} ${labelStyle.border}`}>
                {task.label}
              </span>
            )}
            <p className="text-xs text-white font-medium leading-snug mb-1.5 line-clamp-2">{task.title}</p>
            {task.description && (
              <p className="text-[10px] text-white/40 leading-relaxed mb-2 line-clamp-2">{task.description}</p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium ${PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium}`}>
                {task.priority}
              </span>
              <div className="flex items-center gap-2 ml-auto">
                {task.client_approval_status === 'approved' && (
                  <span title="Approved by client" className="flex items-center gap-0.5 text-[9px] text-green-400/70">
                    <ThumbsUp size={8} /> approved
                  </span>
                )}
                {task.client_approval_status === 'needs_revision' && (
                  <span title="Client requested revision" className="flex items-center gap-0.5 text-[9px] text-orange-400/70">
                    <ThumbsDown size={8} /> revision
                  </span>
                )}
                {isBlocked && (
                  <span title="Blocked by unfinished tasks" className="flex items-center gap-0.5 text-[9px] text-red-400/70">
                    <GitMerge size={8} /> blocked
                  </span>
                )}
                {task.recurrence && (
                  <span title={`Repeats ${task.recurrence}`} className="text-blue-400/50">
                    <RotateCcw size={8} />
                  </span>
                )}
                {hasSubtasks && (
                  <span className={`flex items-center gap-1 text-[9px] ${task._subtasksDone === task._subtasksTotal ? 'text-green-400/70' : 'text-white/30'}`}>
                    <CheckSquare size={8} />
                    {task._subtasksDone}/{task._subtasksTotal}
                  </span>
                )}
                {task.task_link && (
                  <a
                    href={task.task_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-blue-400/60 hover:text-blue-400 transition-colors"
                  >
                    <ExternalLink size={9} />
                  </a>
                )}
                {task.due_date && (
                  <span className={`flex items-center gap-1 text-[9px] ${new Date(task.due_date) < new Date() ? 'text-red-400/70' : 'text-white/30'}`}>
                    <Calendar size={8} />
                    {new Date(task.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                )}
                {assigneeInitial && (
                  <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[8px] text-white/50 flex-shrink-0">
                    {assigneeInitial}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
