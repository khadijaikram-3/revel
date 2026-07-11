/**
 * Security API integrations — VirusTotal, Shodan, SecurityTrails.
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
 * Scan open ports via Shodan.
 * @param {string} ipOrHost
 * @returns {Promise<object>} port data
 */
async function checkShodan(ipOrHost) {
  const apiKey = process.env.SHODAN_API_KEY;
  if (!apiKey) return { source: 'shodan', status: 'skipped', data: null };

  try {
    const response = await axios.get(
      `https://api.shodan.io/shodan/host/${ipOrHost}?key=${apiKey}`,
      { timeout: 10000 }
    );
    return {
      source: 'shodan',
      status: 'success',
      data: {
        ports: response.data?.ports || [],
        hostnames: response.data?.hostnames || [],
        org: response.data?.org || 'Unknown',
      },
    };
  } catch (error) {
    return { source: 'shodan', status: 'error', error: error.message, data: null };
  }
}

/**
 * Get DNS and subdomain info via SecurityTrails.
 * @param {string} domain
 * @returns {Promise<object>} DNS data
 */
async function checkSecurityTrails(domain) {
  const apiKey = process.env.SECURITYTRAILS_API_KEY;
  if (!apiKey) return { source: 'securitytrails', status: 'skipped', data: null };

  try {
    const response = await axios.get(
      `https://api.securitytrails.com/v1/domain/${domain}`,
      { headers: { APIKEY: apiKey }, timeout: 10000 }
    );
    return {
      source: 'securitytrails',
      status: 'success',
      data: {
        subdomains: response.data?.subdomains?.length || 0,
        dns: response.data?.current_dns || {},
      },
    };
  } catch (error) {
    return { source: 'securitytrails', status: 'error', error: error.message, data: null };
  }
}

/**
 * Run all security API checks for a target URL.
 * Returns results from all three APIs — each independently succeeds or falls back.
 * @param {string} targetUrl
 * @returns {Promise<object>} aggregated API results
 */
async function runSecurityAPIChecks(targetUrl) {
  const hostname = targetUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const domain = hostname.split('.').slice(-2).join('.');

  const [virustotal, shodan, securitytrails] = await Promise.allSettled([
    checkVirusTotal(targetUrl),
    checkShodan(hostname),
    checkSecurityTrails(domain),
  ]);

  return {
    virustotal: virustotal.status === 'fulfilled' ? virustotal.value : { source: 'virustotal', status: 'error', data: null },
    shodan: shodan.status === 'fulfilled' ? shodan.value : { source: 'shodan', status: 'error', data: null },
    securitytrails: securitytrails.status === 'fulfilled' ? securitytrails.value : { source: 'securitytrails', status: 'error', data: null },
  };
}

module.exports = { runSecurityAPIChecks, checkVirusTotal, checkShodan, checkSecurityTrails };