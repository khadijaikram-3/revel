// api/lib/securityApis.js — Using Free Shodan InternetDB + Censys

export async function runSecurityAPIChecks(targetUrl) {
  console.log('[securityApis] Starting checks for:', targetUrl);

  const results = {
    virustotal: { status: 'pending' },
    shodan: { status: 'pending' },
    shodanDns: { status: 'pending' },
    censys: { status: 'pending' },
  };

  const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;
  const CENSYS_API_ID = process.env.CENSYS_API_ID;
  const CENSYS_API_SECRET = process.env.CENSYS_API_SECRET;

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

  // 2. ✅ Shodan InternetDB — NO API KEY REQUIRED!
  try {
    const url = new URL(targetUrl);
    const hostname = url.hostname;

    console.log('[securityApis] Shodan InternetDB: looking up:', hostname);
    
    // ✅ FREE — No API key needed!
    const response = await fetch(
      `https://internetdb.shodan.io/${hostname}`
    );

    if (response.ok) {
      const data = await response.json();
      results.shodan = { status: 'success', data };
      const ports = data.ports || [];
      console.log('[securityApis] Shodan InternetDB: found ports:', ports.length > 0 ? ports.join(', ') : 'none');
      
      if (data.vulns) {
        console.log('[securityApis] Shodan InternetDB: found vulnerabilities:', Object.keys(data.vulns).length);
      }
    } else if (response.status === 404) {
      console.log('[securityApis] Shodan InternetDB: host not found');
      results.shodan = { 
        status: 'skipped', 
        error: 'Host not in Shodan database',
        message: 'No data available for this host'
      };
    } else {
      results.shodan = { status: 'error', error: `HTTP ${response.status}` };
      console.log('[securityApis] Shodan InternetDB: error', response.status);
    }
  } catch (err) {
    results.shodan = { status: 'error', error: err.message };
    console.log('[securityApis] Shodan InternetDB: exception', err.message);
  }

  // 3. Censys (Backup — if you want to add keys later)
  if (CENSYS_API_ID && CENSYS_API_SECRET) {
    try {
      const url = new URL(targetUrl);
      const hostname = url.hostname;

      const auth = Buffer.from(`${CENSYS_API_ID}:${CENSYS_API_SECRET}`).toString('base64');
      const response = await fetch(
        `https://search.censys.io/api/v2/hosts/${hostname}`,
        { headers: { 'Authorization': `Basic ${auth}` } }
      );

      if (response.ok) {
        const data = await response.json();
        results.censys = { status: 'success', data };
        console.log('[securityApis] Censys: success');
      } else {
        results.censys = { status: 'error', error: `HTTP ${response.status}` };
        console.log('[securityApis] Censys: error', response.status);
      }
    } catch (err) {
      results.censys = { status: 'error', error: err.message };
      console.log('[securityApis] Censys: exception', err.message);
    }
  } else {
    results.censys = { status: 'skipped', error: 'No Censys keys' };
    console.log('[securityApis] Censys: skipped (no keys)');
  }

  return results;
}