import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const inputs = await req.json()

    const prompt = `You are a senior software architect. Recommend the best tech stack for this project:

Project Type: ${inputs.projectType}
Expected Scale: ${inputs.scale}
Budget: ${inputs.budget}
Dev Team: ${inputs.hasDevTeam}
Key Requirements: ${inputs.requirements?.join(', ') || 'None specified'}

Respond with this exact JSON:
{
  "recommendedStack": {
    "frontend": "string",
    "backend": "string",
    "database": "string",
    "hosting": "string",
    "extras": ["string"]
  },
  "whyThisStack": "string (2-3 sentences explaining the choice)",
  "totalMonthlyCost": "string (e.g. '$20-50/month')",
  "technologies": [
    {
      "name": "string",
      "role": "string",
      "reason": "string",
      "monthlyCost": "string",
      "pros": ["string"]
    }
  ],
  "alternativeStack": {
    "name": "string",
    "stack": "string",
    "whenToChoose": "string"
  },
  "warnings": ["string"]
}

Provide 4-6 technologies, 2-3 warnings. Be specific and practical.`

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a software architect. Always respond with valid JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 1500,
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
