/**
 * Security API integrations — VirusTotal and Shodan.
 * Each function tries the real API and falls back to mock data on failure.
 */

const axios = require('axios');

/**
 * Check URL reputation via VirusTotal.
 * @param {string} targetUrl
 * @returns {Promise<object>} reputation data
 */
async function checkVirusTotal(targetUrl) {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey) return { source: 'virustotal', status: 'skipped', data: null };

  try {
    const encodedUrl = Buffer.from(targetUrl).toString('base64').replace(/=/g, '');
    const response = await axios.get(
      `https://www.virustotal.com/api/v3/urls/${encodedUrl}`,
      { headers: { 'x-apikey': apiKey }, timeout: 10000 }
    );
    const stats = response.data?.data?.attributes?.last_analysis_stats;
    return {
      source: 'virustotal',
      status: 'success',
      data: stats || { harmless: 0, malicious: 0, suspicious: 0 },
    };
  } catch (error) {
    return { source: 'virustotal', status: 'error', error: error.message, data: null };
  }
}

/**
 * Scan open ports, DNS, subdomains, and server fingerprint via Shodan.
 * @param {string} ipOrHost
 * @returns {Promise<object>} host intelligence data
 */
async function checkShodan(ipOrHost) {
  const apiKey = process.env.SHODAN_API_KEY;
  if (!apiKey) return { source: 'shodan', status: 'skipped', data: null };

  try {
    const response = await axios.get(
      `https://api.shodan.io/shodan/host/${ipOrHost}?key=${apiKey}`,
      { timeout: 10000 }
    );
    const d = response.data || {};
    return {
      source: 'shodan',
      status: 'success',
      data: {
        ports: d.ports || [],
        hostnames: d.hostnames || [],
        org: d.org || 'Unknown',
        os: d.os || 'Unknown',
        dns: {
          resolver: d.tags?.includes('resolver') || false,
          records: d.domains || [],
        },
        subdomains: d.domains || [],
        serverFingerprint: {
          product: d.product || 'Unknown',
          version: d.version || 'Unknown',
          cpe: d.cpe23 || null,
          banners: (d.data || []).slice(0, 3).map((entry) => ({
            port: entry.port,
            banner: (entry.data || '').substring(0, 500),
          })),
        },
        location: {
          country: d.country_name || 'Unknown',
          city: d.city || 'Unknown',
          latitude: d.latitude || null,
          longitude: d.longitude || null,
        },
      },
    };
  } catch (error) {
    return { source: 'shodan', status: 'error', error: error.message, data: null };
  }
}

/**
 * Get DNS info via Shodan DNS API (separate endpoint).
 * @param {string} domain
 * @returns {Promise<object>} DNS data
 */
async function checkShodanDNS(domain) {
  const apiKey = process.env.SHODAN_API_KEY;
  if (!apiKey) return { source: 'shodan-dns', status: 'skipped', data: null };

  try {
    const response = await axios.get(
      `https://api.shodan.io/dns/domain/${domain}?key=${apiKey}`,
      { timeout: 10000 }
    );
    const d = response.data || {};
    return {
      source: 'shodan-dns',
      status: 'success',
      data: {
        domain: d.domain || domain,
        subdomains: (d.subdomains || []).map((s) => `${s}.${domain}`),
        tags: d.tags || [],
        dnsRecords: (d.data || []).slice(0, 20).map((r) => ({
          type: r.type,
          value: r.value,
          subdomain: r.subdomain || '',
          ttl: r.ttl || null,
        })),
      },
    };
  } catch (error) {
    return { source: 'shodan-dns', status: 'error', error: error.message, data: null };
  }
}

/**
 * Run all security API checks for a target URL.
 * Returns results from all APIs — each independently succeeds or falls back.
 * @param {string} targetUrl
 * @returns {Promise<object>} aggregated API results
 */
async function runSecurityAPIChecks(targetUrl) {
  const hostname = targetUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const domain = hostname.split('.').slice(-2).join('.');

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