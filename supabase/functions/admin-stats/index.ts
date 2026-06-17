import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ADMIN_EMAILS = ['sanikommuharshavardhanreddy6@gmail.com']

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey    = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const authHeader = req.headers.get('Authorization') || ''

    // Verify caller is admin
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user } } = await userClient.auth.getUser()
    if (!user || !ADMIN_EMAILS.includes(user.email!)) {
      return json({ error: 'Unauthorized' }, 403)
    }

    const admin = createClient(supabaseUrl, serviceKey)
    const url   = new URL(req.url)
    const type  = url.searchParams.get('type') || 'overview'

    // ── POST: change plan ─────────────────────────────────────────
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
        return json({ ok: true })
      }
      return json({ error: 'Unknown action' }, 400)
    }

    // ── GET: overview ─────────────────────────────────────────────
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

      // Signups last 30 days
      const now = Date.now()
      const signupsByDay: Record<string, number> = {}
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now - i * 86400000).toISOString().split('T')[0]
        signupsByDay[d] = 0
      }
      users.forEach(u => {
        const d = u.created_at?.split('T')[0]
        if (d && signupsByDay[d] !== undefined) signupsByDay[d]++
      })

      // Project status breakdown
      const projectStatus: Record<string, number> = { active: 0, completed: 0, 'on-hold': 0, archived: 0 }
      projects.forEach(p => { if (p.status in projectStatus) projectStatus[p.status]++ })

      return json({
        totalUsers: users.length,
        proUsers: proSubs.length,
        teamUsers: teamSubs.length,
        freeUsers: users.length - proSubs.length - teamSubs.length,
        mrr,
        totalProjects: projects.length,
        signupsByDay: Object.entries(signupsByDay).map(([date, count]) => ({ date, count })),
        projectStatus,
        totalSubscribers: subscribers.length,
        subscribersBySource,
      })
    }

    // ── GET: users ────────────────────────────────────────────────
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

      return json({ users: result })
    }

    // ── GET: billing ──────────────────────────────────────────────
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
      return json({ subscriptions: result })
    }

    return json({ error: 'Unknown type' }, 400)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal error'
    return json({ error: msg }, 500)
  }
})
