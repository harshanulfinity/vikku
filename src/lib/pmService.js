import { supabase } from './supabaseClient'

// ── Projects ──────────────────────────────────────────────

export async function getProjects(userId) {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('pm_projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) {
      console.error('Error fetching projects:', error)
      return []
    }
    return data || []
  } catch (err) {
    console.error('Failed to fetch projects:', err)
    return []
  }
}

export async function getProject(id) {
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from('pm_projects')
      .select('*')
      .eq('id', id)
      .single()
    if (error) {
      console.error('Error fetching project:', error)
      return null
    }
    return data
  } catch (err) {
    console.error('Failed to fetch project:', err)
    return null
  }
}

export async function getProjectByToken(token) {
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from('pm_projects')
      .select('*')
      .eq('share_token', token)
      .single()
    if (error) {
      console.error('Error fetching project by token:', error)
      return null
    }
    return data
  } catch (err) {
    console.error('Failed to fetch project by token:', err)
    return null
  }
}

export async function createProject(fields) {
  if (!supabase) throw new Error('Database not configured')
  const { data, error } = await supabase
    .from('pm_projects')
    .insert(fields)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateProject(id, fields) {
  if (!supabase) throw new Error('Database not configured')
  const { data, error } = await supabase
    .from('pm_projects')
    .update(fields)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteProject(id) {
  if (!supabase) throw new Error('Database not configured')
  const { error } = await supabase.from('pm_projects').delete().eq('id', id)
  if (error) throw error
}

// ── Tasks ──────────────────────────────────────────────────

export async function getTasks(projectId) {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('pm_tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })
    if (error) {
      console.error('Error fetching tasks:', error)
      return []
    }
    return data || []
  } catch (err) {
    console.error('Failed to fetch tasks:', err)
    return []
  }
}

export async function createTask(fields) {
  if (!supabase) throw new Error('Database not configured')
  const { data, error } = await supabase
    .from('pm_tasks')
    .insert(fields)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateTask(id, fields) {
  if (!supabase) throw new Error('Database not configured')
  const { data, error } = await supabase
    .from('pm_tasks')
    .update(fields)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTask(id) {
  if (!supabase) throw new Error('Database not configured')
  const { error } = await supabase.from('pm_tasks').delete().eq('id', id)
  if (error) throw error
}

export async function bulkCreateTasks(tasks) {
  if (!supabase) throw new Error('Database not configured')
  const { data, error } = await supabase.from('pm_tasks').insert(tasks).select()
  if (error) throw error
  return data
}

// ── Milestones ─────────────────────────────────────────────

export async function getMilestones(projectId) {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('pm_milestones')
      .select('*')
      .eq('project_id', projectId)
      .order('due_date', { ascending: true })
    if (error) {
      console.error('Error fetching milestones:', error)
      return []
    }
    return data || []
  } catch (err) {
    console.error('Failed to fetch milestones:', err)
    return []
  }
}

export async function createMilestone(fields) {
  if (!supabase) throw new Error('Database not configured')
  const { data, error } = await supabase
    .from('pm_milestones')
    .insert(fields)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateMilestone(id, fields) {
  if (!supabase) throw new Error('Database not configured')
  const { data, error } = await supabase
    .from('pm_milestones')
    .update(fields)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteMilestone(id) {
  if (!supabase) throw new Error('Database not configured')
  const { error } = await supabase.from('pm_milestones').delete().eq('id', id)
  if (error) throw error
}

export async function bulkCreateMilestones(milestones) {
  if (!supabase) throw new Error('Database not configured')
  const { data, error } = await supabase.from('pm_milestones').insert(milestones).select()
  if (error) throw error
  return data
}

// ── Project Members ────────────────────────────────────────

export async function getProjectMembers(projectId) {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('pm_project_members')
      .select('*')
      .eq('project_id', projectId)
      .order('joined_at', { ascending: true })
    if (error) {
      console.error('Error fetching members:', error)
      return []
    }
    return data || []
  } catch (err) {
    console.error('Failed to fetch members:', err)
    return []
  }
}

export async function joinProject(projectId, userId, email, role = 'member') {
  if (!supabase) throw new Error('Database not configured')
  const { data, error } = await supabase
    .from('pm_project_members')
    .insert({ project_id: projectId, user_id: userId, email, role })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function removeProjectMember(memberId) {
  if (!supabase) throw new Error('Database not configured')
  const { error } = await supabase.from('pm_project_members').delete().eq('id', memberId)
  if (error) throw error
}

export async function getSharedProjects(userId) {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('pm_project_members')
      .select('project_id, pm_projects(*)')
      .eq('user_id', userId)
    if (error) {
      console.error('Error fetching shared projects:', error)
      return []
    }
    return data.map((row) => row.pm_projects).filter(Boolean)
  } catch (err) {
    console.error('Failed to fetch shared projects:', err)
    return []
  }
}

// ── Task Comments ──────────────────────────────────────────

export async function getTaskComments(taskId) {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('pm_task_comments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true })
    if (error) { console.error('Error fetching comments:', error); return [] }
    return data || []
  } catch (err) { return [] }
}

export async function createTaskComment(fields) {
  if (!supabase) throw new Error('Database not configured')
  const { data, error } = await supabase
    .from('pm_task_comments')
    .insert(fields)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTaskComment(id) {
  if (!supabase) throw new Error('Database not configured')
  const { error } = await supabase.from('pm_task_comments').delete().eq('id', id)
  if (error) throw error
}

// ── Activity Feed ──────────────────────────────────────────

export async function getProjectActivity(projectId, limit = 20) {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('pm_activity')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) { console.error('Error fetching activity:', error); return [] }
    return data || []
  } catch (err) { return [] }
}

export async function logActivity(fields) {
  if (!supabase) return
  try {
    await supabase.from('pm_activity').insert(fields)
  } catch {}
}

// ── Subtasks ───────────────────────────────────────────────

export async function getSubtasks(taskId) {
  if (!supabase) return []
  try {
    const { data, error } = await supabase.from('pm_subtasks').select('*').eq('task_id', taskId).order('created_at', { ascending: true })
    if (error) { console.error(error); return [] }
    return data || []
  } catch { return [] }
}

export async function createSubtask(fields) {
  if (!supabase) throw new Error('Database not configured')
  const { data, error } = await supabase.from('pm_subtasks').insert(fields).select().single()
  if (error) throw error
  return data
}

export async function updateSubtask(id, fields) {
  if (!supabase) throw new Error('Database not configured')
  const { data, error } = await supabase.from('pm_subtasks').update(fields).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteSubtask(id) {
  if (!supabase) throw new Error('Database not configured')
  const { error } = await supabase.from('pm_subtasks').delete().eq('id', id)
  if (error) throw error
}

// ── Time Logs ──────────────────────────────────────────────

export async function getTimeLogs(taskId) {
  if (!supabase) return []
  try {
    const { data, error } = await supabase.from('pm_time_logs').select('*').eq('task_id', taskId).order('created_at', { ascending: false })
    if (error) { console.error(error); return [] }
    return data || []
  } catch { return [] }
}

export async function createTimeLog(fields) {
  if (!supabase) throw new Error('Database not configured')
  const { data, error } = await supabase.from('pm_time_logs').insert(fields).select().single()
  if (error) throw error
  return data
}

export async function deleteTimeLog(id) {
  if (!supabase) throw new Error('Database not configured')
  const { error } = await supabase.from('pm_time_logs').delete().eq('id', id)
  if (error) throw error
}

export async function getProjectTimeLogs(projectId) {
  if (!supabase) return []
  try {
    const { data, error } = await supabase.from('pm_time_logs').select('*').eq('project_id', projectId).order('created_at', { ascending: false })
    if (error) { console.error(error); return [] }
    return data || []
  } catch { return [] }
}

// ── Project Duplication ────────────────────────────────────────

export async function duplicateProject(projectId) {
  if (!supabase) throw new Error('Database not configured')
  const { data: orig, error: pe } = await supabase.from('pm_projects').select('*').eq('id', projectId).single()
  if (pe || !orig) throw new Error('Project not found')
  const { data: newProject, error: ne } = await supabase
    .from('pm_projects')
    .insert({
      user_id: orig.user_id, name: `${orig.name} (copy)`, description: orig.description,
      status: 'active', client_name: orig.client_name, client_email: orig.client_email, color: orig.color,
    })
    .select().single()
  if (ne) throw ne
  const { data: tasks } = await supabase.from('pm_tasks').select('*').eq('project_id', projectId)
  if (tasks && tasks.length > 0) {
    await supabase.from('pm_tasks').insert(
      tasks.map((t) => ({
        project_id: newProject.id, title: t.title, description: t.description,
        status: t.status, priority: t.priority, due_date: t.due_date,
        label: t.label, task_link: t.task_link,
      }))
    )
  }
  const { data: milestones } = await supabase.from('pm_milestones').select('*').eq('project_id', projectId)
  if (milestones && milestones.length > 0) {
    await supabase.from('pm_milestones').insert(
      milestones.map((m) => ({ project_id: newProject.id, title: m.title, due_date: m.due_date, completed: false }))
    )
  }
  return newProject
}

// ── Client Comments ────────────────────────────────────────────

export async function getClientComments(shareToken) {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('pm_client_comments').select('*').eq('share_token', shareToken)
      .order('created_at', { ascending: true })
    if (error) { console.error(error); return [] }
    return data || []
  } catch { return [] }
}

export async function createClientComment(fields) {
  if (!supabase) throw new Error('Database not configured')
  const { data, error } = await supabase.from('pm_client_comments').insert(fields).select().single()
  if (error) throw error
  return data
}
