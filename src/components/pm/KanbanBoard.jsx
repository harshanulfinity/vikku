import { useState, useRef } from 'react'
import { Plus, X, ClipboardList, Zap, Eye, CheckCircle, Trash2, MousePointer, List, Columns } from 'lucide-react'
import TaskCard from './TaskCard'
import TaskCreateModal from './TaskCreateModal'
import { createTask, updateTask, deleteTask, logActivity } from '../../lib/pmService'

function getNextDueDate(dueDate, recurrence) {
  if (!dueDate) return null
  const d = new Date(dueDate + 'T00:00:00')
  if (recurrence === 'daily') d.setDate(d.getDate() + 1)
  else if (recurrence === 'weekly') d.setDate(d.getDate() + 7)
  else if (recurrence === 'monthly') d.setMonth(d.getMonth() + 1)
  return d.toISOString().split('T')[0]
}
import { LABEL_STYLES, DEFAULT_WORKFLOW_STAGES } from '../../lib/pmConstants'

const DEFAULT_EMPTY = {
  todo:        { Icon: ClipboardList, hint: 'Add tasks to get started' },
  in_progress: { Icon: Zap,          hint: 'Drag tasks here to start working' },
  review:      { Icon: Eye,          hint: 'Move tasks here when ready to review' },
  done:        { Icon: CheckCircle,  hint: 'Completed tasks will appear here' },
}

function stageColor(hexColor) {
  // Convert a hex color to a subtle Tailwind-compatible inline style
  return hexColor || '#6b7280'
}

