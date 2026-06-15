import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import TaskCard from './TaskCard'
import { createTask, updateTask, deleteTask } from '../../lib/pmService'

const COLUMNS = [
  { id: 'todo',        label: 'To Do',       color: 'bg-white/10' },
  { id: 'in_progress', label: 'In Progress',  color: 'bg-blue-500/20' },
  { id: 'review',      label: 'Review',       color: 'bg-yellow-500/20' },
  { id: 'done',        label: 'Done',         color: 'bg-green-500/20' },
]

const EMPTY_STATE = {
  todo:        { emoji: '📋', hint: 'Add tasks to get started' },
  in_progress: { emoji: '⚡', hint: 'Drag tasks here to start working' },
  review:      { emoji: '👀', hint: 'Move tasks here when ready to review' },
  done:        { emoji: '✅', hint: 'Completed tasks will appear here' },
}

export default function KanbanBoard({ projectId, tasks, onTasksChange }) {
  const [addingTo, setAddingTo] = useState(null)
  const [newTitle, setNewTitle] = useState('')
  const [dragTaskId, setDragTaskId] = useState(null)
  const [dragOverCol, setDragOverCol] = useState(null)

  const tasksByStatus = COLUMNS.reduce((acc, col) => {
    acc[col.id] = tasks.filter((t) => t.status === col.id)
    return acc
  }, {})

  const handleAddTask = async (status) => {
    if (!newTitle.trim()) return
    const task = await createTask({
      project_id: projectId,
      title: newTitle.trim(),
      status,
      priority: 'medium',
    })
    onTasksChange([...tasks, task])
    setNewTitle('')
    setAddingTo(null)
  }

  const handleDelete = async (taskId) => {
    await deleteTask(taskId)
    onTasksChange(tasks.filter((t) => t.id !== taskId))
  }

  const handleUpdate = (updated) => {
    onTasksChange(tasks.map((t) => t.id === updated.id ? { ...t, ...updated } : t))
  }

  const handleDragStart = (taskId) => setDragTaskId(taskId)

  const handleDrop = async (newStatus) => {
    setDragOverCol(null)
    if (!dragTaskId) return
    const task = tasks.find((t) => t.id === dragTaskId)
    if (!task || task.status === newStatus) { setDragTaskId(null); return }
    onTasksChange(tasks.map((t) => t.id === dragTaskId ? { ...t, status: newStatus } : t))
    await updateTask(dragTaskId, { status: newStatus })
    setDragTaskId(null)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {COLUMNS.map((col) => {
        const isOver = dragOverCol === col.id
        return (
          <div
            key={col.id}
            className={`flex flex-col min-h-[300px] rounded-2xl p-3 transition-all duration-200 ${
              isOver ? 'bg-white/[0.04] ring-1 ring-white/20' : ''
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.id) }}
            onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOverCol(null) }}
            onDrop={() => handleDrop(col.id)}
          >
            {/* Column header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${col.color}`} />
                <span className="text-xs font-semibold text-white/80">{col.label}</span>
                <span className="text-[10px] text-white/30 bg-white/[0.05] px-1.5 py-0.5 rounded-full">
                  {tasksByStatus[col.id].length}
                </span>
              </div>
              <button
                onClick={() => { setAddingTo(col.id); setNewTitle('') }}
                className="text-white/30 hover:text-white/70 transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Tasks */}
            <div className="flex flex-col gap-2 flex-1">
              {tasksByStatus[col.id].map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                  draggable
                  onDragStart={() => handleDragStart(task.id)}
                />
              ))}

              {/* Add task inline */}
              {addingTo === col.id && (
                <div className="glass rounded-xl p-3">
                  <input
                    autoFocus
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddTask(col.id)
                      if (e.key === 'Escape') setAddingTo(null)
                    }}
                    placeholder="Task title..."
                    className="w-full bg-transparent text-xs text-white placeholder-white/30 outline-none mb-2"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddTask(col.id)}
                      className="text-[10px] bg-white text-black px-2.5 py-1 rounded-lg font-medium hover:bg-white/90"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setAddingTo(null)}
                      className="text-[10px] text-white/40 hover:text-white/70 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              )}

              {/* Empty state */}
              {tasksByStatus[col.id].length === 0 && addingTo !== col.id && (
                <div
                  className={`flex-1 rounded-xl border border-dashed flex flex-col items-center justify-center min-h-[100px] gap-2 transition-all duration-200 ${
                    isOver
                      ? 'border-white/40 bg-white/[0.06]'
                      : 'border-white/[0.08] hover:border-white/20'
                  }`}
                >
                  <span className="text-xl opacity-30">{EMPTY_STATE[col.id].emoji}</span>
                  <p className="text-[10px] text-white/25 text-center px-3">{EMPTY_STATE[col.id].hint}</p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
