import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

function corsHeaders(req: Request) {
  const origin = req.headers.get('origin') ?? ''
  return {
    'Access-Control-Allow-Origin': origin === 'https://vikku.in' ? origin : '',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Vary': 'Origin',
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) })

  try {
    const rawBody = await req.text()
    if (rawBody.length > 8000) return new Response(JSON.stringify({ error: "Request too large" }), { status: 413, headers: { ...corsHeaders(req), "Content-Type": "application/json" } })
    const inputs = JSON.parse(rawBody)

    const prompt = `You are a software project manager. Estimate a realistic project timeline based on these inputs:

Project Type: ${inputs.projectType}
Feature Count: ${inputs.featureCount}
Design Complexity: ${inputs.designComplexity}
Revision Rounds: ${inputs.revisions}
Client Availability: ${inputs.clientAvailability}
Has Design Assets: ${inputs.hasDesign}

Respond with this exact JSON:
{
  "totalWeeksMin": number,
  "totalWeeksMax": number,
  "phases": [
    {
      "name": "string",
      "weeksMin": number,
      "weeksMax": number,
      "description": "string",
      "deliverables": ["string"]
    }
  ],
  "milestones": [
    { "week": number, "milestone": "string" }
  ],
  "risks": ["string"],
  "tips": ["string"]
}

Provide 4-6 phases, 4-6 milestones, 3-4 risks, 3-4 tips. Be realistic based on the inputs.`

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
      headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
    })
  }
})
