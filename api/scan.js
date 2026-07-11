/**
 * @api {post} /api/scan Start a security scan
 * @apiBody {string} url Target URL to scan
 * @apiSuccess {string} scanId UUID of the created scan
 * @apiSuccess {string} status "pending"
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url: targetUrl } = req.body || {};

    if (!targetUrl || typeof targetUrl !== 'string') {
      return res.status(400).json({ error: 'URL is required' });
    }

    let parsed;
    try {
      parsed = new URL(targetUrl);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return res.status(400).json({ error: 'URL must use http or https protocol' });
    }

    const { createScan } = await import('./lib/supabaseServer.js');
    const { runSecurityAPIChecks } = await import('./lib/securityApis.js');
    const { generateMockScanData } = await import('./lib/mockData.js');

    const scan = await createScan({
      target_url: targetUrl,
      status: 'scanning',
    });

    runSecurityAPIChecks(targetUrl)
      .then(async (apiResults) => {
        const mockData = generateMockScanData(targetUrl);
        const scanData = {
          ...mockData,
          targetUrl,
          apiResults,
        };

        const { updateScan } = await import('./lib/supabaseServer.js');
        await updateScan(scan.id, {
          status: 'analyzing',
          risk_score: scanData.riskScore,
          risk_level: scanData.riskLevel,
          vulnerabilities: scanData.vulnerabilities,
          duration: '2m 34s',
        });
      })
      .catch(async (err) => {
        const { updateScan } = await import('./lib/supabaseServer.js');
        await updateScan(scan.id, {
          status: 'failed',
          duration: '0m 00s',
        });
      });

    return res.status(200).json({
      scanId: scan.id,
      status: 'pending',
      targetUrl,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to start scan', detail: error.message });
  }
}