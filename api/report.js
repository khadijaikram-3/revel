/**
 * @api {post} /api/report Generate AI reports from scan data
 * @apiBody {string} scanId UUID of the scan
 * @apiBody {object} scanData Optional — raw scan data if not stored in DB
 * @apiSuccess {object} executiveReport
 * @apiSuccess {object} technicalReport
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { scanId, scanData: providedScanData } = req.body || {};

    if (!scanId) {
      return res.status(400).json({ error: 'scanId is required' });
    }

    const { getScan, updateScan } = await import('./lib/supabaseServer.js');
    const { generateReports } = await import('./lib/groq.js');

    const scan = await getScan(scanId);
    if (!scan) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    const scanData = providedScanData || {
      targetUrl: scan.target_url,
      vulnerabilities: scan.vulnerabilities || [],
      riskScore: scan.risk_score,
      riskLevel: scan.risk_level,
      summary: (scan.vulnerabilities || []).reduce(
        (acc, v) => {
          acc[v.severity] = (acc[v.severity] || 0) + 1;
          return acc;
        },
        { Critical: 0, High: 0, Medium: 0, Low: 0 }
      ),
    };

    const { executive, technical } = await generateReports(scanData);

    await updateScan(scan.id, {
      status: 'complete',
      executive_report: executive,
      technical_report: technical,
      completed_at: new Date().toISOString(),
    });

    return res.status(200).json({
      scanId: scan.id,
      executiveReport: executive,
      technicalReport: technical,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate report', detail: error.message });
  }
}