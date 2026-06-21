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

    const prompt = `You are a business ROI analyst. A business owner has shared their details. Calculate the ROI of getting a professional website.

Business Type: ${inputs.businessType}
Current Monthly Leads: ${inputs.monthlyLeads}
Average Deal Value: ${inputs.avgDealValue} ${inputs.location?.country === 'India' ? 'INR' : 'USD'}
How They Get Clients: ${inputs.howTheyGetClients}
Location: ${inputs.location ? `${inputs.location.city || ''} ${inputs.location.country}` : 'Not specified'}

Respond with this exact JSON:
{
  "monthlyRevenueLost": number,
  "annualRevenueLost": number,
  "roiPercent": number,
  "projectedMonthlyLeads": number,
  "projectedMonthlyRevenue": number,
  "paybackPeriodMonths": number,
  "currencySymbol": "₹" or "$" or relevant symbol,
  "websiteCostEstimate": { "min": number, "max": number },
  "whatAWebsiteDoes": [{ "benefit": "string", "impact": "string" }],
  "keyInsights": ["string", "string", "string"]
}

Use realistic local market rates. For India use INR (₹). Provide 4-5 items in whatAWebsiteDoes and 3 keyInsights.`

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a business ROI analyst. Always respond with valid JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 1200,
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
