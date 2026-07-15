export default async function handler(req, res) {
  const results = {};

  // Test VirusTotal
  try {
    const vtKey = process.env.VIRUSTOTAL_API_KEY;
    if (vtKey) {
      const response = await fetch(
        `https://www.virustotal.com/api/v3/urls?url=https://example.com`,
        { headers: { 'x-apikey': vtKey } }
      );
      results.virustotal = { status: response.status, ok: response.ok };
    } else {
      results.virustotal = { error: 'No API key' };
    }
  } catch (err) {
    results.virustotal = { error: err.message };
  }

  // Test Shodan
  try {
    const shodanKey = process.env.SHODAN_API_KEY;
    if (shodanKey) {
      const response = await fetch(
        `https://api.shodan.io/shodan/host/example.com?key=${shodanKey}`
      );
      results.shodan = { status: response.status, ok: response.ok };
    } else {
      results.shodan = { error: 'No API key' };
    }
  } catch (err) {
    results.shodan = { error: err.message };
  }

  // Test Groq
  try {
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
      const response = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-oss-120b',
            messages: [{ role: 'user', content: 'Hello' }],
            max_tokens: 10,
          }),
        }
      );
      results.groq = { status: response.status, ok: response.ok };
    } else {
      results.groq = { error: 'No API key' };
    }
  } catch (err) {
    results.groq = { error: err.message };
  }

  res.status(200).json(results);
}