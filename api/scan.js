/**
 * @api {post} /api/scan Start a security scan
 * @apiBody {string} url Target URL to scan
 * @apiSuccess {string} scanId UUID of the created scan
 * @apiSuccess {string} status "pending"
 */
import { createScan, updateScan } from './lib/scanStore.js';
import { runSecurityAPIChecks } from './lib/securityApis.js';
import { generateMockScanData } from './lib/mockData.js';

export default async function handler(req, res) {
  console.log('\n========== /api/scan START ==========');

  if (req.method !== 'POST') {
    console.log('[scan] Rejected: method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url: targetUrl } = req.body || {};
    console.log('[scan] URL received:', targetUrl);

    if (!targetUrl || typeof targetUrl !== 'string') {
      console.log('[scan] Rejected: URL missing or invalid type');
      return res.status(400).json({ error: 'URL is required' });
    }

    let parsed;
    try {
      parsed = new URL(targetUrl);
      console.log('[scan] URL parsed OK — protocol:', parsed.protocol, 'host:', parsed.hostname);
    } catch {
      console.log('[scan] URL validation failed — invalid format');
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      console.log('[scan] Rejected: unsupported protocol:', parsed.protocol);
      return res.status(400).json({ error: 'URL must use http or https protocol' });
    }

    const groqKey = process.env.GROQ_API_KEY;
    const vtKey = process.env.VIRUSTOTAL_API_KEY;
    const shodanKey = process.env.SHODAN_API_KEY;

    console.log('[scan] GROQ_API_KEY:', groqKey ? `${groqKey.substring(0, 8)}...` : 'NOT SET');
    console.log('[scan] VIRUSTOTAL_API_KEY:', vtKey ? `${vtKey.substring(0, 8)}...` : 'NOT SET');
    console.log('[scan] SHODAN_API_KEY:', shodanKey ? `${shodanKey.substring(0, 8)}...` : 'NOT SET');

    console.log('[scan] Creating scan record...');
    let scan;
    try {
      scan = await createScan({
        target_url: targetUrl,
        status: 'scanning',
      });
      console.log('[scan] Scan record created — scanId:', scan.id);
    } catch (dbErr) {
      console.error('[scan] ERROR creating scan record:', dbErr.message);
      throw new Error(`Failed to create scan: ${dbErr.message}`);
    }

    console.log('[scan] Starting async security API checks...');
    runSecurityAPIChecks(targetUrl)
      .then(async (apiResults) => {
        console.log('[scan] Security API results:');
        console.log('  - VirusTotal:', JSON.stringify(apiResults.virustotal?.status), apiResults.virustotal?.error || '');
        console.log('  - Shodan:', JSON.stringify(apiResults.shodan?.status), apiResults.shodan?.error || '');
        console.log('  - Shodan DNS:', JSON.stringify(apiResults.shodanDns?.status), apiResults.shodanDns?.error || '');

        const mockData = generateMockScanData(targetUrl);
        const scanData = {
          ...mockData,
          targetUrl,
          apiResults,
        };

        try {
          await updateScan(scan.id, {
            status: 'analyzing',
            risk_score: scanData.riskScore,
            risk_level: scanData.riskLevel,
            vulnerabilities: scanData.vulnerabilities,
            duration: '2m 34s',
          });
          console.log('[scan] Scan record updated to "analyzing" — scanId:', scan.id);
        } catch (updateErr) {
          console.error('[scan] ERROR updating scan to analyzing:', updateErr.message);
        }
      })
      .catch(async (err) => {
        console.error('[scan] ERROR in async security checks:', err.message);
        try {
          await updateScan(scan.id, {
            status: 'failed',
            duration: '0m 00s',
          });
          console.log('[scan] Scan marked as failed');
        } catch (updateErr) {
          console.error('[scan] ERROR marking scan as failed:', updateErr.message);
        }
      });

    console.log('[scan] Returning scanId to client:', scan.id);
    console.log('========== /api/scan END ==========\n');

    return res.status(200).json({
      scanId: scan.id,
      status: 'pending',
      targetUrl,
    });
  } catch (error) {
    console.error('[scan] FATAL ERROR:', error.message);
    console.error(error.stack);
    console.log('========== /api/scan END (ERROR) ==========\n');
    return res.status(500).json({ error: 'Failed to start scan', detail: error.message });
  }
}
