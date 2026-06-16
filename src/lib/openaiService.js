// OpenAI calls are now handled by backend API endpoints for security
// API keys are never exposed to the frontend

export async function estimateProjectCost(requirements, location = null) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/openai-estimate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ requirements, location })
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || 'Failed to generate cost estimate')
    }

    return await response.json()
  } catch (error) {
    throw new Error(`Failed to generate cost estimate: ${error.message}`)
  }
}

async function callEdgeFunction(fnName, body) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  const response = await fetch(`${supabaseUrl}/functions/v1/${fnName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error || `${fnName} failed`)
  }
  return response.json()
}

export async function calculateROI(inputs) {
  try {
    return await callEdgeFunction('openai-roi', inputs)
  } catch (error) {
    throw new Error(`Failed to calculate ROI: ${error.message}`)
  }
}

export async function calculateTimeline(inputs) {
  try {
    return await callEdgeFunction('openai-timeline', inputs)
  } catch (error) {
    throw new Error(`Failed to calculate timeline: ${error.message}`)
  }
}

export async function recommendStack(inputs) {
  try {
    return await callEdgeFunction('openai-stack', inputs)
  } catch (error) {
    throw new Error(`Failed to recommend stack: ${error.message}`)
  }
}

export async function planProject(description) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/openai-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ description })
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || 'Failed to plan project')
    }

    return await response.json()
  } catch (error) {
    throw new Error(`Failed to plan project: ${error.message}`)
  }
}
