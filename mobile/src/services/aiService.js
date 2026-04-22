import axios from 'axios';

// GitHub Models endpoint (free)
const GITHUB_TOKEN = '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';
const GITHUB_URL = 'https://models.inference.ai.azure.com/chat/completions';

export async function askFarmerQuestion(question, weatherContext, soilContext) {
  try {
    const systemPrompt = `You are Agrodew AI, a farming assistant. 
Weather: ${weatherContext}
Soil: ${soilContext}
Give short, practical advice.`;

    const response = await axios.post(GITHUB_URL, {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ],
      temperature: 0.7,
      max_tokens: 300
    }, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('AI error:', error);
    return "I'm having trouble. Please try again later.";
  }
}