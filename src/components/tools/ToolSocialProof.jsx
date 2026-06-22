import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { getToolResultCount, TOOL_LABELS } from '../../lib/toolResultsService'

// Shows a live "N generated" trust line. Only renders once the real count is
// meaningful (>= MIN) so we never display a weak number.
const MIN = 25

export default function ToolSocialProof({ tool }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let alive = true
    getToolResultCount(tool).then((n) => { if (alive) setCount(n) })
    return () => { alive = false }
  }, [tool])

  if (count < MIN) return null

  const noun = (TOOL_LABELS[tool] || 'result').toLowerCase() + 's'
  return (
    <div className="inline-flex items-center gap-2 text-xs text-white/50 mb-6">
      <Sparkles size={12} className="text-violet-400" />
      <span><span className="text-white/80 font-semibold">{count.toLocaleString('en-IN')}+</span> {noun} generated with this tool</span>
    </div>
  )
}
