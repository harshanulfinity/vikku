import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, Loader2, AlertTriangle, DollarSign, Calendar, Zap } from 'lucide-react'
import { calculateROI } from '../lib/openaiService'

const BUSINESS_TYPES = [
  'Restaurant / Cafe / Food Business',
  'Retail Shop / Store',
  'Service Business (Plumber, Electrician, Salon, etc.)',
  'Freelancer / Consultant',
  'Agency (Marketing, Design, etc.)',
  'Healthcare / Clinic / Doctor',
  'Education / Coaching / Training',
  'Real Estate / Property',
  'Manufacturing / Wholesale',
  'Startup / SaaS / Tech Business',
  'Other',
]

const LEAD_OPTIONS = [
  { label: '0 - No leads at all', value: '0 (none - entirely word of mouth or walk-ins)' },
  { label: '1–5 per month', value: '1–5 per month' },
  { label: '6–20 per month', value: '6–20 per month' },
  { label: '20+ per month', value: '20+ per month' },
]

const SOURCE_OPTIONS = [
  'WhatsApp / personal messages',
  'Word of mouth / referrals',
  'Walk-in customers',
  'Instagram / Facebook',
  'Cold calling / outreach',
  'Existing clients only',
]

export default function ROICalculator() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    businessType: '',
    monthlyLeads: '',
    avgDealValue: '',
    howTheyGetClients: [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const toggleSource = (src) => {
    setForm(f => ({
      ...f,
      howTheyGetClients: f.howTheyGetClients.includes(src)
        ? f.howTheyGetClients.filter(s => s !== src)
        : [...f.howTheyGetClients, src],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.businessType) return setError('Please select your business type')
    if (!form.monthlyLeads) return setError('Please select your current lead volume')
    if (!form.avgDealValue || isNaN(form.avgDealValue)) return setError('Please enter a valid average deal value')
    if (form.howTheyGetClients.length === 0) return setError('Please select at least one way you currently get clients')

    setLoading(true)
    try {
      const res = await calculateROI({
        businessType: form.businessType,
        monthlyLeads: form.monthlyLeads,
        avgDealValue: form.avgDealValue,
        howTheyGetClients: form.howTheyGetClients.join(', '),
      })
      setResult(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const sym = result?.currencySymbol || '₹'

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 glass border-b border-white/[0.05] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <h1 className="font-display font-bold text-lg text-white">ROI Calculator</h1>
          <div className="w-32" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {!result ? (
          <>
            <div className="mb-10">
              <h2 className="font-display font-extrabold text-3xl text-white mb-3">
                How Much Are You Losing Without a Website?
              </h2>
              <p className="text-white/60 text-sm max-w-xl">
                Answer 4 quick questions and we'll show you exactly how much revenue you're missing out on - and how fast a website pays for itself.
              </p>
            </div>

            <div className="glass rounded-2xl p-8">
              <form onSubmit={handleSubmit} className="space-y-8">

                {/* Business type */}
                <div>
                  <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">1. What type of business do you run?</label>
                  <select
                    value={form.businessType}
                    onChange={e => setForm(f => ({ ...f, businessType: e.target.value }))}
                    className="w-full glass rounded-xl px-4 py-3 text-sm text-white bg-transparent focus:outline-none cursor-pointer"
                  >
                    <option value="" className="bg-black">Select your business type...</option>
                    {BUSINESS_TYPES.map(t => <option key={t} value={t} className="bg-black">{t}</option>)}
                  </select>
                </div>

                {/* Monthly leads */}
                <div>
                  <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">2. How many leads / inquiries do you get per month right now?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {LEAD_OPTIONS.map(opt => (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, monthlyLeads: opt.value }))}
                        className={`glass rounded-xl px-4 py-3 text-sm text-left transition-all ${
                          form.monthlyLeads === opt.value ? 'border border-white/40 text-white' : 'text-white/60 hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Avg deal value */}
                <div>
                  <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">
                    3. What's your average deal / order value? (₹)
                  </label>
                  <input
                    type="number"
                    value={form.avgDealValue}
                    onChange={e => setForm(f => ({ ...f, avgDealValue: e.target.value }))}
                    placeholder="e.g. 15000"
                    className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none"
                  />
                  <p className="text-xs text-white/40 mt-1">For restaurants: avg monthly spend per customer. For services: avg project value.</p>
                </div>

                {/* How they get clients */}
                <div>
                  <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">4. How do you currently get clients? (select all that apply)</label>
                  <div className="flex flex-wrap gap-2">
                    {SOURCE_OPTIONS.map(src => (
                      <button
                        key={src}
                        type="button"
                        onClick={() => toggleSource(src)}
                        className={`text-xs px-3 py-2 rounded-lg glass transition-all ${
                          form.howTheyGetClients.includes(src) ? 'border border-white/40 text-white' : 'text-white/60 hover:text-white'
                        }`}
                      >
                        {src}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="glass rounded-lg p-4 flex items-start gap-3 border border-red-500/20">
                    <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? <><Loader2 size={18} className="animate-spin" /> Calculating your ROI...</> : 'Calculate My ROI'}
                </button>
              </form>
            </div>
          </>
        ) : (
          <>
            <div className="mb-10">
              <h2 className="font-display font-extrabold text-3xl text-white mb-3">Your ROI Report</h2>
            </div>

            {/* Revenue Lost Cards */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="glass-strong rounded-2xl p-6 border border-red-500/20">
                <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Lost Per Month</p>
                <p className="text-3xl font-bold text-red-400">{sym}{result.monthlyRevenueLost?.toLocaleString()}</p>
                <p className="text-xs text-white/40 mt-1">in missed revenue</p>
              </div>
              <div className="glass-strong rounded-2xl p-6 border border-red-500/10">
                <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Lost Per Year</p>
                <p className="text-3xl font-bold text-orange-400">{sym}{result.annualRevenueLost?.toLocaleString()}</p>
                <p className="text-xs text-white/40 mt-1">annual revenue gap</p>
              </div>
              <div className="glass-strong rounded-2xl p-6 border border-green-500/20">
                <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Annual ROI</p>
                <p className="text-3xl font-bold text-green-400">{result.roiPercent}%</p>
                <p className="text-xs text-white/40 mt-1">return on website investment</p>
              </div>
            </div>

            {/* Key numbers */}
            <div className="glass rounded-2xl p-8 mb-6">
              <h3 className="font-display font-semibold text-lg text-white mb-6 flex items-center gap-2">
                <TrendingUp size={20} className="text-green-400" /> With a Website
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-white/60 mb-1">Projected Monthly Leads</p>
                  <p className="text-2xl font-bold text-white">{result.projectedMonthlyLeads}+</p>
                </div>
                <div>
                  <p className="text-xs text-white/60 mb-1">Projected Monthly Revenue</p>
                  <p className="text-2xl font-bold text-white">{sym}{result.projectedMonthlyRevenue?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-white/60 mb-1">Payback Period</p>
                  <p className="text-2xl font-bold text-white">{result.paybackPeriodMonths} months</p>
                </div>
              </div>
            </div>

            {/* Website cost estimate */}
            <div className="glass rounded-2xl p-8 mb-6">
              <h3 className="font-display font-semibold text-lg text-white mb-4 flex items-center gap-2">
                <DollarSign size={20} /> Website Investment
              </h3>
              <p className="text-white/60 text-sm mb-4">What a professional website would cost to build:</p>
              <p className="text-3xl font-bold text-white">
                {sym}{result.websiteCostEstimate?.min?.toLocaleString()} – {sym}{result.websiteCostEstimate?.max?.toLocaleString()}
              </p>
              <p className="text-xs text-white/40 mt-2">One-time investment. Pays back in {result.paybackPeriodMonths} months.</p>
            </div>

            {/* What a website does for you */}
            {result.whatAWebsiteDoes?.length > 0 && (
              <div className="glass rounded-2xl p-8 mb-6">
                <h3 className="font-display font-semibold text-lg text-white mb-6 flex items-center gap-2">
                  <Zap size={20} className="text-yellow-400" /> What a Website Does for Your Business
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {result.whatAWebsiteDoes.map((item, i) => (
                    <div key={i} className="glass rounded-xl p-4">
                      <p className="text-sm font-semibold text-white mb-1">{item.benefit}</p>
                      <p className="text-xs text-white/60">{item.impact}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key insights */}
            {result.keyInsights?.length > 0 && (
              <div className="glass rounded-2xl p-8 mb-6">
                <h3 className="font-display font-semibold text-lg text-white mb-4 flex items-center gap-2">
                  <Calendar size={20} className="text-blue-400" /> Key Insights for Your Business
                </h3>
                <ul className="space-y-3">
                  {result.keyInsights.map((insight, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-white/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0 mt-2" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CTA */}
            <div className="glass-strong rounded-2xl p-8 text-center">
              <h3 className="font-display font-semibold text-xl text-white mb-3">
                Ready to stop losing {sym}{result.monthlyRevenueLost?.toLocaleString()} every month?
              </h3>
              <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
                Let's build your website and start capturing those leads. Free consultation, no commitment.
              </p>
              <button
                onClick={() => { navigate('/'); setTimeout(() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' }), 300) }}
                className="bg-white text-black font-semibold px-8 py-3 rounded-xl hover:bg-white/90 transition-colors"
              >
                Get a Free Consultation
              </button>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => { setResult(null); setForm({ businessType: '', monthlyLeads: '', avgDealValue: '', howTheyGetClients: [] }); setError('') }}
                className="text-white/60 hover:text-white transition-colors text-sm"
              >
                Calculate for a Different Business
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
