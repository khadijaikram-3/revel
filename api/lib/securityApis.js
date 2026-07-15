// api/lib/securityApis.js — ESM Version

export async function runSecurityAPIChecks(targetUrl) {
  console.log('[securityApis] Starting checks for:', targetUrl);

  const results = {
    virustotal: { status: 'pending' },
    shodan: { status: 'pending' },
    shodanDns: { status: 'pending' },
  };

  const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;
  const SHODAN_API_KEY = process.env.SHODAN_API_KEY;

  // VirusTotal check
  if (VIRUSTOTAL_API_KEY) {
    try {
      const response = await fetch(
        `https://www.virustotal.com/api/v3/urls?url=${encodeURIComponent(targetUrl)}`,
        {
          headers: {
            'x-apikey': VIRUSTOTAL_API_KEY,
          },
        }
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

  // Shodan check
  if (SHODAN_API_KEY) {
    try {
      const url = new URL(targetUrl);
      const hostname = url.hostname;

      const response = await fetch(
        `https://api.shodan.io/shodan/host/${hostname}?key=${SHODAN_API_KEY}`
      );

      if (response.ok) {
        const data = await response.json();
        results.shodan = { status: 'success', data };
        console.log('[securityApis] Shodan: success');
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

  return results;
}