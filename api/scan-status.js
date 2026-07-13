/**
 * @api {get} /api/scan-status Get scan status by ID
 * @apiQuery {string} scanId UUID of the scan
 */
import { getScan } from './lib/supabaseServer.js';

export default async function handler(req, res) {
  console.log('\n========== /api/scan-status START ==========');

  if (req.method !== 'GET') {
    console.log('[scan-status] Rejected: method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const scanId = req.query.scanId;
    console.log('[scan-status] scanId:', scanId);

    if (!scanId) {
      console.log('[scan-status] Rejected: scanId missing');
      return res.status(400).json({ error: 'scanId query parameter is required' });
    }

    const scan = await getScan(scanId);
    console.log('[scan-status] Scan found:', !!scan, '— status:', scan?.status);

    if (!scan) {
      console.log('[scan-status] Scan not found');
      return res.status(404).json({ error: 'Scan not found' });
    }

    console.log('[scan-status] Returning status:', scan.status);
    console.log('========== /api/scan-status END ==========\n');

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
    console.error('[scan-status] FATAL ERROR:', error.message);
    console.error(error.stack);
    console.log('========== /api/scan-status END (ERROR) ==========\n');
    return res.status(500).json({ error: 'Failed to fetch scan status', detail: error.message });
  }
}
