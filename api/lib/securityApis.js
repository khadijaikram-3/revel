/**
 * Security API integrations — VirusTotal and Shodan.
 * Each function tries the real API and falls back to mock data on failure.
 */

const axios = require('axios');

async function checkVirusTotal(targetUrl) {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey) {
    console.log('[virustotal] Skipped — no API key');
    return { source: 'virustotal', status: 'skipped', data: null };
  }

  console.log('[virustotal] Checking URL reputation for:', targetUrl);
  try {
    const encodedUrl = Buffer.from(targetUrl).toString('base64').replace(/=/g, '');
    const response = await axios.get(
      `https://www.virustotal.com/api/v3/urls/${encodedUrl}`,
      { headers: { 'x-apikey': apiKey }, timeout: 10000 }
    );
    const stats = response.data?.data?.attributes?.last_analysis_stats;
    console.log('[virustotal] Success — stats:', JSON.stringify(stats));
    return { source: 'virustotal', status: 'success', data: stats || { harmless: 0, malicious: 0, suspicious: 0 } };
  } catch (error) {
    console.error('[virustotal] Error:', error.message);
    return { source: 'virustotal', status: 'error', error: error.message, data: null };
  }
}

async function checkShodan(ipOrHost) {
  const apiKey = process.env.SHODAN_API_KEY;
  if (!apiKey) {
    console.log('[shodan] Skipped — no API key');
    return { source: 'shodan', status: 'skipped', data: null };
  }

  console.log('[shodan] Scanning host:', ipOrHost);
  try {
    const response = await axios.get(
      `https://api.shodan.io/shodan/host/${ipOrHost}?key=${apiKey}`,
      { timeout: 10000 }
    );
    const d = response.data || {};
    console.log('[shodan] Success — ports:', d.ports?.length || 0, '— hostnames:', d.hostnames?.length || 0);
    return {
      source: 'shodan',
      status: 'success',
      data: {
        ports: d.ports || [],
        hostnames: d.hostnames || [],
        org: d.org || 'Unknown',
        os: d.os || 'Unknown',
        serverFingerprint: {
          product: d.product || 'Unknown',
          version: d.version || 'Unknown',
          banners: (d.data || []).slice(0, 3).map((e) => ({ port: e.port, banner: (e.data || '').substring(0, 500) })),
        },
        subdomains: d.domains || [],
      },
    };
  } catch (error) {
    console.error('[shodan] Error:', error.message);
    return { source: 'shodan', status: 'error', error: error.message, data: null };
  }
}

async function checkShodanDNS(domain) {
  const apiKey = process.env.SHODAN_API_KEY;
  if (!apiKey) {
    console.log('[shodan-dns] Skipped — no API key');
    return { source: 'shodan-dns', status: 'skipped', data: null };
  }

  console.log('[shodan-dns] Querying DNS for domain:', domain);
  try {
    const response = await axios.get(
      `https://api.shodan.io/dns/domain/${domain}?key=${apiKey}`,
      { timeout: 10000 }
    );
    const d = response.data || {};
    console.log('[shodan-dns] Success — subdomains:', d.subdomains?.length || 0, '— DNS records:', d.data?.length || 0);
    return {
      source: 'shodan-dns',
      status: 'success',
      data: {
        domain: d.domain || domain,
        subdomains: (d.subdomains || []).map((s) => `${s}.${domain}`),
        dnsRecords: (d.data || []).slice(0, 20).map((r) => ({
          type: r.type, value: r.value, subdomain: r.subdomain || '', ttl: r.ttl || null,
        })),
      },
    };
  } catch (error) {
    console.error('[shodan-dns] Error:', error.message);
    return { source: 'shodan-dns', status: 'error', error: error.message, data: null };
  }
}

async function runSecurityAPIChecks(targetUrl) {
  const hostname = targetUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const domain = hostname.split('.').slice(-2).join('.');
  console.log('[securityAPIs] Running checks for hostname:', hostname, '— domain:', domain);

  const [virustotal, shodan, shodanDns] = await Promise.allSettled([
    checkVirusTotal(targetUrl),
    checkShodan(hostname),
    checkShodanDNS(domain),
  ]);

  return {
    virustotal: virustotal.status === 'fulfilled' ? virustotal.value : { source: 'virustotal', status: 'error', data: null },
    shodan: shodan.status === 'fulfilled' ? shodan.value : { source: 'shodan', status: 'error', data: null },
    shodanDns: shodanDns.status === 'fulfilled' ? shodanDns.value : { source: 'shodan-dns', status: 'error', data: null },
  };
}

module.exports = { runSecurityAPIChecks, checkVirusTotal, checkShodan, checkShodanDNS };
