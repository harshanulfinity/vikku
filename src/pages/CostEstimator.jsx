import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, AlertTriangle, Lightbulb, Loader2, MapPin, ChevronDown } from 'lucide-react'
import { estimateProjectCost } from '../lib/openaiService'

const REGIONS = [
  { label: 'India', country: 'India' },
  { label: 'United States', country: 'United States' },
  { label: 'United Kingdom', country: 'United Kingdom' },
  { label: 'Canada', country: 'Canada' },
  { label: 'Australia', country: 'Australia' },
  { label: 'Singapore', country: 'Singapore' },
  { label: 'UAE', country: 'United Arab Emirates' },
  { label: 'Germany', country: 'Germany' },
  { label: 'Philippines', country: 'Philippines' },
  { label: 'Pakistan', country: 'Pakistan' },
]

function formatCurrency(amount, country, symbol) {
  const locale = country === 'India' ? 'en-IN' : 'en-US'
  return (symbol || '$') + new Intl.NumberFormat(locale).format(amount)
}

export default function CostEstimator() {
  const navigate = useNavigate()
  const [requirements, setRequirements] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [location, setLocation] = useState(null)
  const [locationStatus, setLocationStatus] = useState('detecting') // 'detecting' | 'detected' | 'denied'
  const [showRegionPicker, setShowRegionPicker] = useState(false)

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('denied')
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'User-Agent': 'vikku-agency-cost-estimator' } }
          )
          const data = await res.json()
          const country = data.address?.country || ''
          const city = data.address?.city || data.address?.town || data.address?.state || ''
          setLocation({ city, country })
          setLocationStatus('detected')
        } catch {
          setLocationStatus('denied')
        }
      },
      () => setLocationStatus('denied'),
      { timeout: 8000 }
    )
  }, [])

  const handleRegionSelect = (region) => {
    setLocation({ city: '', country: region.country })
    setLocationStatus('detected')
    setShowRegionPicker(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)

    if (requirements.length < 50) {
      setError('Please provide more detailed requirements (at least 50 characters)')
      return
    }

    setLoading(true)

    try {
      const estimate = await estimateProjectCost(requirements, location)
      setResult(estimate)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

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
          <h1 className="font-display font-bold text-lg text-white">AI Cost Estimator</h1>
          <div className="w-20" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {!result ? (
          <>
            <div className="mb-10">
              <h2 className="font-display font-extrabold text-3xl text-white mb-3">Estimate Your Project Cost</h2>
              <p className="text-white/60 text-sm max-w-xl">
                Describe your project requirements and get an AI-powered cost estimate with detailed breakdown.
              </p>
            </div>

            <div className="glass rounded-2xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Location pill */}
                <div className="relative">
                  <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">
                    Your Region
                  </label>
                  {locationStatus === 'detecting' && (
                    <div className="flex items-center gap-2 text-sm text-white/50">
                      <Loader2 size={14} className="animate-spin" />
                      Detecting your location...
                    </div>
                  )}
                  {(locationStatus === 'detected' || locationStatus === 'denied') && (
                    <div className="flex items-center gap-3 flex-wrap">
                      {locationStatus === 'detected' && location && (
                        <div className="flex items-center gap-1.5 glass rounded-lg px-3 py-1.5 text-sm text-green-400">
                          <MapPin size={13} />
                          {location.city ? `${location.city}, ` : ''}{location.country}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowRegionPicker(v => !v)}
                        className="flex items-center gap-1.5 glass rounded-lg px-3 py-1.5 text-sm text-white/60 hover:text-white transition-colors"
                      >
                        {locationStatus === 'denied' ? (
                          <><MapPin size={13} /> Select your region</>
                        ) : (
                          <>Change <ChevronDown size={13} /></>
                        )}
                      </button>
                    </div>
                  )}
                  {showRegionPicker && (
                    <div className="absolute top-full mt-1 left-0 z-20 glass rounded-xl p-2 flex flex-wrap gap-1.5 w-full max-w-sm shadow-xl">
                      {REGIONS.map((r) => (
                        <button
                          key={r.country}
                          type="button"
                          onClick={() => handleRegionSelect(r)}
                          className="text-xs px-3 py-1.5 rounded-lg glass hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  )}
                  {locationStatus === 'detected' && location && (
                    <p className="text-xs text-white/40 mt-1.5">
                      Estimates will reflect market rates for {location.country}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">
                    Project Requirements
                  </label>
                  <textarea
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    className="w-full glass rounded-xl px-4 py-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors min-h-[200px] resize-none"
                    placeholder="Describe your project in detail. Include:
• What type of application (web app, mobile app, e-commerce, etc.)
• Key features and functionality
• User authentication requirements
• Payment processing needs
• Third-party integrations
• Design complexity
• Any specific technical requirements"
                    required
                  />
                  <p className="text-xs text-white/40 mt-2">
                    {requirements.length} / 50 characters minimum
                  </p>
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
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Analyzing...
                    </>
                  ) : (
                    'Generate Estimate'
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <>
            <div className="mb-10">
              <h2 className="font-display font-extrabold text-3xl text-white mb-3">Cost Estimate</h2>
              <p className="text-white/60 text-sm max-w-xl">
                Based on your requirements, here's a detailed cost breakdown for your project.
              </p>
            </div>

            {/* Total Cost Card */}
            <div className="glass-strong rounded-2xl p-8 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-xs text-white/60 uppercase tracking-wider">Estimated Cost</p>
                    <p className="text-3xl font-bold text-white">
                      {formatCurrency(result.totalCostMin, location?.country, result.currencySymbol)} – {formatCurrency(result.totalCostMax, location?.country, result.currencySymbol)}
                    </p>
                    {result.currency && result.currency !== 'USD' && (
                      <p className="text-xs text-white/40 mt-1">{result.currency}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/60 uppercase tracking-wider">Timeline</p>
                  <p className="text-lg font-semibold text-white flex items-center gap-2">
                    <Clock size={18} /> {result.timeline}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/60">Complexity:</span>
                  <span className={`text-xs font-semibold ${
                    result.complexity === 'Low' ? 'text-green-400' :
                    result.complexity === 'Medium' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {result.complexity}
                  </span>
                </div>
                {location && (
                  <div className="flex items-center gap-1.5 text-xs text-white/50">
                    <MapPin size={11} />
                    Rates for: {location.city ? `${location.city}, ` : ''}{location.country}
                  </div>
                )}
              </div>
            </div>

            {/* Breakdown */}
            <div className="glass rounded-2xl p-8 mb-6">
              <h3 className="font-display font-semibold text-lg text-white mb-6">Cost Breakdown</h3>
              <div className="space-y-4">
                {result.breakdown.map((item, index) => (
                  <div key={index} className="glass rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white text-sm">{item.category}</h4>
                      <p className="text-sm text-white font-medium">
                        {formatCurrency(item.costMin, location?.country, result.currencySymbol)} – {formatCurrency(item.costMax, location?.country, result.currencySymbol)}
                      </p>
                    </div>
                    <p className="text-xs text-white/60">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="glass rounded-2xl p-8 mb-6">
              <h3 className="font-display font-semibold text-lg text-white mb-4 flex items-center gap-2">
                <Lightbulb size={20} className="text-yellow-400" /> Recommendations
              </h3>
              <ul className="space-y-3">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-white/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0 mt-2" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            {/* Risks */}
            <div className="glass rounded-2xl p-8 mb-6">
              <h3 className="font-display font-semibold text-lg text-white mb-4 flex items-center gap-2">
                <AlertTriangle size={20} className="text-orange-400" /> Potential Risks
              </h3>
              <ul className="space-y-3">
                {result.risks.map((risk, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-white/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0 mt-2" />
                    {risk}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="glass-strong rounded-2xl p-8 text-center">
              <h3 className="font-display font-semibold text-lg text-white mb-3">
                Need a detailed quote?
              </h3>
              <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
                Get a comprehensive project proposal with detailed scope, timeline, and deliverables.
              </p>
              <button
                onClick={() => navigate('/contact')}
                className="bg-white text-black font-semibold px-8 py-3 rounded-xl hover:bg-white/90 transition-colors"
              >
                Request Detailed Quote
              </button>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setResult(null)
                  setRequirements('')
                  setError('')
                }}
                className="text-white/60 hover:text-white transition-colors text-sm"
              >
                Estimate Another Project
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
