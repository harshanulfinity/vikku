import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { description } = req.body;

    if (!description || description.length < 20) {
      return res.status(400).json({ 
        error: 'Project description must be at least 20 characters' 
      });
    }

    const today = new Date().toISOString().split('T')[0];

    const prompt = `You are an expert project manager. A founder has described their project below. Generate a practical project plan with tasks and milestones.

Project description: ${description}

Today's date: ${today}

Respond with this exact JSON structure:
{
  "summary": string (1-2 sentence project overview),
  "tasks": [
    {
      "title": string (concise task name),
      "description": string (what needs to be done, 1 sentence),
      "status": string (one of: "todo", "in_progress", "review", "done"),
      "priority": string (one of: "low", "medium", "high", "urgent")
    }
  ],
  "milestones": [
    {
      "title": string (milestone name, e.g. "Design approved", "MVP launched"),
      "due_date": string (ISO date YYYY-MM-DD, realistic dates starting from today),
      "completed": false
    }
  ]
}

Generate 10-15 tasks spread realistically across all 4 statuses. Generate 3-5 milestones with realistic future dates. Be specific to the project type described.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a project manager. Always respond with valid JSON.' },
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
      error: 'Failed to plan project',
      message: error.message 
    });
  }
}
