// api/lib/securityApis.js — FREE TIER ONLY
export async function runSecurityAPIChecks(targetUrl) {
  console.log('[securityApis] Starting checks for:', targetUrl);

  const results = {
    virustotal: { status: 'pending' },
    shodanSearch: { status: 'pending' },
    shodanDns: { status: 'pending' },
  };

  const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;
  const SHODAN_API_KEY = process.env.SHODAN_API_KEY;

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

  // 2. Shodan — FREE TIER SEARCH
  if (SHODAN_API_KEY) {
    try {
      const url = new URL(targetUrl);
      const hostname = url.hostname;

      console.log('[securityApis] Shodan Search: looking up:', hostname);
      
      // ✅ FREE TIER ENDPOINT — Works with free API key
      const response = await fetch(
        `https://api.shodan.io/shodan/host/search?key=${SHODAN_API_KEY}&query=${hostname}`
      );

      if (response.ok) {
        const data = await response.json();
        results.shodanSearch = { status: 'success', data };
        const total = data.total || 0;
        console.log('[securityApis] Shodan Search: found', total, 'results');
        
        // Extract ports from the first result if available
        if (data.matches && data.matches.length > 0) {
          const ports = data.matches[0].ports || [];
          console.log('[securityApis] Shodan Search: ports found:', ports.length > 0 ? ports.join(', ') : 'none');
        }
      } else if (response.status === 403) {
        console.log('[securityApis] Shodan Search: no results or need membership');
        results.shodanSearch = { 
          status: 'skipped', 
          error: 'No results found or membership required',
          message: 'Using mock data for ports'
        };
      } else {
        results.shodanSearch = { status: 'error', error: `HTTP ${response.status}` };
        console.log('[securityApis] Shodan Search: error', response.status);
      }
    } catch (err) {
      results.shodanSearch = { status: 'error', error: err.message };
      console.log('[securityApis] Shodan Search: exception', err.message);
    }
  } else {
    results.shodanSearch = { status: 'skipped', error: 'No API key' };
    console.log('[securityApis] Shodan Search: skipped (no key)');
  }

  // 3. Shodan DNS — FREE TIER
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
        results.shodanDns = { status: 'skipped', error: 'Domain not found' };
        console.log('[securityApis] Shodan DNS: domain not found');
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