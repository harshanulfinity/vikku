import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Trash2, Loader2, MessageCircle, Send, Trash } from 'lucide-react'
import { updateTask, deleteTask, getTaskComments, createTaskComment, deleteTaskComment } from '../../lib/pmService'
import { useAuth } from '../../contexts/AuthContext'

const PRIORITIES = ['low', 'medium', 'high', 'urgent']

const PRIORITY_STYLES = {
  urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
  high:   'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low:    'bg-white/10 text-white/40 border-white/10',
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function TaskEditModal({ task, onClose, onUpdated, onDeleted }) {
  const { user } = useAuth()
  const [form, setForm] = useState({
    title: task.title || '',
    description: task.description || '',
    priority: task.priority || 'medium',
    due_date: task.due_date || '',
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [sendingComment, setSendingComment] = useState(false)

  useEffect(() => {
    getTaskComments(task.id).then(setComments)
  }, [task.id])

  const handleSave = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    await updateTask(task.id, {
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

  const handleSendComment = async () => {
    if (!newComment.trim() || !user) return
    setSendingComment(true)
    const comment = await createTaskComment({
      task_id: task.id,
      user_id: user.id,
      user_email: user.email,
      content: newComment.trim(),
    })
    setComments((prev) => [...prev, comment])
    setNewComment('')
    setSendingComment(false)
  }

  const handleDeleteComment = async (commentId) => {
    await deleteTaskComment(commentId)
    setComments((prev) => prev.filter((c) => c.id !== commentId))
  }

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done'

  const modal = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#111] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] flex-shrink-0">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Task</p>
            {isOverdue && (
              <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded font-medium">
                OVERDUE
              </span>
            )}
          </div>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all">
            <X size={14} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
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
                        form.priority === p ? PRIORITY_STYLES[p] : 'border-white/[0.08] text-white/30 hover:border-white/20'
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
                  <button onClick={() => setForm({ ...form, due_date: '' })} className="text-[10px] text-white/30 hover:text-white/60 mt-1 transition-colors">
                    Clear date
                  </button>
                )}
              </div>
            </div>

            {/* Comments */}
            <div className="border-t border-white/[0.06] pt-4">
              <div className="flex items-center gap-1.5 mb-3">
                <MessageCircle size={12} className="text-white/30" />
                <label className="text-[10px] text-white/40 uppercase tracking-wider">
                  Comments {comments.length > 0 && `(${comments.length})`}
                </label>
              </div>

              {comments.length > 0 && (
                <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                  {comments.map((c) => (
                    <div key={c.id} className="flex gap-2.5 group">
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[9px] text-white/50">{(c.user_email || '?')[0].toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-white/40">{c.user_email?.split('@')[0]}</span>
                          <span className="text-[10px] text-white/20">{timeAgo(c.created_at)}</span>
                          {c.user_id === user?.id && (
                            <button
                              onClick={() => handleDeleteComment(c.id)}
                              className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all ml-auto"
                            >
                              <Trash size={10} />
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-white/70 leading-relaxed mt-0.5">{c.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendComment() } }}
                  placeholder="Add a comment..."
                  className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-white/20 transition-colors"
                />
                <button
                  onClick={handleSendComment}
                  disabled={sendingComment || !newComment.trim()}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all disabled:opacity-30"
                >
                  {sendingComment ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.08] flex-shrink-0">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 text-xs text-red-400/60 hover:text-red-400 transition-colors disabled:opacity-40"
          >
            <Trash2 size={12} /> {deleting ? 'Deleting...' : 'Delete task'}
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="text-xs text-white/30 hover:text-white/60 transition-colors px-3 py-1.5">
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

  return createPortal(modal, document.body)
}
