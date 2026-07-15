export default async function handler(req, res) {
  const results = {};

  console.log('[test-apis] Starting API tests...');

  // 1. Test OpenRouter API (NEW)
  console.log('[test-apis] Testing OpenRouter...');
  try {
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    if (openRouterKey) {
      const response = await fetch(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openRouterKey}`,
            'HTTP-Referer': 'https://revel-gules.vercel.app',
            'X-Title': 'Revel Security Scanner',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'deepseek/deepseek-chat-v3-0324',
            messages: [{ role: 'user', content: 'Say hello' }],
            max_tokens: 10,
          }),
        }
      );
      results.openrouter = {
        status: response.status,
        ok: response.ok,
        message: response.ok ? '✅ OpenRouter is working!' : `❌ Error: ${response.status}`
      };
    } else {
      results.openrouter = { error: 'No OpenRouter API key found' };
    }
  } catch (err) {
    results.openrouter = { error: err.message };
  }

  // 2. Test Groq API
  console.log('[test-apis] Testing Groq...');
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
            model: 'llama-3.1-8b-instant',
            messages: [{ role: 'user', content: 'Say hello' }],
            max_tokens: 10,
          }),
        }
      );
      results.groq = {
        status: response.status,
        ok: response.ok,
        message: response.ok ? '✅ Groq is working!' : `❌ Error: ${response.status}`
      };
    } else {
      results.groq = { error: 'No Groq API key found' };
    }
  } catch (err) {
    results.groq = { error: err.message };
  }

  // 3. Test VirusTotal API
  console.log('[test-apis] Testing VirusTotal...');
  try {
    const vtKey = process.env.VIRUSTOTAL_API_KEY;
    if (vtKey) {
      const encodedUrl = Buffer.from('https://example.com').toString('base64').replace(/=/g, '');
      const response = await fetch(
        `https://www.virustotal.com/api/v3/urls/${encodedUrl}`,
        {
          headers: { 'x-apikey': vtKey },
        }
      );
      results.virustotal = {
        status: response.status,
        ok: response.ok,
        message: response.ok ? '✅ VirusTotal is working!' : `❌ Error: ${response.status}`
      };
    } else {
      results.virustotal = { error: 'No VirusTotal API key found' };
    }
  } catch (err) {
    results.virustotal = { error: err.message };
  }

  // 4. Test Shodan API
  console.log('[test-apis] Testing Shodan...');
  try {
    const shodanKey = process.env.SHODAN_API_KEY;
    if (shodanKey) {
      const response = await fetch(
        `https://api.shodan.io/shodan/host/example.com?key=${shodanKey}`
      );
      results.shodan = {
        status: response.status,
        ok: response.ok,
        message: response.ok ? '✅ Shodan is working!' : `❌ Error: ${response.status}`
      };
    } else {
      results.shodan = { error: 'No Shodan API key found' };
    }
  } catch (err) {
    results.shodan = { error: err.message };
  }

  console.log('[test-apis] Tests complete!');
  res.status(200).json(results);
}