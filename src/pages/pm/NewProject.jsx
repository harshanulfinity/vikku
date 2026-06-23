import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Square, Rocket, Globe, Megaphone, Map, BookOpen } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { createProject, bulkCreateTasks, bulkCreateMilestones } from '../../lib/pmService'
import AppHeader from '../../components/AppHeader'

const COLORS = [
  '#ffffff', '#6ee7b7', '#93c5fd', '#fbbf24', '#f87171',
  '#c084fc', '#fb923c', '#34d399', '#60a5fa', '#f472b6',
]

const STATUS_OPTIONS = ['active', 'on-hold']

function daysFromNow(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

const TEMPLATES = [
  {
    key: 'blank',
    Icon: Square,
    name: 'Blank',
    tasks: [],
    milestones: [],
  },
  {
    key: 'startup',
    Icon: Rocket,
    name: 'Startup Launch',
    description: '12 tasks · 4 milestones',
    tasks: [
      { title: 'Define MVP features and scope', status: 'todo', priority: 'high' },
      { title: 'Set up development environment', status: 'todo', priority: 'medium' },
      { title: 'Design wireframes and user flows', status: 'todo', priority: 'high' },
      { title: 'Build core product features', status: 'todo', priority: 'high' },
      { title: 'Set up landing page', status: 'todo', priority: 'medium' },
      { title: 'Integrate payment gateway', status: 'todo', priority: 'high' },
      { title: 'Write onboarding copy', status: 'todo', priority: 'medium' },
      { title: 'Set up analytics tracking', status: 'todo', priority: 'low' },
      { title: 'Beta test with 10 users', status: 'todo', priority: 'high' },
      { title: 'Fix bugs from beta feedback', status: 'todo', priority: 'urgent' },
      { title: 'Set up customer support channel', status: 'todo', priority: 'medium' },
      { title: 'Prepare launch announcement', status: 'todo', priority: 'medium' },
    ],
    milestones: [
      { title: 'Wireframes approved', daysFromNow: 7 },
      { title: 'MVP feature complete', daysFromNow: 21 },
      { title: 'Beta launch', daysFromNow: 35 },
      { title: 'Public launch', daysFromNow: 45 },
    ],
  },
  {
    key: 'webdev',
    Icon: Globe,
    name: 'Web Development',
    description: '14 tasks · 5 milestones',
    tasks: [
      { title: 'Gather requirements from client', status: 'todo', priority: 'high' },
      { title: 'Create sitemap and architecture', status: 'todo', priority: 'high' },
      { title: 'Design UI mockups', status: 'todo', priority: 'high' },
      { title: 'Get design approval', status: 'todo', priority: 'medium' },
      { title: 'Set up project repository', status: 'todo', priority: 'medium' },
      { title: 'Build homepage', status: 'todo', priority: 'high' },
      { title: 'Build inner pages', status: 'todo', priority: 'high' },
      { title: 'Add animations and interactions', status: 'todo', priority: 'medium' },
      { title: 'Integrate CMS or backend', status: 'todo', priority: 'medium' },
      { title: 'Cross-browser and mobile testing', status: 'todo', priority: 'high' },
      { title: 'SEO setup and meta tags', status: 'todo', priority: 'medium' },
      { title: 'Performance optimization', status: 'todo', priority: 'medium' },
      { title: 'Client review round', status: 'todo', priority: 'high' },
      { title: 'Deploy to production', status: 'todo', priority: 'urgent' },
    ],
    milestones: [
      { title: 'Design approved', daysFromNow: 5 },
      { title: 'Homepage done', daysFromNow: 14 },
      { title: 'All pages complete', daysFromNow: 25 },
      { title: 'Client review done', daysFromNow: 32 },
      { title: 'Site live', daysFromNow: 38 },
    ],
  },
  {
    key: 'marketing',
    Icon: Megaphone,
    name: 'Marketing Campaign',
    description: '10 tasks · 3 milestones',
    tasks: [
      { title: 'Define campaign goals and KPIs', status: 'todo', priority: 'high' },
      { title: 'Identify target audience', status: 'todo', priority: 'high' },
      { title: 'Create campaign messaging and hooks', status: 'todo', priority: 'high' },
      { title: 'Design ad creatives', status: 'todo', priority: 'medium' },
      { title: 'Write ad copy for all channels', status: 'todo', priority: 'medium' },
      { title: 'Set up ad campaigns (Meta/Google)', status: 'todo', priority: 'high' },
      { title: 'Launch email sequence', status: 'todo', priority: 'medium' },
      { title: 'Monitor and optimize ads daily', status: 'todo', priority: 'urgent' },
      { title: 'A/B test creatives', status: 'todo', priority: 'medium' },
      { title: 'Final performance report', status: 'todo', priority: 'low' },
    ],
    milestones: [
      { title: 'Campaign assets ready', daysFromNow: 7 },
      { title: 'Campaign goes live', daysFromNow: 10 },
      { title: 'Performance review', daysFromNow: 30 },
    ],
  },
  {
    key: 'roadmap',
    Icon: Map,
    name: 'Product Roadmap',
    description: '12 tasks · 5 milestones',
    tasks: [
      { title: 'Collect customer feedback and pain points', status: 'todo', priority: 'high' },
      { title: 'Prioritize features using impact/effort matrix', status: 'todo', priority: 'high' },
      { title: 'Define Q1 goals', status: 'todo', priority: 'high' },
      { title: 'Write product specs for top features', status: 'todo', priority: 'medium' },
      { title: 'Validate concepts with users', status: 'todo', priority: 'medium' },
      { title: 'Build feature A', status: 'todo', priority: 'high' },
      { title: 'Build feature B', status: 'todo', priority: 'high' },
      { title: 'Build feature C', status: 'todo', priority: 'medium' },
      { title: 'Internal QA testing', status: 'todo', priority: 'high' },
      { title: 'Staged rollout to users', status: 'todo', priority: 'medium' },
      { title: 'Monitor metrics post-launch', status: 'todo', priority: 'medium' },
      { title: 'Plan Q2 roadmap', status: 'todo', priority: 'low' },
    ],
    milestones: [
      { title: 'Roadmap finalized', daysFromNow: 7 },
      { title: 'Feature A shipped', daysFromNow: 21 },
      { title: 'Feature B shipped', daysFromNow: 35 },
      { title: 'Feature C shipped', daysFromNow: 50 },
      { title: 'Q1 review complete', daysFromNow: 60 },
    ],
  },
  {
    key: 'course',
    Icon: BookOpen,
    name: 'Personal Course',
    description: '8 tasks · 3 milestones',
    tasks: [
      { title: 'Define course topic and target student', status: 'todo', priority: 'high' },
      { title: 'Outline curriculum and modules', status: 'todo', priority: 'high' },
      { title: 'Record module 1 videos', status: 'todo', priority: 'high' },
      { title: 'Record module 2 videos', status: 'todo', priority: 'high' },
      { title: 'Record module 3 videos', status: 'todo', priority: 'high' },
      { title: 'Edit and export videos', status: 'todo', priority: 'medium' },
      { title: 'Set up course on platform', status: 'todo', priority: 'medium' },
      { title: 'Launch to first students', status: 'todo', priority: 'urgent' },
    ],
    milestones: [
      { title: 'Curriculum approved', daysFromNow: 5 },
      { title: 'All videos recorded', daysFromNow: 20 },
      { title: 'Course live', daysFromNow: 30 },
    ],
  },
]

export default function NewProject() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const fromEstimate = location.state?.fromEstimate || null
  const [selectedTemplate, setSelectedTemplate] = useState('blank')
  const [form, setForm] = useState({
    name: fromEstimate?.name || '',
    description: fromEstimate?.description || '',
    client_name: '',
    client_email: '',
    color: '#ffffff',
    status: 'active',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [bannerDismissed, setBannerDismissed] = useState(false)

  const template = TEMPLATES.find((t) => t.key === selectedTemplate)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmedName = form.name.trim()
    if (!trimmedName) { setError('Project name is required'); return }
    if (trimmedName.length > 100) { setError('Project name must be under 100 characters'); return }
    if (form.client_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.client_email)) {
      setError('Please enter a valid client email address')
      return
    }
    setSaving(true)
    setError('')
    try {
      const project = await createProject({ ...form, name: trimmedName, user_id: user.id })

      if (template && template.tasks.length > 0) {
        await bulkCreateTasks(template.tasks.map((t) => ({ ...t, project_id: project.id })))
      }
      const estimateMilestones = fromEstimate?.phases?.length && (!template || template.milestones.length === 0)
        ? fromEstimate.phases
        : null
      if (estimateMilestones) {
        await bulkCreateMilestones(estimateMilestones.map((m) => ({
          project_id: project.id,
          title: m.title,
          due_date: daysFromNow(m.daysFromNow),
          completed: false,
        })))
      } else if (template && template.milestones.length > 0) {
        await bulkCreateMilestones(template.milestones.map((m) => ({
          project_id: project.id,
          title: m.title,
          due_date: daysFromNow(m.daysFromNow),
          completed: false,
        })))
      }

      const isBlank = !template || template.tasks.length === 0
      navigate(`/pm/projects/${project.slug || project.id}${isBlank ? '?onboard=1' : ''}`)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <AppHeader breadcrumbs={[{ label: 'PM', href: '/pm' }, { label: 'Projects', href: '/pm/dashboard' }, { label: 'New Project' }]} />

      <div className="max-w-2xl mx-auto px-6 py-10">

        {fromEstimate && !bannerDismissed && (
          <div className="mb-6 flex items-center gap-3 bg-white/[0.06] border border-white/[0.12] rounded-xl px-4 py-3">
            <span className="text-xs text-white/80 flex-1">Pre-filled from your estimate. You can edit any field before creating.</span>
            <button onClick={() => setBannerDismissed(true)} className="text-white/30 hover:text-white/60 transition-colors text-xs">Dismiss</button>
          </div>
        )}

        {/* Template picker */}
        <div className="mb-8">
          <label className="text-xs text-white/50 mb-3 block">Choose a template</label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {TEMPLATES.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setSelectedTemplate(t.key)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${
                  selectedTemplate === t.key
                    ? 'border-white bg-white/10'
                    : 'border-white/[0.08] hover:border-white/25 hover:bg-white/[0.04]'
                }`}
              >
                <t.Icon size={16} className={selectedTemplate === t.key ? 'text-white' : 'text-white/50'} />
                <span className="text-[10px] text-white/70 leading-tight">{t.name}</span>
              </button>
            ))}
          </div>
          {template && template.key !== 'blank' && (
            <div className="mt-3 flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3">
              <template.Icon size={16} className="text-white/50 flex-shrink-0" />
              <div>
                <p className="text-xs text-white font-medium">{template.name} template</p>
                <p className="text-[10px] text-white/40">{template.description} will be created automatically</p>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Color picker */}
          <div>
            <label className="text-xs text-white/50 mb-3 block">Project Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className={`w-8 h-8 rounded-full transition-all ${
                    form.color === c ? 'ring-2 ring-offset-2 ring-offset-black ring-white scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs text-white/50 mb-2 block">Project Name *</label>
            <input
              autoFocus
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. HSO CCTV Website"
              maxLength={200}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/20"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-white/50 mb-2 block">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="What are you building? Keep it brief."
              maxLength={2000}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/20 resize-none"
            />
          </div>

          {/* Status */}
          <div>
            <label className="text-xs text-white/50 mb-2 block">Status</label>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm({ ...form, status: s })}
                  className={`text-xs px-4 py-2 rounded-lg border transition-all capitalize ${
                    form.status === s
                      ? 'bg-white text-black border-white font-semibold'
                      : 'border-white/10 text-white/50 hover:border-white/20'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Client */}
          <div className="glass rounded-xl p-5">
            <p className="text-xs font-semibold text-white/60 mb-4">Client Details (optional)</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/40 mb-2 block">Client Name</label>
                <input
                  value={form.client_name}
                  onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                  placeholder="e.g. Suresh Reddy"
                  className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-white/20"
                />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-2 block">Client Email</label>
                <input
                  type="email"
                  value={form.client_email}
                  onChange={(e) => setForm({ ...form, client_email: e.target.value })}
                  placeholder="client@example.com"
                  className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-white/20"
                />
              </div>
            </div>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-white text-black font-semibold text-sm px-6 py-3 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-40"
            >
              {saving ? 'Creating...' : 'Create Project'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/pm/dashboard')}
              className="text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
