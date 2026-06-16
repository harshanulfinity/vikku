import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify user and check Pro subscription
    const authHeader = req.headers.get('Authorization') || ''
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user } } = await userClient.auth.getUser()

    if (user) {
      const adminClient = createClient(supabaseUrl, supabaseServiceKey)
      const { data: sub } = await adminClient
        .from('pm_subscriptions')
        .select('plan')
        .eq('user_id', user.id)
        .maybeSingle()

      const plan = sub?.plan || 'free'
      if (plan === 'free') {
        return new Response(
          JSON.stringify({ error: 'pro_required', message: 'AI Project Planner requires a Pro plan. Upgrade to unlock.' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

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
