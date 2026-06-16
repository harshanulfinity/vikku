import { useState } from 'react'
import { Plus, X, ClipboardList, Zap, Eye, CheckCircle, Trash2, MousePointer, List, Columns } from 'lucide-react'
import TaskCard from './TaskCard'
import { createTask, updateTask, deleteTask, logActivity } from '../../lib/pmService'
import { LABEL_STYLES } from '../../lib/pmConstants'

const COLUMNS = [
  { id: 'todo',        label: 'To Do',       color: 'bg-white/10' },
  { id: 'in_progress', label: 'In Progress',  color: 'bg-blue-500/20' },
  { id: 'review',      label: 'Review',       color: 'bg-yellow-500/20' },
  { id: 'done',        label: 'Done',         color: 'bg-green-500/20' },
]

const EMPTY_STATE = {
  todo:        { Icon: ClipboardList, hint: 'Add tasks to get started' },
  in_progress: { Icon: Zap,          hint: 'Drag tasks here to start working' },
  review:      { Icon: Eye,          hint: 'Move tasks here when ready to review' },
  done:        { Icon: CheckCircle,  hint: 'Completed tasks will appear here' },
}

export default function KanbanBoard({ projectId, tasks, onTasksChange, user }) {
  const [addingTo, setAddingTo] = useState(null)
  const [newTitle, setNewTitle] = useState('')
  const [dragTaskId, setDragTaskId] = useState(null)
  const [dragOverCol, setDragOverCol] = useState(null)
  const [labelFilter, setLabelFilter] = useState('')
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState(new Set())
  const [bulkWorking, setBulkWorking] = useState(false)
  const [viewMode, setViewMode] = useState('kanban') // 'kanban' | 'list'

  const filteredTasks = labelFilter ? tasks.filter((t) => t.label === labelFilter) : tasks
  const tasksByStatus = COLUMNS.reduce((acc, col) => {
    acc[col.id] = filteredTasks.filter((t) => t.status === col.id)
    return acc
  }, {})

  const usedLabels = [...new Set(tasks.map((t) => t.label).filter(Boolean))]

  const handleAddTask = async (status) => {
    if (!newTitle.trim()) return
    const task = await createTask({ project_id: projectId, title: newTitle.trim(), status, priority: 'medium' })
    onTasksChange([...tasks, task])
    setNewTitle('')
    setAddingTo(null)
    if (user) logActivity({ project_id: projectId, user_id: user.id, user_email: user.email, action: 'task_created', entity_type: 'task', entity_title: newTitle.trim() })
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
    if (user) logActivity({ project_id: projectId, user_id: user.id, user_email: user.email, action: newStatus === 'done' ? 'task_done' : 'task_updated', entity_type: 'task', entity_title: task.title })
    setDragTaskId(null)
  }

  const toggleSelect = (taskId) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(taskId) ? next.delete(taskId) : next.add(taskId)
      return next
    })
  }

  const exitSelectMode = () => { setSelectMode(false); setSelected(new Set()) }

  const handleBulkMove = async (status) => {
    if (!selected.size) return
    setBulkWorking(true)
    const ids = [...selected]
    onTasksChange(tasks.map((t) => selected.has(t.id) ? { ...t, status } : t))
    await Promise.all(ids.map((id) => updateTask(id, { status })))
    exitSelectMode()
    setBulkWorking(false)
  }

  const handleBulkDelete = async () => {
    if (!selected.size || !window.confirm(`Delete ${selected.size} task${selected.size !== 1 ? 's' : ''}?`)) return
    setBulkWorking(true)
    const ids = [...selected]
    onTasksChange(tasks.filter((t) => !selected.has(t.id)))
    await Promise.all(ids.map((id) => deleteTask(id)))
    exitSelectMode()
    setBulkWorking(false)
  }

  return (
    <div>
      {/* Filter + Select bar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {usedLabels.length > 0 && (
          <>
            <button
              onClick={() => setLabelFilter('')}
              className={`text-[10px] px-2.5 py-1 rounded-lg border font-medium transition-all ${
                !labelFilter ? 'bg-white/10 text-white/70 border-white/20' : 'border-white/[0.08] text-white/30 hover:border-white/20'
              }`}
            >
              All
            </button>
            {usedLabels.map((lbl) => {
              const s = LABEL_STYLES[lbl] || {}
              return (
                <button
                  key={lbl}
                  onClick={() => setLabelFilter(labelFilter === lbl ? '' : lbl)}
                  className={`text-[10px] px-2.5 py-1 rounded-lg border font-medium transition-all ${
                    labelFilter === lbl ? `${s.bg} ${s.text} ${s.border}` : 'border-white/[0.08] text-white/30 hover:border-white/20'
                  }`}
                >
                  {lbl}
                </button>
              )
            })}
            <div className="w-px h-4 bg-white/[0.08]" />
          </>
        )}
        <button
          onClick={() => { setSelectMode(!selectMode); if (selectMode) exitSelectMode() }}
          className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-lg border font-medium transition-all ${
            selectMode ? 'bg-white/10 text-white/70 border-white/20' : 'border-white/[0.08] text-white/30 hover:border-white/20'
          }`}
        >
          <MousePointer size={10} />
          {selectMode ? 'Cancel' : 'Select'}
        </button>
        <button
          onClick={() => setViewMode(viewMode === 'kanban' ? 'list' : 'kanban')}
          className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-lg border font-medium transition-all ${
            viewMode === 'list' ? 'bg-white/10 text-white/70 border-white/20' : 'border-white/[0.08] text-white/30 hover:border-white/20'
          }`}
          title={viewMode === 'kanban' ? 'Switch to list view' : 'Switch to kanban view'}
        >
          {viewMode === 'kanban' ? <List size={10} /> : <Columns size={10} />}
          {viewMode === 'kanban' ? 'List' : 'Board'}
        </button>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {COLUMNS.map((col) => {
            const colTasks = tasksByStatus[col.id]
            if (colTasks.length === 0) return null
            return (
              <div key={col.id}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${col.color}`} />
                  <span className="text-xs font-semibold text-white/70">{col.label}</span>
                  <span className="text-[10px] text-white/30 bg-white/[0.05] px-1.5 py-0.5 rounded-full">{colTasks.length}</span>
                </div>
                <div className="space-y-1.5">
                  {colTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onDelete={handleDelete}
                      onUpdate={handleUpdate}
                      draggable={false}
                      selectMode={selectMode}
                      selected={selected.has(task.id)}
                      onToggleSelect={() => toggleSelect(task.id)}
                    />
                  ))}
                </div>
              </div>
            )
          })}
          {filteredTasks.length === 0 && (
            <div className="glass rounded-xl p-8 text-center">
              <p className="text-xs text-white/30">No tasks yet. Add one with the + button on each column in board view.</p>
            </div>
          )}
        </div>
      )}

      {/* Kanban Board View */}
      {viewMode === 'kanban' && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${col.color}`} />
                  <span className="text-xs font-semibold text-white/80">{col.label}</span>
                  <span className="text-[10px] text-white/30 bg-white/[0.05] px-1.5 py-0.5 rounded-full">
                    {tasksByStatus[col.id].length}
                  </span>
                </div>
                {!selectMode && (
                  <button onClick={() => { setAddingTo(col.id); setNewTitle('') }} className="text-white/30 hover:text-white/70 transition-colors">
                    <Plus size={14} />
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-2 flex-1">
                {tasksByStatus[col.id].map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onDelete={handleDelete}
                    onUpdate={handleUpdate}
                    draggable={!selectMode}
                    onDragStart={() => handleDragStart(task.id)}
                    selectMode={selectMode}
                    selected={selected.has(task.id)}
                    onToggleSelect={() => toggleSelect(task.id)}
                  />
                ))}

                {addingTo === col.id && !selectMode && (
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
                      <button onClick={() => handleAddTask(col.id)} className="text-[10px] bg-white text-black px-2.5 py-1 rounded-lg font-medium hover:bg-white/90">Add</button>
                      <button onClick={() => setAddingTo(null)} className="text-[10px] text-white/40 hover:text-white/70 transition-colors"><X size={12} /></button>
                    </div>
                  </div>
                )}

                {tasksByStatus[col.id].length === 0 && addingTo !== col.id && (
                  <div
                    className={`flex-1 rounded-xl border border-dashed flex flex-col items-center justify-center min-h-[100px] gap-2 transition-all duration-200 ${
                      isOver ? 'border-white/40 bg-white/[0.06]' : 'border-white/[0.08] hover:border-white/20'
                    }`}
                  >
                    {(() => { const { Icon } = EMPTY_STATE[col.id]; return <Icon size={16} className="text-white/20" /> })()}
                    <p className="text-[10px] text-white/25 text-center px-3">{EMPTY_STATE[col.id].hint}</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>}

      {/* Bulk action floating bar */}
      {selectMode && selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-[#1a1a1a] border border-white/20 rounded-2xl px-4 py-3 shadow-2xl whitespace-nowrap">
          <span className="text-xs text-white/60 mr-1 font-medium">{selected.size} selected</span>
          <span className="text-[10px] text-white/30">Move to →</span>
          {COLUMNS.map((col) => (
            <button
              key={col.id}
              onClick={() => handleBulkMove(col.id)}
              disabled={bulkWorking}
              className="text-[10px] px-2.5 py-1.5 rounded-lg bg-white/[0.08] text-white/60 hover:bg-white/15 hover:text-white transition-all disabled:opacity-40"
            >
              {col.label}
            </button>
          ))}
          <div className="w-px h-5 bg-white/[0.08]" />
          <button
            onClick={handleBulkDelete}
            disabled={bulkWorking}
            className="flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-40"
          >
            <Trash2 size={11} /> Delete
          </button>
          <button onClick={exitSelectMode} className="text-white/30 hover:text-white/60 transition-colors ml-1">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
