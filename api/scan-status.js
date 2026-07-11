/**
 * @api {get} /api/scan-status Get scan status by ID
 * @apiQuery {string} scanId UUID of the scan
 * @apiSuccess {string} scanId
 * @apiSuccess {string} status pending|scanning|analyzing|complete|failed
 * @apiSuccess {object} data scan results (when complete)
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const scanId = req.query.scanId;
    if (!scanId) {
      return res.status(400).json({ error: 'scanId query parameter is required' });
    }

    const { getScan } = await import('./lib/supabaseServer.js');
    const scan = await getScan(scanId);

    if (!scan) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    return res.status(200).json({
      scanId: scan.id,
      status: scan.status,
      targetUrl: scan.target_url,
      riskScore: scan.risk_score,
      riskLevel: scan.risk_level,
      vulnerabilities: scan.vulnerabilities,
      executiveReport: scan.executive_report,
      technicalReport: scan.technical_report,
      duration: scan.duration,
      createdAt: scan.created_at,
      completedAt: scan.completed_at,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch scan status', detail: error.message });
  }
}