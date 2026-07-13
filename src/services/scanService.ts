/**
 * Frontend scan service — orchestrates scan lifecycle:
 * 1. POST /api/scan to start the scan
 * 2. Poll GET /api/scan-status until status is "analyzing" or "complete"
 * 3. POST /api/report to generate AI reports
 * 4. Return the complete scan data
 */

import type { ScanData, ExecutiveReport, TechnicalReport } from '../types/scan';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

console.log('[scanService] API_BASE:', API_BASE);

/**
 * Start a new security scan.
 * @param targetUrl — the URL to scan
 * @returns { scanId, status, targetUrl }
 */
export async function startScan(targetUrl: string): Promise<{
  scanId: string;
  status: string;
  targetUrl: string;
}> {
  console.log('[scanService] startScan — url:', targetUrl, '— endpoint:', `${API_BASE}/scan`);

  const response = await fetch(`${API_BASE}/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: targetUrl }),
  });

  console.log('[scanService] startScan — response status:', response.status);

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    console.error('[scanService] startScan failed:', err);
    throw new Error(err.error || `Failed to start scan (${response.status})`);
  }

  const data = await response.json();
  console.log('[scanService] startScan — scanId:', data.scanId, '— status:', data.status);
  return data;
}

/**
 * Get the current status of a scan.
 * @param scanId
 * @returns scan data including status, results, and reports
 */
export async function getScanStatus(scanId: string): Promise<ScanData> {
  const endpoint = `${API_BASE}/scan-status?scanId=${encodeURIComponent(scanId)}`;
  console.log('[scanService] getScanStatus — endpoint:', endpoint);

  const response = await fetch(endpoint);

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    console.error('[scanService] getScanStatus failed:', response.status, err);
    throw new Error(err.error || `Failed to fetch scan status (${response.status})`);
  }

  const data = await response.json();
  console.log('[scanService] getScanStatus — status:', data.status, '— riskScore:', data.riskScore);
  return data;
}

/**
 * Generate AI reports for a completed scan.
 * @param scanId
 * @returns { executiveReport, technicalReport }
 */
export async function generateReports(scanId: string): Promise<{
  executiveReport: ExecutiveReport;
  technicalReport: TechnicalReport;
}> {
  console.log('[scanService] generateReports — scanId:', scanId);

  const response = await fetch(`${API_BASE}/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scanId }),
  });

  console.log('[scanService] generateReports — response status:', response.status);

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    console.error('[scanService] generateReports failed:', err);
    throw new Error(err.error || `Failed to generate report (${response.status})`);
  }

  const data = await response.json();
  console.log('[scanService] generateReports — exec source:', data.executiveReport?.source, '— tech source:', data.technicalReport?.source);
  return data;
}

/**
 * Poll scan status at a fixed interval until it reaches a terminal state
 * or the timeout expires.
 * @param scanId
 * @param onUpdate — callback invoked on each status update
 * @param intervalMs — polling interval (default 2000ms)
 * @param timeoutMs — max wait time (default 120000ms = 2 min)
 * @returns final scan data
 */
export async function pollScanStatus(
  scanId: string,
  onUpdate: (data: ScanData) => void,
  intervalMs = 2000,
  timeoutMs = 120000
): Promise<ScanData> {
  const startTime = Date.now();
  let pollCount = 0;

  return new Promise((resolve, reject) => {
    const poll = async () => {
      pollCount++;
      const elapsed = Date.now() - startTime;
      console.log(`[scanService] poll #${pollCount} — elapsed: ${elapsed}ms`);

      if (Date.now() - startTime > timeoutMs) {
        console.error('[scanService] Poll timed out after', timeoutMs, 'ms');
        reject(new Error('Scan timed out'));
        return;
      }

      try {
        const data = await getScanStatus(scanId);
        onUpdate(data);

        if (data.status === 'complete') {
          console.log('[scanService] Poll resolved — status: complete');
          resolve(data);
          return;
        }

        if (data.status === 'failed') {
          console.error('[scanService] Poll rejected — status: failed');
          reject(new Error('Scan failed'));
          return;
        }

        if (data.status === 'analyzing') {
          console.log('[scanService] Poll resolved — status: analyzing (ready for reports)');
          resolve(data);
          return;
        }

        setTimeout(poll, intervalMs);
      } catch (error) {
        console.error('[scanService] Poll error:', error);
        reject(error);
      }
    };

    poll();
  });
}

/**
 * Full scan lifecycle: start scan, poll until analyzing, generate reports.
 * @param targetUrl
 * @param onProgress — callback for status updates
 * @returns complete scan data with reports
 */
export async function runFullScan(
  targetUrl: string,
  externalProgress?: (status: string) => void
): Promise<ScanData> {
  console.log('[scanService] runFullScan — url:', targetUrl);
  externalProgress?.('pending');
  const { scanId } = await startScan(targetUrl);

  externalProgress?.('scanning');
  const scanData = await pollScanStatus(scanId, (data) => {
    externalProgress?.(data.status);
  });

  if (scanData.status === 'analyzing' && !scanData.executiveReport) {
    externalProgress?.('analyzing');
    const { executiveReport, technicalReport } = await generateReports(scanId);
    scanData.executiveReport = executiveReport;
    scanData.technicalReport = technicalReport;
  }

  externalProgress?.('complete');
  return scanData;
}
