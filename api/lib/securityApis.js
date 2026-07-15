// api/lib/securityApis.js — Correct Free Tier Endpoints

export async function runSecurityAPIChecks(targetUrl) {
  console.log('[securityApis] Starting checks for:', targetUrl);

  const results = {
    virustotal: { status: 'pending' },
    shodan: { status: 'pending' },
    shodanDns: { status: 'pending' },
  };

  const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;
  const SHODAN_API_KEY = process.env.SHODAN_API_KEY;

  // 1. VirusTotal (Already Working)
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

  // 2. Shodan — CORRECT FREE TIER METHOD
  if (SHODAN_API_KEY) {
    try {
      const url = new URL(targetUrl);
      const hostname = url.hostname;

      // ✅ USE THE CORRECT FREE TIER ENDPOINT
      // This returns open ports without requiring a paid plan
      console.log('[securityApis] Shodan: looking up hostname:', hostname);
      
      const response = await fetch(
        `https://api.shodan.io/shodan/host/${hostname}?key=${SHODAN_API_KEY}`
      );

      if (response.ok) {
        const data = await response.json();
        results.shodan = { status: 'success', data };
        
        // ✅ Extract and log the open ports found
        const ports = data.ports || [];
        console.log('[securityApis] Shodan: found ports:', ports.length > 0 ? ports.join(', ') : 'none');
        
        if (ports.length > 0) {
          console.log('[securityApis] Shodan: open ports detected:', ports);
        } else {
          console.log('[securityApis] Shodan: no open ports found');
        }
      } else if (response.status === 403) {
        // ✅ This means your key is valid but the host isn't in Shodan's database
        console.log('[securityApis] Shodan: host not found in database (403) — this is normal');
        results.shodan = { 
          status: 'skipped', 
          error: 'Host not in Shodan database',
          message: 'No open ports found in Shodan\'s database for this host'
        };
      } else {
        results.shodan = { status: 'error', error: `HTTP ${response.status}` };
        console.log('[securityApis] Shodan: error', response.status);
      }
    } catch (err) {
      results.shodan = { status: 'error', error: err.message };
      console.log('[securityApis] Shodan: exception', err.message);
    }
  } else {
    results.shodan = { status: 'skipped', error: 'No API key' };
    console.log('[securityApis] Shodan: skipped (no key)');
  }

  // 3. Shodan DNS (Free Tier)
  if (SHODAN_API_KEY) {
    try {
      const url = new URL(targetUrl);
      const hostname = url.hostname;
      
      const response = await fetch(
        `https://api.shodan.io/dns/domain/${hostname}?key=${SHODAN_API_KEY}`
      );

      if (response.ok) {
        const data = await response.json();
        results.shodanDns = { status: 'success', data };
        console.log('[securityApis] Shodan DNS: success');
      } else if (response.status === 403) {
        console.log('[securityApis] Shodan DNS: domain not found');
        results.shodanDns = { status: 'skipped', error: 'Domain not in Shodan database' };
      } else {
        results.shodanDns = { status: 'error', error: `HTTP ${response.status}` };
        console.log('[securityApis] Shodan DNS: error', response.status);
      }
    } catch (err) {
      results.shodanDns = { status: 'error', error: err.message };
      console.log('[securityApis] Shodan DNS: exception', err.message);
    }
  } else {
    results.shodanDns = { status: 'skipped', error: 'No API key' };
    console.log('[securityApis] Shodan DNS: skipped (no key)');
  }

  return results;
}