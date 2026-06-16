import { supabase } from './supabaseClient'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

async function getToken() {
  const { data } = await supabase.auth.getSession()
  return data?.session?.access_token || ''
}

async function adminFetch(type) {
  const token = await getToken()
  const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-stats?type=${type}`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `admin-stats failed (${res.status})`)
  }
  return res.json()
}

export const getAdminOverview = () => adminFetch('overview')
export const getAdminUsers    = () => adminFetch('users')
export const getAdminBilling  = () => adminFetch('billing')

export async function adminChangePlan(userId, plan) {
  const token = await getToken()
  const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-stats`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'change_plan', userId, plan }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Change plan failed')
  }
  return res.json()
}
