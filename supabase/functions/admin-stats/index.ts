import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ADMIN_EMAILS = (Deno.env.get('ADMIN_EMAILS') || 'sanikommuharshavardhanreddy6@gmail.com')
  .split(',').map(e => e.trim()).filter(Boolean)

function corsHeaders(req: Request) {
  const origin = req.headers.get('origin') ?? ''
  return {
    'Access-Control-Allow-Origin': origin === 'https://vikku.in' ? origin : '',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Vary': 'Origin',
  }
}

const json = (req: Request, data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } })

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey    = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const authHeader = req.headers.get('Authorization') || ''

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user } } = await userClient.auth.getUser()
    if (!user || !ADMIN_EMAILS.includes(user.email!)) {
      return json(req, { error: 'Unauthorized' }, 403)
    }

    const admin = createClient(supabaseUrl, serviceKey)
    const url   = new URL(req.url)
    const type  = url.searchParams.get('type') || 'overview'

    // ── POST ──────────────────────────────────────────────────────────
    if (req.method === 'POST') {
      const body = await req.json()

      if (body.action === 'change_plan') {
        const periodEnd = new Date()
        periodEnd.setMonth(periodEnd.getMonth() + 1)
        const { error } = await admin.from('user_subscriptions').upsert({
          user_id: body.userId,
          plan: body.plan,
          status: body.plan === 'free' ? 'cancelled' : 'active',
          current_period_end: body.plan === 'free' ? null : periodEnd.toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
        if (error) throw error
        return json(req, { ok: true })
      }

      if (body.action === 'create_announcement') {
        const { error } = await admin.from('admin_announcements').insert({
          title: body.title,
          body: body.body,
          target: body.target || 'all',
          expires_at: body.expires_at || null,
        })
        if (error) throw error
        return json(req, { ok: true })
      }

      if (body.action === 'toggle_announcement') {
        const { error } = await admin.from('admin_announcements').update({ active: body.active }).eq('id', body.id)
        if (error) throw error
        return json(req, { ok: true })
      }

      if (body.action === 'delete_announcement') {
        const { error } = await admin.from('admin_announcements').delete().eq('id', body.id)
        if (error) throw error
        return json(req, { ok: true })
      }

      if (body.action === 'delete_user') {
        const { error } = await admin.auth.admin.deleteUser(body.userId)
        if (error) throw error
        return json(req, { ok: true })
      }

      return json(req, { error: 'Unknown action' }, 400)
    }

    // ── GET: overview ─────────────────────────────────────────────────
    if (type === 'overview') {
      const [usersRes, subsRes, projectsRes, subscribersRes] = await Promise.all([
        admin.auth.admin.listUsers({ perPage: 1000 }),
        admin.from('user_subscriptions').select('plan, status, created_at'),
        admin.from('pm_projects').select('status, created_at'),
        admin.from('subscribers').select('source, created_at', { count: 'exact', head: false }),
      ])

      const users       = usersRes.data?.users || []
      const subs        = subsRes.data || []
      const projects    = projectsRes.data || []
      const subscribers = subscribersRes.data || []

      const subscribersBySource: Record<string, number> = {}
      subscribers.forEach((s: { source?: string }) => {
        const src = s.source || 'other'
        subscribersBySource[src] = (subscribersBySource[src] || 0) + 1
      })

      const proSubs  = subs.filter(s => s.plan === 'pro'  && s.status === 'active')
      const teamSubs = subs.filter(s => s.plan === 'team' && s.status === 'active')
      const mrr      = proSubs.length * 499 + teamSubs.length * 2499

      const now = Date.now()
      const sevenDaysAgo = new Date(now - 7 * 86400000).toISOString()
      const activeUsers = users.filter(u => u.last_sign_in_at && u.last_sign_in_at >= sevenDaysAgo).length

      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
      const churnedThisMonth = subs.filter(s => s.status === 'cancelled' && s.created_at >= monthStart).length

      const signupsByDay: Record<string, number> = {}
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now - i * 86400000).toISOString().split('T')[0]
        signupsByDay[d] = 0
      }
      users.forEach(u => {
        const d = u.created_at?.split('T')[0]
        if (d && signupsByDay[d] !== undefined) signupsByDay[d]++
      })

      const projectStatus: Record<string, number> = { active: 0, completed: 0, 'on-hold': 0, archived: 0 }
      projects.forEach(p => { if (p.status in projectStatus) projectStatus[p.status]++ })

      return json(req, {
        totalUsers: users.length,
        proUsers: proSubs.length,
        teamUsers: teamSubs.length,
        freeUsers: users.length - proSubs.length - teamSubs.length,
        mrr,
        activeUsers,
        churnedThisMonth,
        totalProjects: projects.length,
        signupsByDay: Object.entries(signupsByDay).map(([date, count]) => ({ date, count })),
        projectStatus,
        totalSubscribers: subscribers.length,
        subscribersBySource,
      })
    }

    // ── GET: users ────────────────────────────────────────────────────
    if (type === 'users') {
      const [usersRes, subsRes, projectsRes] = await Promise.all([
        admin.auth.admin.listUsers({ perPage: 1000 }),
        admin.from('user_subscriptions').select('*'),
        admin.from('pm_projects').select('user_id'),
      ])
      const users    = usersRes.data?.users || []
      const subs     = subsRes.data || []
      const projects = projectsRes.data || []

      const subMap: Record<string, typeof subs[0]> = {}
      subs.forEach(s => { subMap[s.user_id] = s })

      const projectCounts: Record<string, number> = {}
      projects.forEach(p => { projectCounts[p.user_id] = (projectCounts[p.user_id] || 0) + 1 })

      const result = users
        .map(u => ({
          id:           u.id,
          email:        u.email,
          joinedAt:     u.created_at,
          lastSignIn:   u.last_sign_in_at,
          projectCount: projectCounts[u.id] || 0,
          plan:         subMap[u.id]?.plan   || 'free',
          planStatus:   subMap[u.id]?.status || null,
          periodEnd:    subMap[u.id]?.current_period_end || null,
          paymentId:    subMap[u.id]?.razorpay_payment_id || null,
        }))
        .sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime())

      return json(req, { users: result })
    }

    // ── GET: billing ──────────────────────────────────────────────────
    if (type === 'billing') {
      const [usersRes, subsRes] = await Promise.all([
        admin.auth.admin.listUsers({ perPage: 1000 }),
        admin.from('user_subscriptions').select('*').order('updated_at', { ascending: false }),
      ])
      const users = usersRes.data?.users || []
      const subs  = subsRes.data || []

      const emailMap: Record<string, string> = {}
      users.forEach(u => { if (u.email) emailMap[u.id] = u.email })

      const result = subs.map(s => ({ ...s, email: emailMap[s.user_id] || 'Unknown' }))
      return json(req, { subscriptions: result })
    }

    // ── GET: analytics ────────────────────────────────────────────────
    if (type === 'analytics') {
      const [usersRes, subsRes, projectsRes] = await Promise.all([
        admin.auth.admin.listUsers({ perPage: 1000 }),
        admin.from('user_subscriptions').select('plan, status, created_at, user_id'),
        admin.from('pm_projects').select('user_id, created_at'),
      ])
      const users    = usersRes.data?.users || []
      const subs     = subsRes.data || []
      const projects = projectsRes.data || []

      const now          = Date.now()
      const sevenDaysAgo = new Date(now - 7 * 86400000).toISOString()
      const monthStart   = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

      const proSubs  = subs.filter(s => s.plan === 'pro'  && s.status === 'active')
      const teamSubs = subs.filter(s => s.plan === 'team' && s.status === 'active')
      const mrr      = proSubs.length * 499 + teamSubs.length * 2499
      const arr      = mrr * 12

      const activeUsers      = users.filter(u => u.last_sign_in_at && u.last_sign_in_at >= sevenDaysAgo).length
      const paidUsers        = proSubs.length + teamSubs.length
      const freeUsers        = users.length - paidUsers
      const churnedThisMonth = subs.filter(s => s.status === 'cancelled' && s.created_at >= monthStart).length
      const conversionPct    = users.length > 0 ? Math.round((paidUsers / users.length) * 100) : 0

      const signupsByDay: Record<string, number> = {}
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now - i * 86400000).toISOString().split('T')[0]
        signupsByDay[d] = 0
      }
      users.forEach(u => {
        const d = u.created_at?.split('T')[0]
        if (d && signupsByDay[d] !== undefined) signupsByDay[d]++
      })

      const projectCounts: Record<string, number> = {}
      projects.forEach(p => { projectCounts[p.user_id] = (projectCounts[p.user_id] || 0) + 1 })

      const emailMap: Record<string, string> = {}
      users.forEach(u => { if (u.email) emailMap[u.id] = u.email })

      const topUsers = Object.entries(projectCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([userId, count]) => ({ email: emailMap[userId] || userId, projectCount: count }))

      return json(req, {
        arr, mrr, activeUsers, paidUsers, freeUsers,
        totalUsers: users.length,
        churnedThisMonth, conversionPct,
        signupsByDay: Object.entries(signupsByDay).map(([date, count]) => ({ date, count })),
        topUsers,
      })
    }

    // ── GET: announcements ────────────────────────────────────────────
    if (type === 'announcements') {
      const { data, error } = await admin.from('admin_announcements')
        .select('*').order('created_at', { ascending: false })
      if (error) throw error
      return json(req, { announcements: data || [] })
    }

    // ── GET: user_detail ──────────────────────────────────────────────
    if (type === 'user_detail') {
      const userId = url.searchParams.get('userId')
      if (!userId) return json(req, { error: 'userId required' }, 400)

      const [userRes, subRes, projectsRes] = await Promise.all([
        admin.auth.admin.getUserById(userId),
        admin.from('user_subscriptions').select('*').eq('user_id', userId).maybeSingle(),
        admin.from('pm_projects').select('id, name, status, created_at').eq('user_id', userId),
      ])

      return json(req, {
        user:         userRes.data?.user,
        subscription: subRes.data,
        projects:     projectsRes.data || [],
      })
    }

    return json(req, { error: 'Unknown type' }, 400)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal error'
    return json(req, { error: msg }, 500)
  }
})
