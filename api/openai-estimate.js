const OpenAI = require('openai').default;

module.exports = async function handler(req, res) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { requirements, location } = req.body;

    if (!requirements || requirements.length < 50) {
      return res.status(400).json({ 
        error: 'Requirements must be at least 50 characters' 
      });
    }

    const locationContext = location
      ? `The client is based in ${location.city ? location.city + ', ' : ''}${location.country}. Use realistic LOCAL market rates for software developers in that region. Express all costs in the local currency of that country (e.g. INR for India, GBP for UK, AUD for Australia). Do NOT convert to USD.`
      : '';

    const prompt = `You are an expert software development cost estimator. Analyze the following project requirements and provide a detailed cost estimate.
${locationContext ? '\n' + locationContext + '\n' : ''}
Project Requirements:
${requirements}

Please provide a JSON response with this exact structure:
{
  "currency": string (currency code, e.g. "INR", "USD", "GBP", "AUD"),
  "currencySymbol": string (symbol, e.g. "₹", "$", "£", "A$"),
  "totalCostMin": number (minimum estimated cost in the local currency),
  "totalCostMax": number (maximum estimated cost in the local currency),
  "timeline": string (estimated timeline like "2-3 months"),
  "breakdown": [
    {
      "category": string (e.g., "Frontend Development", "Backend Development", "Database", "Testing", "Deployment"),
      "costMin": number,
      "costMax": number,
      "description": string
    }
  ],
  "complexity": string (Low, Medium, High),
  "recommendations": [
    string (2-3 recommendations for the project)
  ],
  "risks": [
    string (2-3 potential risks)
  ]
}

Be realistic and conservative with estimates. Use actual current market rates for the specified region.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert software development cost estimator. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);
    
    return res.status(200).json(parsed);

  } catch (error) {
    console.error('OpenAI API error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate cost estimate',
      message: error.message 
    });
  }
};
