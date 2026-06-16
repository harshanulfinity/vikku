import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { description } = await req.json()

    if (!description || description.length < 10) {
      return new Response(JSON.stringify({ error: 'Description too short' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const today = new Date().toISOString().split('T')[0]
    const prompt = `You are an expert project manager. Generate a practical project plan for: ${description}\n\nToday: ${today}\n\nRespond with JSON:\n{\n  "summary": "1-2 sentence overview",\n  "tasks": [{"title": "string", "description": "string", "status": "todo|in_progress|review|done", "priority": "low|medium|high|urgent"}],\n  "milestones": [{"title": "string", "due_date": "YYYY-MM-DD", "completed": false}]\n}\n\nGenerate 10-15 tasks across all statuses, 3-5 milestones with future dates.`

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a project manager. Always respond with valid JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      }),
    })

    if (!openaiRes.ok) {
      const err = await openaiRes.json()
      throw new Error(err.error?.message || 'OpenAI request failed')
    }

    const data = await openaiRes.json()
    const result = JSON.parse(data.choices[0].message.content)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
