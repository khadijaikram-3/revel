/**
 * Frontend scan service — orchestrates scan lifecycle:
 * 1. POST /api/scan to start the scan
 * 2. Poll GET /api/scan-status until status is "complete"
 * 3. POST /api/report to generate AI reports if needed
 */

import type { ScanData, ExecutiveReport, TechnicalReport, Vulnerability } from '../types/scan';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';
const API_TIMEOUT_MS = 120000;

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = API_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

/**
 * Start a new security scan.
 */
export async function startScan(targetUrl: string): Promise<{
  scanId: string;
  status: string;
  targetUrl: string;
}> {
  const response = await fetchWithTimeout(`${API_BASE}/scan`, {
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
 */
export async function getScanStatus(scanId: string): Promise<ScanData> {
  const response = await fetchWithTimeout(`${API_BASE}/scan-status?scanId=${encodeURIComponent(scanId)}`);

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Failed to fetch scan status (${response.status})`);
  }

  return response.json();
}

/**
 * Generate AI reports for a completed scan.
 */
export async function generateReports(scanId: string): Promise<{
  executiveReport: ExecutiveReport;
  technicalReport: TechnicalReport;
}> {
  const response = await fetchWithTimeout(`${API_BASE}/report`, {
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
 * Full scan lifecycle: start scan, poll until complete, generate reports.
 */
export async function runFullScan(
  targetUrl: string,
  onProgress?: (status: string) => void
): Promise<ScanData> {
  onProgress?.('pending');
  try {
    const { scanId } = await startScan(targetUrl);

    onProgress?.('scanning');
    const scanData = await pollScanStatus(scanId, (data) => {
      onProgress?.(data.status);
    });

    if (!scanData.executiveReport) {
      onProgress?.('analyzing');
      try {
        const { executiveReport, technicalReport } = await generateReports(scanId);
        scanData.executiveReport = executiveReport;
        scanData.technicalReport = technicalReport;
      } catch (reportErr) {
        console.error('[scanService] Report generation failed, using scan data only:', reportErr);
      }
    }

    onProgress?.('complete');
    return scanData;
  } catch (err) {
  console.error('[scanService] Scan failed:', err);
  throw err;
}
}