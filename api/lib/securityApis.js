// api/lib/securityApis.js — FINAL WORKING VERSION
// Uses Shodan InternetDB (NO API KEY REQUIRED) + VirusTotal + OpenRouter

export async function runSecurityAPIChecks(targetUrl) {
  console.log('[securityApis] Starting checks for:', targetUrl);

  const results = {
    virustotal: { status: 'pending' },
    shodan: { status: 'pending' },
  };

  const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;

  // 1. VirusTotal (Working)
  if (VIRUSTOTAL_API_KEY) {
    try {
      const encodedUrl = Buffer.from(targetUrl).toString('base64').replace(/=/g, '');
      const response = await fetch(
        `https://www.virustotal.com/api/v3/urls/${encodedUrl}`,
        { headers: { 'x-apikey': VIRUSTOTAL_API_KEY } }
      );

      if (response.ok) {
        const data = await response.json();
        results.virustotal = { status: 'success', data };
        console.log('[securityApis] VirusTotal: success');
      } else {
        results.virustotal = { status: 'error', error: `HTTP ${response.status}` };
        console.log('[securityApis] VirusTotal: error', response.status);
      }
    } catch (err) {
      results.virustotal = { status: 'error', error: err.message };
      console.log('[securityApis] VirusTotal: exception', err.message);
    }
  } else {
    results.virustotal = { status: 'skipped', error: 'No API key' };
    console.log('[securityApis] VirusTotal: skipped (no key)');
  }

  // 2. Shodan InternetDB — NO API KEY REQUIRED!
  try {
    const url = new URL(targetUrl);
    const hostname = url.hostname;

    console.log('[securityApis] Shodan InternetDB: looking up:', hostname);
    
    // ✅ FREE — No API key needed!
    const response = await fetch(`https://internetdb.shodan.io/${hostname}`);

    if (response.ok) {
      const data = await response.json();
      results.shodan = { status: 'success', data };
      const ports = data.ports || [];
      console.log('[securityApis] Shodan InternetDB: found ports:', ports.length > 0 ? ports.join(', ') : 'none');
      
      if (data.vulns) {
        console.log('[securityApis] Shodan InternetDB: found vulnerabilities:', Object.keys(data.vulns).length);
      }
    } else if (response.status === 404) {
      console.log('[securityApis] Shodan InternetDB: host not found in database');
      results.shodan = { 
        status: 'skipped', 
        error: 'Host not in Shodan database',
        message: 'No open ports found for this host'
      };
    } else {
      results.shodan = { status: 'error', error: `HTTP ${response.status}` };
      console.log('[securityApis] Shodan InternetDB: error', response.status);
    }
  } catch (err) {
    results.shodan = { status: 'error', error: err.message };
    console.log('[securityApis] Shodan InternetDB: exception', err.message);
  }

  return results;
}