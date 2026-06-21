import { useEffect, useState } from 'react'
import { RefreshCw, TrendingUp, Users, IndianRupee, BarChart2 } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { getAdminAnalytics } from '../../lib/adminService'

function StatCard({ icon: Icon, label, value, sub, color = 'text-white' }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-white/40 uppercase tracking-widest">{label}</span>
        <Icon size={14} className="text-white/20" />
      </div>
      <p className={`font-display font-bold text-2xl ${color}`}>{value}</p>
      {sub && <p className="text-[11px] text-white/40 mt-1">{sub}</p>}
    </div>
  )
}

export default function AdminAnalytics() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try { setData(await getAdminAnalytics()) }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const maxSignup = data ? Math.max(...data.signupsByDay.map(d => d.count), 1) : 1

  return (
    <AdminLayout title="Analytics">
      <div className="flex items-center justify-between mb-5">
        <p className="text-xs text-white/40">Aggregated from live data</p>
        <button onClick={load} disabled={loading} className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && <div className="glass rounded-xl p-4 mb-5 text-sm text-red-400 border border-red-500/20">{error}</div>}

      {loading && !data ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        </div>
      ) : data ? (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <StatCard icon={IndianRupee} label="ARR" value={`₹${(data.arr / 100000).toFixed(1)}L`} sub={`MRR ₹${data.mrr.toLocaleString('en-IN')}`} color="text-green-400" />
            <StatCard icon={Users} label="Active 7d" value={data.activeUsers} sub={`of ${data.totalUsers} total`} color="text-cyan-400" />
            <StatCard icon={TrendingUp} label="Conversion" value={`${data.conversionPct}%`} sub={`${data.paidUsers} paid`} color="text-violet-400" />
            <StatCard icon={BarChart2} label="Churn MTD" value={data.churnedThisMonth} sub="cancelled this month" color="text-red-400" />
          </div>

          {/* Conversion funnel */}
          <div className="glass rounded-2xl p-5 mb-4">
            <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Conversion Funnel</p>
            <div className="space-y-3">
              {[
                { label: 'Total Users', count: data.totalUsers, pct: 100, color: 'bg-white/20' },
                { label: 'Free Users',  count: data.freeUsers,  pct: data.totalUsers > 0 ? Math.round(data.freeUsers / data.totalUsers * 100) : 0, color: 'bg-white/30' },
                { label: 'Paid Users',  count: data.paidUsers,  pct: data.conversionPct, color: 'bg-violet-500' },
              ].map(({ label, count, pct, color }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/60">{label}</span>
                    <span className="text-xs text-white/40">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Signup trend */}
          <div className="glass rounded-2xl p-5 mb-4">
            <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Signups — Last 30 Days</p>
            <div className="flex items-end gap-0.5 h-24">
              {data.signupsByDay.map(({ date, count }) => (
                <div key={date} className="relative flex-1 group">
                  <div
                    className="w-full bg-violet-500/50 hover:bg-violet-500/80 rounded-t-sm transition-colors"
                    style={{ height: `${Math.max((count / maxSignup) * 96, count > 0 ? 6 : 2)}px` }}
                  />
                  {count > 0 && (
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {date.slice(5)}: {count}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-1 text-[9px] text-white/25">
              <span>{data.signupsByDay[0]?.date?.slice(5)}</span>
              <span>{data.signupsByDay[data.signupsByDay.length - 1]?.date?.slice(5)}</span>
            </div>
          </div>

          {/* Top users by projects */}
          {data.topUsers?.length > 0 && (
            <div className="glass rounded-2xl p-5">
              <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Top Users by Projects</p>
              <div className="space-y-2">
                {data.topUsers.map((u, i) => (
                  <div key={u.email} className="flex items-center gap-3">
                    <span className="text-[10px] text-white/30 w-4">{i + 1}</span>
                    <span className="text-xs text-white/70 font-mono flex-1 truncate">{u.email}</span>
                    <span className="text-xs text-white/50">{u.projectCount} projects</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}
    </AdminLayout>
  )
}
