export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    // Use the correct model name from the list: gemini-2.5-flash (stable)
    const model = 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

    const payload = {
      contents: [{
        parts: [{
  text: `You are a precise, factual Biochemistry professor at UMYU. Provide clear, concise answers based on standard biochemistry knowledge (Lehninger, Voet & Voet). Avoid extra fluff like "Ah, my brilliant student!". Be direct and educational.

Student question: ${message}`
}]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Gemini API error:', data);
      const errorMsg = data.error?.message || 'Gemini API request failed';
      return res.status(500).json({ error: errorMsg });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) {
      throw new Error('Empty response from Gemini');
    }
    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
