import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Loader2, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react'
import { calculateTimeline } from '../lib/openaiService'

const PROJECT_TYPES = [
  'Landing Page / Business Website',
  'E-Commerce Store',
  'Web App with User Auth & Dashboard',
  'SaaS Platform',
  'Admin Panel / Internal Tool',
  'Mobile App (React Native)',
  'API / Backend System',
  'Staffing / HR Platform',
  'Booking / Scheduling System',
  'Custom Enterprise Platform',
]

const FEATURE_OPTIONS = [
  { label: '1–3 features (simple)', value: '1–3 features (simple scope)' },
  { label: '4–8 features (medium)', value: '4–8 features (medium scope)' },
  { label: '9–15 features (complex)', value: '9–15 features (complex scope)' },
  { label: '15+ features (large)', value: '15+ features (large platform)' },
]

const DESIGN_OPTIONS = [
  { label: 'Simple - clean & minimal', value: 'Simple - clean, minimal design with few custom elements' },
  { label: 'Moderate - branded UI', value: 'Moderate - branded with custom components and animations' },
  { label: 'Complex - custom illustrations, lots of animations', value: 'Complex - extensive custom design, illustrations, and micro-animations' },
]

const REVISION_OPTIONS = ['1 round', '2–3 rounds', '4+ rounds']
const AVAILABILITY_OPTIONS = [
  { label: 'High - I\'ll review within 24 hours', value: 'High (responds within 24 hours)' },
  { label: 'Medium - 2–3 days to review', value: 'Medium (2–3 days to review feedback)' },
  { label: 'Low - 1 week+ response time', value: 'Low (1+ week response time)' },
]

