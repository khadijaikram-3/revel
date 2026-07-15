export default async function handler(req, res) {
  const results = {};

  // 1. Test OpenRouter
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

  // 2. Test Shodan InternetDB (NO API KEY!)
  try {
    const response = await fetch('https://internetdb.shodan.io/example.com');
    results.shodan_internetdb = {
      status: response.status,
      ok: response.ok,
      message: response.ok ? '✅ Shodan InternetDB is working!' : `❌ Error: ${response.status}`
    };
    if (response.ok) {
      const data = await response.json();
      results.shodan_internetdb.ports = data.ports || [];
      results.shodan_internetdb.vulns = data.vulns || {};
    }
  } catch (err) {
    results.shodan_internetdb = { error: err.message };
  }

  // 3. Test VirusTotal
  try {
    const vtKey = process.env.VIRUSTOTAL_API_KEY;
    if (vtKey) {
      const encodedUrl = Buffer.from('https://example.com').toString('base64').replace(/=/g, '');
      const response = await fetch(
        `https://www.virustotal.com/api/v3/urls/${encodedUrl}`,
        { headers: { 'x-apikey': vtKey } }
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

  res.status(200).json(results);
}