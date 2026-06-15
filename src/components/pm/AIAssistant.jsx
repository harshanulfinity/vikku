import { useState } from 'react'
import { Sparkles, X, Check, Loader2, Lock } from 'lucide-react'
import { planProject } from '../../lib/openaiService'
import { bulkCreateTasks, bulkCreateMilestones } from '../../lib/pmService'
import UpgradeModal from './UpgradeModal'

export default function AIAssistant({ projectId, projectName, onDone, isPro }) {
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')
  const [adding, setAdding] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)

  const handleOpen = () => {
    if (!isPro) { setShowUpgrade(true); return }
    setOpen(true)
  }

  const handleGenerate = async () => {
    if (!description.trim()) return
    setLoading(true)
    setError('')
    try {
      const result = await planProject(`${projectName}: ${description}`)
      setPreview(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToProject = async () => {
    if (!preview) return
    setAdding(true)
    try {
      const tasksWithProject = preview.tasks.map((t) => ({ ...t, project_id: projectId }))
      const milestonesWithProject = preview.milestones.map((m) => ({ ...m, project_id: projectId }))
      await Promise.all([
        bulkCreateTasks(tasksWithProject),
        bulkCreateMilestones(milestonesWithProject),
      ])
      onDone()
      setOpen(false)
      setPreview(null)
      setDescription('')
    } catch (err) {
      setError(err.message)
    } finally {
      setAdding(false)
    }
  }

  return (
    <>
      {showUpgrade && (
        <UpgradeModal
          reason="AI Project Planner is a Pro feature. Upgrade to generate tasks + milestones instantly."
          onClose={() => setShowUpgrade(false)}
          onUpgraded={() => { setShowUpgrade(false); setOpen(true) }}
        />
      )}

      {!open && (
        <button
          onClick={handleOpen}
          className="flex items-center gap-2 text-xs bg-white/[0.06] hover:bg-white/10 text-white px-4 py-2.5 rounded-xl transition-all border border-white/[0.08] hover:border-white/20"
        >
          {isPro ? (
            <Sparkles size={14} className="text-yellow-400" />
          ) : (
            <Lock size={13} className="text-white/40" />
          )}
          Plan with AI
          {!isPro && <span className="text-[10px] text-yellow-400/60 ml-0.5">Pro</span>}
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl glass rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-yellow-400" />
                <h3 className="font-display font-semibold text-white">AI Project Planner</h3>
              </div>
              <button onClick={() => { setOpen(false); setPreview(null) }} className="text-white/40 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 max-h-[80vh] overflow-y-auto">
              {!preview ? (
                <>
                  <p className="text-sm text-white/60 mb-4">
                    Describe what you're building and the AI will generate a full task list with milestones.
                  </p>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder={`e.g. "Build a 6-page website for a clothing brand with home, shop, about, and contact pages. Launch in 6 weeks."`}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/20 resize-none mb-4"
                  />
                  {error && <p className="text-red-400 text-xs mb-4">{error}</p>}
                  <button
                    onClick={handleGenerate}
                    disabled={loading || !description.trim()}
                    className="flex items-center gap-2 bg-white text-black font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {loading ? <><Loader2 size={16} className="animate-spin" /> Generating...</> : <><Sparkles size={16} /> Generate Plan</>}
                  </button>
                </>
              ) : (
                <>
                  {/* Summary */}
                  <div className="mb-6">
                    <p className="text-xs text-white/50 mb-1">Summary</p>
                    <p className="text-sm text-white/80 leading-relaxed">{preview.summary}</p>
                  </div>

                  {/* Tasks preview */}
                  <div className="mb-6">
                    <p className="text-xs text-white/50 mb-3">{preview.tasks.length} Tasks</p>
                    <div className="space-y-2">
                      {preview.tasks.map((task, i) => (
                        <div key={i} className="flex items-start gap-3 bg-white/[0.03] rounded-xl px-4 py-3">
                          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                            task.priority === 'urgent' ? 'bg-red-400' :
                            task.priority === 'high' ? 'bg-orange-400' :
                            task.priority === 'medium' ? 'bg-yellow-400' : 'bg-white/30'
                          }`} />
                          <div>
                            <p className="text-xs font-medium text-white">{task.title}</p>
                            <p className="text-[10px] text-white/40 mt-0.5">{task.status} · {task.priority}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Milestones preview */}
                  <div className="mb-6">
                    <p className="text-xs text-white/50 mb-3">{preview.milestones.length} Milestones</p>
                    <div className="space-y-2">
                      {preview.milestones.map((m, i) => (
                        <div key={i} className="flex items-center gap-3 bg-white/[0.03] rounded-xl px-4 py-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                          <p className="text-xs text-white flex-1">{m.title}</p>
                          <p className="text-[10px] text-white/40 flex-shrink-0">
                            {new Date(m.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {error && <p className="text-red-400 text-xs mb-4">{error}</p>}

                  <div className="flex gap-3">
                    <button
                      onClick={handleAddToProject}
                      disabled={adding}
                      className="flex items-center gap-2 bg-white text-black font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-40"
                    >
                      {adding ? <><Loader2 size={16} className="animate-spin" /> Adding...</> : <><Check size={16} /> Add to project</>}
                    </button>
                    <button
                      onClick={() => setPreview(null)}
                      className="text-sm text-white/40 hover:text-white/70 transition-colors"
                    >
                      Try again
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
