/**
 * @api {post} /api/report Generate AI reports from scan data
 * @apiBody {string} scanId UUID of the scan
 * @apiBody {object} scanData Optional — raw scan data if not stored in DB
 * @apiSuccess {object} executiveReport
 * @apiSuccess {object} technicalReport
 */
import { getScan, updateScan } from './lib/supabaseServer.js';
import { generateReports } from './lib/groq.js';

export default async function handler(req, res) {
  console.log('\n========== /api/report START ==========');

  if (req.method !== 'POST') {
    console.log('[report] Rejected: method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { scanId, scanData: providedScanData } = req.body || {};
    console.log('[report] scanId:', scanId);
    console.log('[report] providedScanData:', providedScanData ? 'yes' : 'no');

    if (!scanId) {
      console.log('[report] Rejected: scanId missing');
      return res.status(400).json({ error: 'scanId is required' });
    }

    // Log Groq API key status
    const groqKey = process.env.GROQ_API_KEY;
    console.log('[report] GROQ_API_KEY:', groqKey ? `${groqKey.substring(0, 8)}...` : 'NOT SET');

    // 1. Fetch scan from Supabase
    console.log('[report] Fetching scan from Supabase...');
    let scan;
    try {
      scan = await getScan(scanId);
      console.log('[report] Supabase scan fetched — status:', scan?.status, '— vulnerabilities:', scan?.vulnerabilities?.length || 0);
    } catch (dbErr) {
      console.error('[report] ERROR fetching scan from Supabase:', dbErr.message);
      throw new Error(`Database error: ${dbErr.message}`);
    }

    if (!scan) {
      console.log('[report] Scan not found for scanId:', scanId);
      return res.status(404).json({ error: 'Scan not found' });
    }

    // 2. Build scan data payload for Groq
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
    console.log('[report] Scan data prepared — targetUrl:', scanData.targetUrl, '— vuln count:', scanData.vulnerabilities?.length || 0);

    // 3. Call Groq AI to generate reports
    console.log('[report] Calling Groq AI to generate reports...');
    let executive, technical;
    try {
      const result = await generateReports(scanData);
      executive = result.executive;
      technical = result.technical;
      console.log('[report] Groq response received:');
      console.log('  - Executive report source:', executive?.source);
      console.log('  - Executive riskScore:', executive?.riskScore);
      console.log('  - Technical report source:', technical?.source);
      console.log('  - Technical riskScore:', technical?.riskScore);
      console.log('  - Technical vulnerabilities:', technical?.vulnerabilities?.length || 0);
    } catch (groqErr) {
      console.error('[report] ERROR calling Groq:', groqErr.message);
      throw new Error(`Groq API error: ${groqErr.message}`);
    }

    // 4. Save reports to Supabase
    console.log('[report] Saving reports to Supabase...');
    try {
      await updateScan(scan.id, {
        status: 'complete',
        executive_report: executive,
        technical_report: technical,
        completed_at: new Date().toISOString(),
      });
      console.log('[report] Reports saved to Supabase — scanId:', scan.id);
    } catch (updateErr) {
      console.error('[report] ERROR saving reports to Supabase:', updateErr.message);
      // Continue — we still return the reports to the client even if DB save fails
    }

    console.log('[report] Returning reports to client');
    console.log('========== /api/report END ==========\n');

    return res.status(200).json({
      scanId: scan.id,
      executiveReport: executive,
      technicalReport: technical,
    });
  } catch (error) {
    console.error('[report] FATAL ERROR:', error.message);
    console.error(error.stack);
    console.log('========== /api/report END (ERROR) ==========\n');
    return res.status(500).json({ error: 'Failed to generate report', detail: error.message });
  }
}
