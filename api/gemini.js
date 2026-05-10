export default async function handler(req, res) {
  // Enable CORS for development (optional)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    console.error('Missing GEMINI_API_KEY environment variable');
    return res.status(500).json({ error: 'Server configuration error: missing API key' });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const payload = {
      contents: [{
        parts: [{
          text: `You are a Biochemistry professor at UMYU. Answer concisely and accurately. Student: ${message}`
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

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Invalid JSON from Gemini:', responseText);
      throw new Error('Invalid response from Gemini API');
    }

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
