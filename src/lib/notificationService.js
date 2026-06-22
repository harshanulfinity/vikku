import { supabase } from './supabaseClient'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

async function callEdge(type, body, useAuth = true) {
  try {
    const headers = { 'Content-Type': 'application/json' }
    if (useAuth) {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`
    }
    await fetch(`${SUPABASE_URL}/functions/v1/send-notification`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ type, ...body }),
    })
  } catch {
    // Notifications are best-effort - never block the UI
  }
}

export function notifyTaskAssigned({ taskTitle, projectName, assigneeEmail, dueDate }) {
  if (!assigneeEmail) return
  callEdge('task_assigned', { taskTitle, projectName, assigneeEmail, dueDate })
}

export function notifyClientComment({ shareToken, authorName, comment }) {
  callEdge('client_comment', { shareToken, authorName, comment }, false)
}

export function notifyClientApproval({ shareToken, taskTitle, status, note }) {
  callEdge('client_approval', { shareToken, taskTitle, status, note }, false)
}

export function notifyMilestoneApproval({ shareToken, milestoneTitle, status, note }) {
  callEdge('milestone_approval', { shareToken, milestoneTitle, status, note }, false)
}
