import { useState } from 'react'
import { X, Trash2, Loader2 } from 'lucide-react'
import { updateTask, deleteTask } from '../../lib/pmService'

const PRIORITIES = ['low', 'medium', 'high', 'urgent']

const PRIORITY_STYLES = {
  urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
  high:   'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low:    'bg-white/10 text-white/40 border-white/10',
}

export default function TaskEditModal({ task, onClose, onUpdated, onDeleted }) {
  const [form, setForm] = useState({
    title: task.title || '',
    description: task.description || '',
    priority: task.priority || 'medium',
    due_date: task.due_date || '',
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleSave = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    const updated = await updateTask(task.id, {
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      due_date: form.due_date || null,
    })
    setSaving(false)
    onUpdated({ ...task, ...form })
    onClose()
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return
    setDeleting(true)
    await deleteTask(task.id)
    onDeleted(task.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-2xl shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Edit Task</p>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all">
            <X size={14} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="text-[10px] text-white/40 mb-1.5 block uppercase tracking-wider">Title</label>
            <input
              autoFocus
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors"
              placeholder="Task title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] text-white/40 mb-1.5 block uppercase tracking-wider">Notes</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors resize-none"
              placeholder="Add notes or details..."
            />
          </div>

          {/* Priority + Due date row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-white/40 mb-1.5 block uppercase tracking-wider">Priority</label>
              <div className="flex flex-wrap gap-1.5">
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    onClick={() => setForm({ ...form, priority: p })}
                    className={`text-[10px] px-2 py-1 rounded-lg border font-medium capitalize transition-all ${
                      form.priority === p
                        ? PRIORITY_STYLES[p]
                        : 'border-white/[0.08] text-white/30 hover:border-white/20'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-white/40 mb-1.5 block uppercase tracking-wider">Due Date</label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white/70 outline-none focus:border-white/20 transition-colors [color-scheme:dark]"
              />
              {form.due_date && (
                <button
                  onClick={() => setForm({ ...form, due_date: '' })}
                  className="text-[10px] text-white/30 hover:text-white/60 mt-1 transition-colors"
                >
                  Clear date
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.08]">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 text-xs text-red-400/60 hover:text-red-400 transition-colors disabled:opacity-40"
          >
            <Trash2 size={12} /> {deleting ? 'Deleting...' : 'Delete task'}
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="text-xs text-white/30 hover:text-white/60 transition-colors px-3 py-1.5"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.title.trim()}
              className="flex items-center gap-1.5 text-xs bg-white text-black font-semibold px-4 py-1.5 rounded-lg hover:bg-white/90 transition-colors disabled:opacity-40"
            >
              {saving ? <><Loader2 size={11} className="animate-spin" /> Saving...</> : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
