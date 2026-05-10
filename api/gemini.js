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
       text: `You are an expert Biochemistry professor. Answer ANY question the student asks, with special focus on molecular structures, protein folding, metabolic pathways, enzyme mechanisms, and biochemical diagrams. Provide detailed, accurate, step-by-step explanations. Use real biochemical terms and be thorough. If the student asks for a "structure", describe it clearly including bonds, functional groups, and 3D arrangement.
       Student: ${message}`
}]
      }],
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 1000,
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
