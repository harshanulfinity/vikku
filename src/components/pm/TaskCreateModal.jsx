import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, User, Link, ExternalLink } from 'lucide-react'
import { getProjectMembers } from '../../lib/pmService'
import { TASK_LABELS, LABEL_STYLES } from '../../lib/pmConstants'

const PRIORITIES = ['low', 'medium', 'high', 'urgent']

function isValidUrl(str) {
  try { return Boolean(new URL(str)) } catch { return false }
}

const PRIORITY_STYLES = {
  urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
  high:   'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low:    'bg-white/10 text-white/40 border-white/10',
}

const STATUS_LABELS = {
  todo:        'To Do',
  in_progress: 'In Progress',
  review:      'Review',
  done:        'Done',
}

export default function TaskCreateModal({ projectId, initialStatus, user, onSubmit, onClose }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
    assigned_to_email: '',
    label: '',
    task_link: '',
  })
  const [members, setMembers] = useState([])
  const [showAssigneeMenu, setShowAssigneeMenu] = useState(false)

  useEffect(() => {
    if (projectId) getProjectMembers(projectId).then(setMembers)
  }, [projectId])

  const handleCreate = () => {
    if (!form.title.trim()) return
    onSubmit({
      status: initialStatus,
      title: form.title.trim(),
      description: form.description.trim() || null,
      priority: form.priority,
      due_date: form.due_date || null,
      assigned_to_email: form.assigned_to_email || null,
      label: form.label || null,
      task_link: form.task_link.trim() || null,
    })
    onClose()
  }

  const labelStyle = form.label ? LABEL_STYLES[form.label] : null

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#111] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] flex-shrink-0">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">New Task</p>
            <span className="text-[10px] bg-white/[0.06] text-white/40 px-1.5 py-0.5 rounded border border-white/[0.08]">
              {STATUS_LABELS[initialStatus]}
            </span>
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
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') onClose() }}
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
              {form.task_link && !isValidUrl(form.task_link) && (
                <p className="text-[10px] text-yellow-400/70 mt-1">Must start with https://</p>
              )}
              {form.task_link && isValidUrl(form.task_link) && (
                <a href={form.task_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-blue-400/70 hover:text-blue-400 mt-1 transition-colors">
                  <ExternalLink size={9} /> Open link
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-white/[0.08] flex-shrink-0">
          <button onClick={onClose} className="text-xs text-white/30 hover:text-white/60 transition-colors px-3 py-1.5">Cancel</button>
          <button
            onClick={handleCreate}
            disabled={!form.title.trim()}
            className="text-xs bg-white text-black font-semibold px-4 py-1.5 rounded-lg hover:bg-white/90 transition-colors disabled:opacity-40"
          >
            Add Task
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
