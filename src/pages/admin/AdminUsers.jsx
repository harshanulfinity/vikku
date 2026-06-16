import { useEffect, useState } from 'react'
import { Search, RefreshCw, ChevronDown } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { getAdminUsers, adminChangePlan } from '../../lib/adminService'

const PLAN_STYLES = {
  free:  'bg-white/10 text-white/50',
  pro:   'bg-violet-500/20 text-violet-300',
  team:  'bg-blue-500/20 text-blue-300',
}

function timeAgo(dateStr) {
  if (!dateStr) return '—'
  const diff = Date.now() - new Date(dateStr).getTime()
  const d = Math.floor(diff / 86400000)
  if (d === 0) return 'Today'
  if (d === 1) return 'Yesterday'
  if (d < 30) return `${d}d ago`
  const m = Math.floor(d / 30)
  if (m < 12) return `${m}mo ago`
  return `${Math.floor(m / 12)}y ago`
}

function PlanDropdown({ userId, currentPlan, onChanged }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const change = async (plan) => {
    if (plan === currentPlan) { setOpen(false); return }
    setSaving(true)
    try {
      await adminChangePlan(userId, plan)
      onChanged(userId, plan)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
      setOpen(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={saving}
        className={`flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full ${PLAN_STYLES[currentPlan] || PLAN_STYLES.free}`}
      >
        {saving ? '…' : currentPlan}
        <ChevronDown size={9} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-20 glass rounded-xl p-1 w-24 shadow-xl">
          {['free', 'pro', 'team'].map(p => (
            <button
              key={p}
              onClick={() => change(p)}
              className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors ${
                p === currentPlan
                  ? 'text-white/30 cursor-default'
                  : 'text-white/80 hover:bg-white/[0.07] hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminUsers() {
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [search, setSearch]   = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const d = await getAdminUsers()
      setUsers(d.users || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handlePlanChanged = (userId, plan) => {
    setUsers(u => u.map(row => row.id === userId ? { ...row, plan } : row))
  }

  const filtered = users.filter(u =>
    !search || u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout title="Users">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search email…"
            className="w-full glass rounded-xl pl-8 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none"
          />
        </div>
        <span className="text-xs text-white/40">{filtered.length} users</span>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors ml-auto"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="glass rounded-xl p-4 mb-4 text-sm text-red-400 border border-red-500/20">{error}</div>
      )}

      {loading && !users.length ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_80px_56px_88px_88px_80px] gap-3 px-4 py-2.5 border-b border-white/[0.06] text-[10px] text-white/30 uppercase tracking-widest">
            <span>Email</span>
            <span>Plan</span>
            <span className="text-right">Projects</span>
            <span>Joined</span>
            <span>Last Active</span>
            <span className="text-right">Change</span>
          </div>

          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-white/30">No users found</div>
          ) : (
            filtered.map((u, i) => (
              <div
                key={u.id}
                className={`grid grid-cols-[1fr_80px_56px_88px_88px_80px] gap-3 px-4 py-3 items-center ${
                  i !== filtered.length - 1 ? 'border-b border-white/[0.04]' : ''
                } hover:bg-white/[0.02] transition-colors`}
              >
                <span className="text-xs text-white/80 truncate font-mono">{u.email}</span>
                <span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${PLAN_STYLES[u.plan] || PLAN_STYLES.free}`}>
                    {u.plan}
                  </span>
                </span>
                <span className="text-xs text-white/50 text-right">{u.projectCount}</span>
                <span className="text-xs text-white/40">{timeAgo(u.joinedAt)}</span>
                <span className="text-xs text-white/40">{timeAgo(u.lastSignIn)}</span>
                <div className="flex justify-end">
                  <PlanDropdown
                    userId={u.id}
                    currentPlan={u.plan}
                    onChanged={handlePlanChanged}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </AdminLayout>
  )
}
