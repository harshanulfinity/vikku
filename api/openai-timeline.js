import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { projectType, featureCount, designComplexity, revisions, clientAvailability, hasDesign } = req.body;

    if (!projectType || !featureCount || !designComplexity || !revisions || !clientAvailability || !hasDesign) {
      return res.status(400).json({ 
        error: 'Missing required fields' 
      });
    }

    const prompt = `You are an expert software project manager with 10+ years of experience delivering web projects.

Estimate the project timeline for:
- Project type: ${projectType}
- Number of features: ${featureCount}
- Design complexity: ${designComplexity}
- Revision rounds: ${revisions}
- Client availability for reviews/feedback: ${clientAvailability}
- Design assets already available: ${hasDesign}

Respond with this exact JSON structure:
{
  "totalWeeksMin": number,
  "totalWeeksMax": number,
  "phases": [
    {
      "name": string (e.g., "Discovery & Planning", "UI/UX Design", "Development", "Testing & QA", "Launch"),
      "weeksMin": number,
      "weeksMax": number,
      "description": string (what happens in this phase),
      "deliverables": [string, string] (2 key deliverables)
    }
  ],
  "milestones": [
    { "week": number, "milestone": string }
  ],
  "risks": [string, string] (2 timeline risks to watch out for),
  "tips": [string, string] (2 tips to keep the project on track)
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a software project manager. Always respond with valid JSON.' },
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
      error: 'Failed to calculate timeline',
      message: error.message 
    });
  }
}
