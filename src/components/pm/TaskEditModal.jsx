import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  X, Trash2, Loader2, MessageCircle, Send, Trash,
  CheckSquare, Square, Plus, Clock, User, Timer, Link, ExternalLink,
  Paperclip, Download, FileText,
} from 'lucide-react'
import {
  updateTask, deleteTask, getTaskComments, createTaskComment, deleteTaskComment,
  getSubtasks, createSubtask, updateSubtask, deleteSubtask,
  getTimeLogs, createTimeLog, deleteTimeLog, getProjectMembers,
  getTaskAttachments, uploadTaskAttachment, deleteTaskAttachment, getAttachmentUrl,
} from '../../lib/pmService'
import { TASK_LABELS, LABEL_STYLES } from '../../lib/pmConstants'
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

function fmtMins(m) {
  if (!m || m === 0) return '0m'
  const h = Math.floor(m / 60)
  const mins = m % 60
  if (h === 0) return `${mins}m`
  if (mins === 0) return `${h}h`
  return `${h}h ${mins}m`
}

export default function TaskEditModal({ task, onClose, onUpdated, onDeleted }) {
  const { user } = useAuth()
  const [form, setForm] = useState({
    title: task.title || '',
    description: task.description || '',
    priority: task.priority || 'medium',
    due_date: task.due_date || '',
    assigned_to_email: task.assigned_to_email || '',
    label: task.label || '',
    task_link: task.task_link || '',
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [sendingComment, setSendingComment] = useState(false)

  const [members, setMembers] = useState([])
  const [showAssigneeMenu, setShowAssigneeMenu] = useState(false)

  const [subtasks, setSubtasks] = useState([])
  const [newSubtask, setNewSubtask] = useState('')
  const [addingSubtask, setAddingSubtask] = useState(false)

  const [timeLogs, setTimeLogs] = useState([])
  const [logMinutes, setLogMinutes] = useState('')
  const [logDesc, setLogDesc] = useState('')
  const [loggingTime, setLoggingTime] = useState(false)

  const [attachments, setAttachments] = useState([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    getTaskComments(task.id).then(setComments)
    getSubtasks(task.id).then(setSubtasks)
    getTimeLogs(task.id).then(setTimeLogs)
    getTaskAttachments(task.id).then(setAttachments)
    if (task.project_id) getProjectMembers(task.project_id).then(setMembers)
  }, [task.id, task.project_id])

  const totalLogged = timeLogs.reduce((s, l) => s + (l.minutes || 0), 0)
  const subtasksDone = subtasks.filter((s) => s.completed).length

  const handleSave = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    await updateTask(task.id, {
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      due_date: form.due_date || null,
      assigned_to_email: form.assigned_to_email || null,
      label: form.label || null,
      task_link: form.task_link.trim() || null,
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
    const comment = await createTaskComment({ task_id: task.id, user_id: user.id, user_email: user.email, content: newComment.trim() })
    setComments((prev) => [...prev, comment])
    setNewComment('')
    setSendingComment(false)
  }

  const handleDeleteComment = async (commentId) => {
    await deleteTaskComment(commentId)
    setComments((prev) => prev.filter((c) => c.id !== commentId))
  }

  const handleAddSubtask = async () => {
    if (!newSubtask.trim()) return
    setAddingSubtask(true)
    try {
      const st = await createSubtask({ task_id: task.id, title: newSubtask.trim(), completed: false })
      setSubtasks((prev) => [...prev, st])
      setNewSubtask('')
    } catch {}
    setAddingSubtask(false)
  }

  const handleToggleSubtask = async (st) => {
    const updated = await updateSubtask(st.id, { completed: !st.completed })
    setSubtasks((prev) => prev.map((s) => (s.id === st.id ? updated : s)))
  }

  const handleDeleteSubtask = async (id) => {
    await deleteSubtask(id)
    setSubtasks((prev) => prev.filter((s) => s.id !== id))
  }

  const handleLogTime = async (mins) => {
    const m = parseInt(mins)
    if (!m || m <= 0) return
    setLoggingTime(true)
    try {
      const log = await createTimeLog({ task_id: task.id, project_id: task.project_id, user_id: user?.id, minutes: m, note: logDesc.trim() || null })
      setTimeLogs((prev) => [log, ...prev])
      setLogMinutes('')
      setLogDesc('')
    } catch {}
    setLoggingTime(false)
  }

  const handleDeleteTimeLog = async (id) => {
    await deleteTimeLog(id)
    setTimeLogs((prev) => prev.filter((l) => l.id !== id))
  }

  const handleUploadAttachment = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)
    try {
      const att = await uploadTaskAttachment(task.id, user.id, file)
      setAttachments((prev) => [...prev, att])
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDeleteAttachment = async (att) => {
    await deleteTaskAttachment(att.id, att.file_path)
    setAttachments((prev) => prev.filter((a) => a.id !== att.id))
  }

  const handleDownloadAttachment = async (att) => {
    const url = await getAttachmentUrl(att.file_path)
    if (url) window.open(url, '_blank')
  }

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done'
  const labelStyle = form.label ? LABEL_STYLES[form.label] : null

  const modal = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#111] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] flex-shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Task</p>
            {isOverdue && <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded font-medium">OVERDUE</span>}
            {totalLogged > 0 && (
              <span className="text-[9px] bg-white/[0.06] text-white/40 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Timer size={8} /> {fmtMins(totalLogged)}
              </span>
            )}
            {form.label && labelStyle && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium ${labelStyle.bg} ${labelStyle.text} ${labelStyle.border}`}>
                {form.label}
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

            {/* Label */}
            <div>
              <label className="text-[10px] text-white/40 mb-1.5 block uppercase tracking-wider">Label</label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setForm({ ...form, label: '' })}
                  className={`text-[10px] px-2 py-1 rounded-lg border font-medium transition-all ${
                    !form.label ? 'bg-white/10 text-white/60 border-white/20' : 'border-white/[0.08] text-white/25 hover:border-white/20'
                  }`}
                >
                  None
                </button>
                {TASK_LABELS.map((lbl) => {
                  const s = LABEL_STYLES[lbl]
                  return (
                    <button
                      key={lbl}
                      onClick={() => setForm({ ...form, label: form.label === lbl ? '' : lbl })}
                      className={`text-[10px] px-2 py-1 rounded-lg border font-medium transition-all ${
                        form.label === lbl ? `${s.bg} ${s.text} ${s.border}` : 'border-white/[0.08] text-white/30 hover:border-white/20'
                      }`}
                    >
                      {lbl}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Priority + Due date */}
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

            {/* Assignee */}
            <div className="relative">
              <label className="text-[10px] text-white/40 mb-1.5 block uppercase tracking-wider">Assignee</label>
              <button
                onClick={() => setShowAssigneeMenu(!showAssigneeMenu)}
                className="w-full flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-left transition-colors hover:border-white/20"
              >
                <User size={12} className="text-white/30 flex-shrink-0" />
                <span className={form.assigned_to_email ? 'text-white/70' : 'text-white/30'}>
                  {form.assigned_to_email || 'Unassigned'}
                </span>
              </button>
              {showAssigneeMenu && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl z-10 overflow-hidden">
                  <button onClick={() => { setForm({ ...form, assigned_to_email: '' }); setShowAssigneeMenu(false) }} className="w-full text-left px-3 py-2 text-xs text-white/40 hover:bg-white/[0.05] transition-colors">Unassigned</button>
                  {user?.email && (
                    <button onClick={() => { setForm({ ...form, assigned_to_email: user.email }); setShowAssigneeMenu(false) }} className="w-full text-left px-3 py-2 text-xs text-white/70 hover:bg-white/[0.05] transition-colors flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[9px]">{user.email[0].toUpperCase()}</span>
                      {user.email} <span className="text-white/30 ml-auto">me</span>
                    </button>
                  )}
                  {members.filter((m) => m.email !== user?.email).map((m) => (
                    <button key={m.id} onClick={() => { setForm({ ...form, assigned_to_email: m.email }); setShowAssigneeMenu(false) }} className="w-full text-left px-3 py-2 text-xs text-white/70 hover:bg-white/[0.05] transition-colors flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[9px]">{(m.email || '?')[0].toUpperCase()}</span>
                      {m.email}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* External Link */}
            <div>
              <label className="text-[10px] text-white/40 mb-1.5 block uppercase tracking-wider">External Link</label>
              <div className="relative">
                <Link size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                <input
                  value={form.task_link}
                  onChange={(e) => setForm({ ...form, task_link: e.target.value })}
                  placeholder="https://github.com/... or Figma, Notion link"
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-white/20 transition-colors"
                />
              </div>
              {form.task_link && (
                <a href={form.task_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-blue-400/70 hover:text-blue-400 mt-1 transition-colors">
                  <ExternalLink size={9} /> Open link
                </a>
              )}
            </div>

            {/* Subtasks */}
            <div className="border-t border-white/[0.06] pt-4">
              <div className="flex items-center gap-1.5 mb-3">
                <CheckSquare size={12} className="text-white/30" />
                <label className="text-[10px] text-white/40 uppercase tracking-wider">
                  Subtasks {subtasks.length > 0 && `(${subtasksDone}/${subtasks.length})`}
                </label>
              </div>
              {subtasks.length > 0 && (
                <div className="mb-3">
                  <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-green-400/60 rounded-full transition-all duration-300" style={{ width: `${(subtasksDone / subtasks.length) * 100}%` }} />
                  </div>
                  <div className="space-y-1.5">
                    {subtasks.map((st) => (
                      <div key={st.id} className="flex items-center gap-2 group">
                        <button onClick={() => handleToggleSubtask(st)} className="flex-shrink-0 text-white/40 hover:text-white/80 transition-colors">
                          {st.completed ? <CheckSquare size={13} className="text-green-400" /> : <Square size={13} />}
                        </button>
                        <span className={`text-xs flex-1 leading-snug ${st.completed ? 'line-through text-white/30' : 'text-white/70'}`}>{st.title}</span>
                        <button onClick={() => handleDeleteSubtask(st.id)} className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all"><Trash size={10} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <input
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubtask() } }}
                  placeholder="Add subtask..."
                  className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-white/20 transition-colors"
                />
                <button onClick={handleAddSubtask} disabled={addingSubtask || !newSubtask.trim()} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all disabled:opacity-30">
                  {addingSubtask ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                </button>
              </div>
            </div>

            {/* Time Tracking */}
            <div className="border-t border-white/[0.06] pt-4">
              <div className="flex items-center gap-1.5 mb-3">
                <Clock size={12} className="text-white/30" />
                <label className="text-[10px] text-white/40 uppercase tracking-wider">
                  Time Logged {totalLogged > 0 && `· ${fmtMins(totalLogged)} total`}
                </label>
              </div>
              <div className="flex gap-1.5 mb-2">
                {[15, 30, 60, 120].map((m) => (
                  <button key={m} onClick={() => handleLogTime(m)} className="text-[10px] px-2 py-1 rounded-lg border border-white/[0.08] text-white/40 hover:border-white/20 hover:text-white/70 transition-all">
                    +{fmtMins(m)}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mb-3">
                <input type="number" min="1" value={logMinutes} onChange={(e) => setLogMinutes(e.target.value)} placeholder="Minutes" className="w-24 bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-white/20 transition-colors" />
                <input value={logDesc} onChange={(e) => setLogDesc(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleLogTime(logMinutes) } }} placeholder="Note (optional)" className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-white/20 transition-colors" />
                <button onClick={() => handleLogTime(logMinutes)} disabled={loggingTime || !logMinutes} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all disabled:opacity-30">
                  {loggingTime ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                </button>
              </div>
              {timeLogs.length > 0 && (
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {timeLogs.slice(0, 5).map((l) => (
                    <div key={l.id} className="flex items-center gap-2 group">
                      <span className="text-[10px] text-white/50 font-medium w-10 flex-shrink-0">{fmtMins(l.minutes)}</span>
                      <span className="text-[10px] text-white/30 flex-1 truncate">{l.note || timeAgo(l.created_at)}</span>
                      <button onClick={() => handleDeleteTimeLog(l.id)} className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all"><Trash size={10} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Comments */}
            <div className="border-t border-white/[0.06] pt-4">
              <div className="flex items-center gap-1.5 mb-3">
                <MessageCircle size={12} className="text-white/30" />
                <label className="text-[10px] text-white/40 uppercase tracking-wider">Comments {comments.length > 0 && `(${comments.length})`}</label>
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
                            <button onClick={() => handleDeleteComment(c.id)} className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all ml-auto"><Trash size={10} /></button>
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
                <button onClick={handleSendComment} disabled={sendingComment || !newComment.trim()} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all disabled:opacity-30">
                  {sendingComment ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                </button>
              </div>
            </div>

            {/* Attachments */}
            <div className="border-t border-white/[0.06] pt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Paperclip size={12} className="text-white/30" />
                  <label className="text-[10px] text-white/40 uppercase tracking-wider">
                    Attachments {attachments.length > 0 && `(${attachments.length})`}
                  </label>
                </div>
                <label className="flex items-center gap-1.5 text-[10px] text-white/40 hover:text-white/70 cursor-pointer transition-colors border border-white/[0.08] hover:border-white/20 px-2 py-1 rounded-lg">
                  {uploading ? <Loader2 size={10} className="animate-spin" /> : <Plus size={10} />}
                  {uploading ? 'Uploading...' : 'Add file'}
                  <input type="file" className="hidden" onChange={handleUploadAttachment} disabled={uploading} />
                </label>
              </div>
              {attachments.length > 0 ? (
                <div className="space-y-1.5">
                  {attachments.map((att) => (
                    <div key={att.id} className="flex items-center gap-2 group bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2">
                      <FileText size={11} className="text-white/30 flex-shrink-0" />
                      <span className="text-[11px] text-white/60 flex-1 truncate">{att.file_name}</span>
                      {att.file_size && (
                        <span className="text-[10px] text-white/20 flex-shrink-0">
                          {att.file_size > 1024 * 1024
                            ? `${(att.file_size / 1024 / 1024).toFixed(1)} MB`
                            : `${Math.round(att.file_size / 1024)} KB`}
                        </span>
                      )}
                      <button onClick={() => handleDownloadAttachment(att)} className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-white transition-all flex-shrink-0">
                        <Download size={11} />
                      </button>
                      <button onClick={() => handleDeleteAttachment(att)} className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all flex-shrink-0">
                        <Trash size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-white/20 text-center py-2">No attachments yet. Add files, screenshots, or docs.</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.08] flex-shrink-0">
          <button onClick={handleDelete} disabled={deleting} className="flex items-center gap-1.5 text-xs text-red-400/60 hover:text-red-400 transition-colors disabled:opacity-40">
            <Trash2 size={12} /> {deleting ? 'Deleting...' : 'Delete task'}
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="text-xs text-white/30 hover:text-white/60 transition-colors px-3 py-1.5">Cancel</button>
            <button onClick={handleSave} disabled={saving || !form.title.trim()} className="flex items-center gap-1.5 text-xs bg-white text-black font-semibold px-4 py-1.5 rounded-lg hover:bg-white/90 transition-colors disabled:opacity-40">
              {saving ? <><Loader2 size={11} className="animate-spin" /> Saving...</> : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