export default function KanbanBoard({ projectId, tasks, onTasksChange, user, workflow }) {
  // workflow = array of stage objects [{status_key, name, color, is_done, position}, ...]
  // or null/undefined → use DEFAULT_WORKFLOW_STAGES
  const stages = (workflow && workflow.length > 0) ? workflow : DEFAULT_WORKFLOW_STAGES

  const [createModalStage, setCreateModalStage] = useState(null) // { status_key, name }
  const [dragTaskId, setDragTaskId] = useState(null)
  const [dragOverCol, setDragOverCol] = useState(null)
  const [dragOverTaskId, setDragOverTaskId] = useState(null)
  const [dragInsertBefore, setDragInsertBefore] = useState(true)
  const dragOverTaskIdRef = useRef(null)
  const dragInsertBeforeRef = useRef(true)
  const [labelFilter, setLabelFilter] = useState('')
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState(new Set())
  const [bulkWorking, setBulkWorking] = useState(false)
  const [viewMode, setViewMode] = useState('kanban') // 'kanban' | 'list'

  const filteredTasks = labelFilter ? tasks.filter((t) => t.label === labelFilter) : tasks

  const tasksByStage = stages.reduce((acc, stage) => {
    acc[stage.status_key] = filteredTasks.filter((t) => t.status === stage.status_key)
    return acc
  }, {})

  // Collect tasks with status keys not in current workflow (orphaned tasks)
  const stageKeys = new Set(stages.map((s) => s.status_key))
  const orphanedTasks = filteredTasks.filter((t) => !stageKeys.has(t.status))

  const usedLabels = [...new Set(tasks.map((t) => t.label).filter(Boolean))]

  const handleCreateSubmit = async (fields) => {
    const { status, title, description, priority, due_date, assigned_to_email, label, task_link } = fields
    const tempId = `temp-${Date.now()}`
    const tempTask = { id: tempId, project_id: projectId, created_at: new Date().toISOString(), ...fields }
    onTasksChange((prev) => [...prev, tempTask])
    try {
      const task = await createTask({
        project_id: projectId, title, status,
        priority: priority || 'medium',
        description: description || null,
        due_date: due_date || null,
        assigned_to_email: assigned_to_email || null,
        label: label || null,
        task_link: task_link || null,
      })
      if (!task) throw new Error('no task returned')
      onTasksChange((prev) => prev.map((t) => t.id === tempId ? task : t))
      if (user) logActivity({ project_id: projectId, user_id: user.id, user_email: user.email, action: 'task_created', entity_type: 'task', entity_title: title })
    } catch {
      onTasksChange((prev) => prev.filter((t) => t.id !== tempId))
    }
  }

  const handleDelete = async (taskId) => {
    await deleteTask(taskId)
    onTasksChange(tasks.filter((t) => t.id !== taskId))
  }

  const handleUpdate = (updated) => {
    onTasksChange(tasks.map((t) => t.id === updated.id ? { ...t, ...updated } : t))
  }

  const handleDragStart = (taskId) => setDragTaskId(taskId)

  const handleTaskDragOver = (e, taskId) => {
    e.preventDefault()
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    const before = e.clientY < rect.top + rect.height / 2
    dragOverTaskIdRef.current = taskId
    dragInsertBeforeRef.current = before
    setDragOverTaskId(taskId)
    setDragInsertBefore(before)
  }

  const handleDrop = async (newStatusKey) => {
    const overTaskId = dragOverTaskIdRef.current
    const insertBefore = dragInsertBeforeRef.current
    dragOverTaskIdRef.current = null
    setDragOverCol(null)
    setDragOverTaskId(null)
    if (!dragTaskId) return
    const task = tasks.find((t) => t.id === dragTaskId)
    if (!task) { setDragTaskId(null); return }

    const sameCol = task.status === newStatusKey

    if (overTaskId && overTaskId !== dragTaskId) {
      const colTasks = tasks
        .filter((t) => t.status === newStatusKey && t.id !== dragTaskId)
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      const targetIdx = colTasks.findIndex((t) => t.id === overTaskId)
      const insertAt = targetIdx === -1 ? colTasks.length : (insertBefore ? targetIdx : targetIdx + 1)
      colTasks.splice(insertAt, 0, { ...task, status: newStatusKey })
      const positioned = colTasks.map((t, i) => ({ ...t, position: i * 100 }))
      onTasksChange(tasks.map((t) => {
        const p = positioned.find((pt) => pt.id === t.id)
        return p ? p : t
      }))
      await Promise.all(positioned.map((t) => updateTask(t.id, { status: newStatusKey, position: t.position })))
    } else if (!sameCol) {
      onTasksChange(tasks.map((t) => t.id === dragTaskId ? { ...t, status: newStatusKey } : t))
      await updateTask(dragTaskId, { status: newStatusKey })
    }

    const isDoneStage = stages.find((s) => s.status_key === newStatusKey)?.is_done
    if (user && !sameCol) logActivity({ project_id: projectId, user_id: user.id, user_email: user.email, action: isDoneStage ? 'task_done' : 'task_updated', entity_type: 'task', entity_title: task.title })

    // Recurring task: create next occurrence when completed
    if (isDoneStage && !sameCol && task.recurrence) {
      const firstStage = stages.find((s) => !s.is_done) || stages[0]
      createTask({
        project_id: projectId,
        title: task.title,
        description: task.description || null,
        priority: task.priority || 'medium',
        status: firstStage.status_key,
        due_date: getNextDueDate(task.due_date, task.recurrence),
        assigned_to_email: task.assigned_to_email || null,
        label: task.label || null,
        recurrence: task.recurrence,
      }).then((newTask) => {
        if (newTask) onTasksChange((prev) => [...prev, newTask])
      }).catch(() => {})
    }

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

  const handleBulkMove = async (statusKey) => {
    if (!selected.size) return
    setBulkWorking(true)
    const ids = [...selected]
    onTasksChange(tasks.map((t) => selected.has(t.id) ? { ...t, status: statusKey } : t))
    await Promise.all(ids.map((id) => updateTask(id, { status: statusKey })))
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
        >
          {viewMode === 'kanban' ? <List size={10} /> : <Columns size={10} />}
          {viewMode === 'kanban' ? 'List' : 'Board'}
        </button>
      </div>

      {/* Orphaned tasks warning */}
      {orphanedTasks.length > 0 && (
        <div className="mb-4 px-4 py-2.5 rounded-xl border border-yellow-500/20 bg-yellow-500/[0.06] text-[10px] text-yellow-400/80">
          {orphanedTasks.length} task{orphanedTasks.length !== 1 ? 's' : ''} have stages not in the current workflow. Change their status to move them.
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {stages.map((stage) => {
            const stageTasks = tasksByStage[stage.status_key] || []
            if (stageTasks.length === 0) return null
            return (
              <div key={stage.status_key}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: stageColor(stage.color) }} />
                  <span className="text-xs font-semibold text-white/70">{stage.name}</span>
                  <span className="text-[10px] text-white/30 bg-white/[0.05] px-1.5 py-0.5 rounded-full">{stageTasks.length}</span>
                </div>
                <div className="space-y-1.5">
                  {stageTasks.map((task) => (
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
      {viewMode === 'kanban' && (
        <div className="flex gap-3 overflow-x-auto pb-2" style={{ minWidth: 0 }}>
          {stages.map((stage) => {
            const isOver = dragOverCol === stage.status_key
            const stageTasks = (tasksByStage[stage.status_key] || []).sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
            const DefaultIcon = DEFAULT_EMPTY[stage.status_key]?.Icon || ClipboardList
            const defaultHint = DEFAULT_EMPTY[stage.status_key]?.hint || 'Drop tasks here'

            return (
              <div
                key={stage.status_key}
                style={{ minWidth: '200px', flex: '1 0 200px', maxWidth: '320px' }}
                className={`flex flex-col min-h-[300px] rounded-2xl p-3 transition-all duration-200 ${
                  isOver
                    ? 'bg-white/[0.06] ring-1 ring-white/20'
                    : stage.is_done
                    ? 'bg-green-500/[0.04]'
                    : 'bg-white/[0.025]'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOverCol(stage.status_key) }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    setDragOverCol(null)
                    setDragOverTaskId(null)
                    dragOverTaskIdRef.current = null
                  }
                }}
                onDrop={() => handleDrop(stage.status_key)}
              >
                <div className="h-0.5 rounded-full mb-3 -mx-1" style={{ backgroundColor: `${stageColor(stage.color)}55` }} />
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: stageColor(stage.color) }} />
                    <span className="text-xs font-semibold text-white/80">{stage.name}</span>
                    <span className="text-[10px] text-white/30 bg-white/[0.05] px-1.5 py-0.5 rounded-full">
                      {stageTasks.length}
                    </span>
                    {stage.is_done && (
                      <span className="text-[8px] text-green-400/60 bg-green-500/10 px-1 py-0.5 rounded">Done</span>
                    )}
                  </div>
                  {!selectMode && (
                    <button
                      onClick={() => setCreateModalStage({ status_key: stage.status_key, name: stage.name })}
                      className="text-white/30 hover:text-white/70 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-2 flex-1">
                  {stageTasks.map((task) => (
                    <div
                      key={task.id}
                      onDragOver={(e) => handleTaskDragOver(e, task.id)}
                      className="relative"
                    >
                      {dragOverTaskId === task.id && dragInsertBefore && (
                        <div className="h-0.5 bg-blue-400/60 rounded-full mx-1 mb-1" />
                      )}
                      <TaskCard
                        task={task}
                        onDelete={handleDelete}
                        onUpdate={handleUpdate}
                        draggable={!selectMode}
                        onDragStart={() => handleDragStart(task.id)}
                        selectMode={selectMode}
                        selected={selected.has(task.id)}
                        onToggleSelect={() => toggleSelect(task.id)}
                      />
                      {dragOverTaskId === task.id && !dragInsertBefore && (
                        <div className="h-0.5 bg-blue-400/60 rounded-full mx-1 mt-1" />
                      )}
                    </div>
                  ))}

                  {stageTasks.length === 0 && (
                    <div
                      className={`flex-1 rounded-xl border border-dashed flex flex-col items-center justify-center min-h-[100px] gap-2 transition-all duration-200 ${
                        isOver ? 'border-white/40 bg-white/[0.06]' : 'border-white/[0.08] hover:border-white/20'
                      }`}
                    >
                      <DefaultIcon size={16} className="text-white/20" />
                      <p className="text-[10px] text-white/25 text-center px-3">{defaultHint}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {createModalStage && (
        <TaskCreateModal
          projectId={projectId}
          initialStatus={createModalStage.status_key}
          initialStatusName={createModalStage.name}
          stages={stages}
          user={user}
          onSubmit={handleCreateSubmit}
          onClose={() => setCreateModalStage(null)}
        />
      )}

      {/* Bulk action floating bar */}
      {selectMode && selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-[#1a1a1a] border border-white/20 rounded-2xl px-4 py-3 shadow-2xl whitespace-nowrap">
          <span className="text-xs text-white/60 mr-1 font-medium">{selected.size} selected</span>
          <span className="text-[10px] text-white/30">Move to →</span>
          {stages.map((stage) => (
            <button
              key={stage.status_key}
              onClick={() => handleBulkMove(stage.status_key)}
              disabled={bulkWorking}
              className="text-[10px] px-2.5 py-1.5 rounded-lg bg-white/[0.08] text-white/60 hover:bg-white/15 hover:text-white transition-all disabled:opacity-40"
            >
              {stage.name}
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
