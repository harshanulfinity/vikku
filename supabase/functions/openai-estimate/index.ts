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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(req) })
  }

  try {
    const { requirements, location } = await req.json()

    if (!requirements || requirements.length < 50) {
      return new Response(JSON.stringify({ error: 'Requirements too short' }), {
        status: 400,
        headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
      })
    }

    const locationContext = location
      ? `The client is based in ${location.city ? location.city + ', ' : ''}${location.country}. Use local market rates and currency for that region.`
      : 'Use USD and global average rates.'

    const prompt = `You are an expert software project estimator. Analyze these requirements and provide a detailed cost estimate.

Requirements: ${requirements}

${locationContext}

Respond with this exact JSON structure:
{
  "totalCostMin": number,
  "totalCostMax": number,
  "currency": "USD" or local currency code,
  "currencySymbol": "$" or local symbol,
  "timeline": "X-Y weeks/months",
  "complexity": "Low" | "Medium" | "High",
  "breakdown": [
    {
      "category": "string (e.g. UI/UX Design, Frontend, Backend, etc.)",
      "costMin": number,
      "costMax": number,
      "description": "brief explanation"
    }
  ],
  "recommendations": ["string", "string", "string"],
  "risks": ["string", "string", "string"]
}

Provide 5-7 breakdown categories. Be realistic and specific to the region's market rates.`

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a project cost estimator. Always respond with valid JSON.' },
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
