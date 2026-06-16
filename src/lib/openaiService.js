// OpenAI calls are now handled by backend API endpoints for security
// API keys are never exposed to the frontend

export async function estimateProjectCost(requirements, location = null) {
  try {
    const response = await fetch('/api/openai-estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requirements, location })
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = 'Failed to generate cost estimate'
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.error || errorMessage
      } catch {
        errorMessage = errorText || errorMessage
      }
      throw new Error(errorMessage)
    }

    const text = await response.text()
    if (!text) {
      throw new Error('Empty response from server')
    }
    return JSON.parse(text)
  } catch (error) {
    throw new Error(`Failed to generate cost estimate: ${error.message}`)
  }
}

export async function calculateROI(inputs) {
  try {
    const response = await fetch('/api/openai-roi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inputs)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to calculate ROI')
    }

    return await response.json()
  } catch (error) {
    throw new Error(`Failed to calculate ROI: ${error.message}`)
  }
}

export async function calculateTimeline(inputs) {
  try {
    const response = await fetch('/api/openai-timeline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inputs)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to calculate timeline')
    }

    return await response.json()
  } catch (error) {
    throw new Error(`Failed to calculate timeline: ${error.message}`)
  }
}

export async function recommendStack(inputs) {
  try {
    const response = await fetch('/api/openai-stack', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inputs)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to recommend stack')
    }

    return await response.json()
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
