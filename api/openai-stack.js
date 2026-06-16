const OpenAI = require('openai').default;

module.exports = async function handler(req, res) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { projectType, scale, budget, hasDevTeam, requirements } = req.body;

    if (!projectType || !scale || !budget || !hasDevTeam || !requirements) {
      return res.status(400).json({ 
        error: 'Missing required fields' 
      });
    }

    const prompt = `You are a senior software architect advising a client on their technology stack.

Project details:
- What they're building: ${projectType}
- Expected scale: ${scale}
- Budget range: ${budget}
- In-house dev team: ${hasDevTeam}
- Key requirements: ${requirements.join(', ')}

Recommend the best technology stack for this project. Be opinionated and practical — don't list 5 options, pick the best one and justify it.

Respond with this exact JSON structure:
{
  "recommendedStack": {
    "frontend": string,
    "backend": string,
    "database": string,
    "hosting": string,
    "extras": [string] (2-3 additional tools/services)
  },
  "whyThisStack": string (2-3 sentence summary of why this stack is the best fit),
  "technologies": [
    {
      "name": string,
      "role": string (e.g. "Frontend Framework"),
      "reason": string (why it fits their needs),
      "pros": [string, string],
      "monthlyCost": string (e.g. "Free", "$20/month", "Varies")
    }
  ],
  "alternativeStack": {
    "name": string (e.g. "Budget Alternative"),
    "stack": string (e.g. "WordPress + WooCommerce"),
    "whenToChoose": string
  },
  "timeToLearn": string (if they have no dev team, how long to find/learn),
  "totalMonthlyCost": string (estimated monthly infra cost),
  "warnings": [string] (1-2 things to watch out for with this stack)
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a senior software architect. Always respond with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    const parsed = JSON.parse(response.choices[0].message.content);
    return res.status(200).json(parsed);

  } catch (error) {
    console.error('OpenAI API error:', error);
    return res.status(500).json({ 
      error: 'Failed to recommend stack',
      message: error.message 
    });
  }
};
