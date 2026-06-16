import { useEffect, useState } from 'react'
import { Activity, Plus, ArrowRight, CheckCircle, Flag, Loader2 } from 'lucide-react'
import { getProjectActivity } from '../../lib/pmService'

const ACTION_ICON = {
  task_created: Plus,
  task_updated: ArrowRight,
  task_done: CheckCircle,
  milestone_done: Flag,
}

const ACTION_COLOR = {
  task_created: 'text-blue-400',
  task_updated: 'text-white/40',
  task_done: 'text-green-400',
  milestone_done: 'text-yellow-400',
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function ActivityFeed({ projectId }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!projectId) return
    getProjectActivity(projectId).then((data) => {
      setItems(data)
      setLoading(false)
    })
  }, [projectId])

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Activity size={13} className="text-white/30" />
        <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Activity</h3>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 size={14} className="animate-spin text-white/20" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-[11px] text-white/20 text-center py-4">No activity yet</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const Icon = ACTION_ICON[item.action] || ArrowRight
            const color = ACTION_COLOR[item.action] || 'text-white/40'
            return (
              <div key={item.id} className="flex gap-2.5">
                <div className={`w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5 ${color}`}>
                  <Icon size={11} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-white/60 leading-snug">
                    <span className="text-white/40">{item.user_email?.split('@')[0] || 'Someone'}</span>
                    {' '}
                    {item.action === 'task_created' && 'created'}
                    {item.action === 'task_updated' && 'updated'}
                    {item.action === 'task_done' && 'completed'}
                    {item.action === 'milestone_done' && 'reached milestone'}
                    {' '}
                    <span className="text-white/80">{item.entity_title}</span>
                  </p>
                  <p className="text-[10px] text-white/20 mt-0.5">{timeAgo(item.created_at)}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