export default function TimelineCalculator() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    projectType: '',
    featureCount: '',
    designComplexity: '',
    revisions: '',
    clientAvailability: '',
    hasDesign: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const missing = Object.entries(form).find(([, v]) => !v)
    if (missing) return setError('Please answer all questions before generating your timeline.')
    setLoading(true)
    try {
      const res = await calculateTimeline(form)
      setResult(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const SelectRow = ({ label, options, field, isValue = false }) => (
    <div>
      <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">{label}</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map(opt => {
          const val = isValue ? opt.value : opt
          const display = isValue ? opt.label : opt
          return (
            <button key={val} type="button"
              onClick={() => setForm(f => ({ ...f, [field]: val }))}
              className={`glass rounded-xl px-4 py-3 text-sm text-left transition-all ${
                form[field] === val ? 'border border-white/40 text-white' : 'text-white/60 hover:text-white'
              }`}
            >{display}</button>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="sticky top-0 z-50 glass border-b border-white/[0.05] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm">
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <h1 className="font-display font-bold text-lg text-white">Timeline Calculator</h1>
          <div className="w-32" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {!result ? (
          <>
            <div className="mb-10">
              <h2 className="font-display font-extrabold text-3xl text-white mb-3">How Long Will Your Project Take?</h2>
              <p className="text-white/60 text-sm max-w-xl">
                Get a realistic timeline with phase breakdown, milestones, and tips to keep your project on track.
              </p>
            </div>

            <div className="glass rounded-2xl p-8">
              <form onSubmit={handleSubmit} className="space-y-8">

                <div>
                  <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">What are you building?</label>
                  <select
                    value={form.projectType}
                    onChange={e => setForm(f => ({ ...f, projectType: e.target.value }))}
                    className="w-full glass rounded-xl px-4 py-3 text-sm text-white bg-transparent focus:outline-none cursor-pointer"
                  >
                    <option value="" className="bg-black">Select project type...</option>
                    {PROJECT_TYPES.map(t => <option key={t} value={t} className="bg-black">{t}</option>)}
                  </select>
                </div>

                <SelectRow label="How many features / pages?" options={FEATURE_OPTIONS} field="featureCount" isValue />
                <SelectRow label="Design complexity?" options={DESIGN_OPTIONS} field="designComplexity" isValue />
                <SelectRow label="How many revision rounds do you expect?" options={REVISION_OPTIONS} field="revisions" />
                <SelectRow label="How available are you for feedback and approvals?" options={AVAILABILITY_OPTIONS} field="clientAvailability" isValue />

                <div>
                  <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">Do you already have design assets / brand kit?</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Yes - logos, colors, fonts ready', 'Partial - have logo only', 'No - starting from scratch'].map(opt => (
                      <button key={opt} type="button"
                        onClick={() => setForm(f => ({ ...f, hasDesign: opt }))}
                        className={`glass rounded-xl px-4 py-3 text-xs text-left transition-all ${
                          form.hasDesign === opt ? 'border border-white/40 text-white' : 'text-white/60 hover:text-white'
                        }`}
                      >{opt}</button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="glass rounded-lg p-4 flex items-start gap-3 border border-red-500/20">
                    <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? <><Loader2 size={18} className="animate-spin" /> Generating timeline...</> : 'Generate My Timeline'}
                </button>
              </form>
            </div>
          </>
        ) : (
          <>
            <div className="mb-10">
              <h2 className="font-display font-extrabold text-3xl text-white mb-3">Your Project Timeline</h2>
              <p className="text-white/60 text-sm">Estimated total: <span className="text-white font-semibold">{result.totalWeeksMin}–{result.totalWeeksMax} weeks</span></p>
            </div>

            {/* Total */}
            <div className="glass-strong rounded-2xl p-8 mb-6 flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl glass flex items-center justify-center flex-shrink-0">
                <Clock size={32} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Estimated Timeline</p>
                <p className="text-4xl font-bold text-white">{result.totalWeeksMin}–{result.totalWeeksMax} weeks</p>
                <p className="text-xs text-white/40 mt-1">≈ {Math.round(result.totalWeeksMin / 4)}–{Math.round(result.totalWeeksMax / 4)} months</p>
              </div>
            </div>

            {/* Phases */}
            <div className="glass rounded-2xl p-8 mb-6">
              <h3 className="font-display font-semibold text-lg text-white mb-6">Phase Breakdown</h3>
              <div className="space-y-4">
                {result.phases?.map((phase, i) => (
                  <div key={i} className="glass rounded-xl p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/40 font-mono">0{i + 1}</span>
                        <h4 className="font-semibold text-white text-sm">{phase.name}</h4>
                      </div>
                      <span className="text-sm text-white/60 font-medium">{phase.weeksMin}–{phase.weeksMax} wks</span>
                    </div>
                    <p className="text-xs text-white/60 mb-3">{phase.description}</p>
                    {phase.deliverables?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {phase.deliverables.map((d, j) => (
                          <span key={j} className="text-[10px] glass px-2 py-1 rounded-md text-white/50">{d}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Milestones */}
            {result.milestones?.length > 0 && (
              <div className="glass rounded-2xl p-8 mb-6">
                <h3 className="font-display font-semibold text-lg text-white mb-6">Key Milestones</h3>
                <div className="space-y-3">
                  {result.milestones.map((m, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <span className="text-xs text-white/40 font-mono w-16 flex-shrink-0">Week {m.week}</span>
                      <div className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
                        <span className="text-sm text-white/80">{m.milestone}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risks & Tips */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {result.risks?.length > 0 && (
                <div className="glass rounded-2xl p-6">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2 text-sm">
                    <AlertCircle size={16} className="text-orange-400" /> Timeline Risks
                  </h3>
                  <ul className="space-y-2">
                    {result.risks.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-white/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0 mt-1.5" />{r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.tips?.length > 0 && (
                <div className="glass rounded-2xl p-6">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2 text-sm">
                    <CheckCircle size={16} className="text-green-400" /> Tips to Stay on Track
                  </h3>
                  <ul className="space-y-2">
                    {result.tips.map((t, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-white/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0 mt-1.5" />{t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="glass-strong rounded-2xl p-8 text-center">
              <h3 className="font-display font-semibold text-lg text-white mb-3">Ready to start your project?</h3>
              <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
                Get a detailed cost estimate alongside your timeline, then book a free consultation.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <button
                  onClick={() => navigate('/dashboard/cost-estimator')}
                  className="bg-white text-black font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors text-sm"
                >
                  Get Cost Estimate
                </button>
                <button
                  onClick={() => { navigate('/'); setTimeout(() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' }), 300) }}
                  className="glass text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors text-sm"
                >
                  Talk to Us
                </button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button onClick={() => { setResult(null); setForm({ projectType: '', featureCount: '', designComplexity: '', revisions: '', clientAvailability: '', hasDesign: '' }); setError('') }}
                className="text-white/60 hover:text-white transition-colors text-sm"
              >
                Calculate a Different Project
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
