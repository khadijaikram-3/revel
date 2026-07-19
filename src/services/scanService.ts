/**
 * Frontend scan service — orchestrates scan lifecycle:
 * 1. POST /api/scan to start the scan
 * 2. Poll GET /api/scan-status until status is "analyzing" or "complete"
 * 3. POST /api/report to generate AI reports
 * 4. Return the complete scan data
 */

import type { ScanData, ExecutiveReport, TechnicalReport } from '../types/scan';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

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
  const response = await fetch(`${API_BASE}/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: targetUrl }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Failed to start scan (${response.status})`);
  }

  return response.json();
}

/**
 * Get the current status of a scan.
 * @param scanId
 * @returns scan data including status, results, and reports
 */
export async function getScanStatus(scanId: string): Promise<ScanData> {
  const response = await fetch(`${API_BASE}/scan-status?scanId=${encodeURIComponent(scanId)}`);

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Failed to fetch scan status (${response.status})`);
  }

  return response.json();
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
  const response = await fetch(`${API_BASE}/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scanId }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Failed to generate report (${response.status})`);
  }

  return response.json();
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

  return new Promise((resolve, reject) => {
    const poll = async () => {
      if (Date.now() - startTime > timeoutMs) {
        reject(new Error('Scan timed out'));
        return;
      }

      try {
        const data = await getScanStatus(scanId);
        onUpdate(data);

        if (data.status === 'complete') {
          resolve(data);
          return;
        }

        if (data.status === 'failed') {
          reject(new Error('Scan failed'));
          return;
        }

        setTimeout(poll, intervalMs);
      } catch (error) {
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
  onProgress?: (status: string) => void
): Promise<ScanData> {
  onProgress?.('pending');
  const { scanId } = await startScan(targetUrl);

  onProgress?.('scanning');
  const scanData = await pollScanStatus(scanId, (data) => {
    onProgress?.(data.status);
  });

  if (scanData.status === 'analyzing' && !scanData.executiveReport) {
    onProgress?.('analyzing');
    const { executiveReport, technicalReport } = await generateReports(scanId);
    scanData.executiveReport = executiveReport;
    scanData.technicalReport = technicalReport;
  }

  onProgress?.('complete');
  return scanData;
}
