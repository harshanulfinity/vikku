const OpenAI = require('openai').default;

module.exports = async function handler(req, res) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { businessType, monthlyLeads, avgDealValue, howTheyGetClients, location } = req.body;

    if (!businessType || !monthlyLeads || !avgDealValue) {
      return res.status(400).json({ 
        error: 'Missing required fields: businessType, monthlyLeads, avgDealValue' 
      });
    }

    const currency = location?.country === 'India' ? 'INR' : location?.country === 'United Kingdom' ? 'GBP' : location?.country === 'Australia' ? 'AUD' : 'USD';
    const symbol = currency === 'INR' ? '₹' : currency === 'GBP' ? '£' : currency === 'AUD' ? 'A$' : '$';

    const prompt = `You are a business ROI analyst specializing in digital transformation for small and medium businesses.

A ${businessType} business${location ? ` in ${location.city ? location.city + ', ' : ''}${location.country}` : ''} has shared the following details:
- Current monthly leads: ${monthlyLeads}
- Average deal/order value: ${symbol}${avgDealValue}
- How they currently get clients: ${howTheyGetClients}
- They do NOT have a professional website yet.

Calculate the ROI of building a professional website for this business. Be specific, realistic, and persuasive. Use local market data for ${location?.country || 'their region'} and express all monetary values in ${currency}.

Respond with this exact JSON structure:
{
  "currency": "${currency}",
  "currencySymbol": "${symbol}",
  "monthlyRevenueLost": number (estimated monthly revenue they are losing by not having a website),
  "annualRevenueLost": number (annual figure),
  "projectedMonthlyLeads": number (realistic leads/month a website could generate in 6-12 months),
  "projectedMonthlyRevenue": number (projected additional monthly revenue from website leads),
  "websiteCostEstimate": { "min": number, "max": number } (realistic cost to build a professional website in their region),
  "paybackPeriodMonths": number (months to pay back website investment from new revenue),
  "roiPercent": number (annual ROI percentage),
  "keyInsights": [string, string, string] (3 specific, punchy insights about their business situation),
  "topReasons": [string, string, string] (3 top reasons this business specifically needs a website),
  "whatAWebsiteDoes": [
    { "benefit": string, "impact": string }
  ] (4 specific benefits with measurable impact for their business type)
}

Be specific to their business type. A restaurant has different website benefits than a staffing agency.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a business ROI analyst. Always respond with valid JSON.' },
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
      error: 'Failed to calculate ROI',
      message: error.message 
    });
  }
};
