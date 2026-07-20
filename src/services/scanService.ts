/**
 * Frontend scan service — orchestrates scan lifecycle:
 * 1. POST /api/scan to start the scan
 * 2. Poll GET /api/scan-status until status is "complete"
 * 3. POST /api/report to generate AI reports if needed
 * 4. Fall back to mock data if the API is unreachable
 */

import type { ScanData, ExecutiveReport, TechnicalReport, Vulnerability } from '../types/scan';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';
const API_TIMEOUT_MS = 8000;

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
 * Falls back to mock data if the API is unreachable.
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
    console.error('[scanService] API scan failed, falling back to mock data:', err);
    onProgress?.('mock');
    return generateMockScanData(targetUrl);
  }
}

/* ------------------------------------------------------------------ */
/* Mock fallback (frontend) — used when the API is unreachable.        */
/* ------------------------------------------------------------------ */

const mockVulnerabilities: Vulnerability[] = [
  {
    id: 1,
    title: 'SQL Injection Detected',
    severity: 'Critical',
    cvss: 9.8,
    cve: 'CVE-2024-1234',
    owasp: 'A03:2021 - Injection',
    description:
      'SQL injection vulnerability detected in the login endpoint. Attackers can bypass authentication and extract database contents by injecting malicious SQL via the username parameter.',
    evidence: `POST /login HTTP/1.1\nHost: {target}\nContent-Type: application/x-www-form-urlencoded\n\nusername=' OR '1'='1'&password=test`,
    reproduction: `curl -X POST https://{target}/login -d "username=' OR '1'='1'&password=test"`,
    remediation: `Use parameterized queries:\n$stmt = $conn->prepare("SELECT * FROM users WHERE username = ?");\n$stmt->bind_param("s", $username);\n$stmt->execute();`,
    references: [
      { label: 'CVE-2024-1234', url: 'https://nvd.nist.gov/vuln/detail/CVE-2024-1234' },
      { label: 'OWASP A03:2021', url: 'https://owasp.org/Top10/A03_2021-Injection/' },
      { label: 'CWE-89', url: 'https://cwe.mitre.org/data/definitions/89.html' },
    ],
  },
  {
    id: 2,
    title: 'Missing Security Headers',
    severity: 'High',
    cvss: 7.5,
    cve: 'N/A',
    owasp: 'A05:2021 - Security Misconfiguration',
    description:
      'Critical security headers (Content-Security-Policy, Strict-Transport-Security, X-Frame-Options) are missing from HTTP responses.',
    evidence: `HTTP/1.1 200 OK\nServer: Apache/2.4.41\n\n[Missing: Content-Security-Policy]\n[Missing: Strict-Transport-Security]\n[Missing: X-Frame-Options]`,
    reproduction: `curl -sI https://{target} | grep -iE "content-security-policy|strict-transport|x-frame"`,
    remediation: `# Apache .htaccess\nHeader always set Content-Security-Policy "default-src 'self'"\nHeader always set Strict-Transport-Security "max-age=31536000"\nHeader always set X-Frame-Options "SAMEORIGIN"`,
    references: [
      { label: 'OWASP A05:2021', url: 'https://owasp.org/Top10/A05_2021-Security_Misconfiguration/' },
      { label: 'CWE-693', url: 'https://cwe.mitre.org/data/definitions/693.html' },
    ],
  },
  {
    id: 3,
    title: 'Open Port 3306 (MySQL)',
    severity: 'Medium',
    cvss: 5.4,
    cve: 'N/A',
    owasp: 'A05:2021 - Security Misconfiguration',
    description:
      'MySQL port 3306 is exposed to the public internet, allowing unauthorized connection attempts.',
    evidence: `$ nmap -p 3306 {target}\nPORT     STATE SERVICE\n3306/tcp open  mysql`,
    reproduction: `nmap -p 3306 -sV {target}`,
    remediation: `ufw deny 3306\nufw reload\n# Bind MySQL to localhost\nbind-address = 127.0.0.1`,
    references: [
      { label: 'OWASP A05:2021', url: 'https://owasp.org/Top10/A05_2021-Security_Misconfiguration/' },
      { label: 'CWE-668', url: 'https://cwe.mitre.org/data/definitions/668.html' },
    ],
  },
  {
    id: 4,
    title: 'Outdated Server Header',
    severity: 'Low',
    cvss: 3.1,
    cve: 'N/A',
    owasp: 'A06:2021 - Vulnerable and Outdated Components',
    description:
      'The Server header exposes exact version information (Apache/2.4.41), aiding attackers in targeting known vulnerabilities.',
    evidence: `$ curl -sI https://{target}\nServer: Apache/2.4.41 (Ubuntu)`,
    reproduction: `curl -sI https://{target} | grep -i server`,
    remediation: `# Nginx\nserver_tokens off;\n# Apache\nServerTokens Prod\nServerSignature Off`,
    references: [
      { label: 'OWASP A06:2021', url: 'https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/' },
      { label: 'CWE-200', url: 'https://cwe.mitre.org/data/definitions/200.html' },
    ],
  },
];

function generateMockScanData(targetUrl: string): ScanData {
  const hostname = targetUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const vulnerabilities = mockVulnerabilities.map((v) => ({
    ...v,
    evidence: v.evidence.replace(/\{target\}/g, hostname),
    reproduction: v.reproduction.replace(/\{target\}/g, hostname),
  }));

  const counts = {
    critical: vulnerabilities.filter((v) => v.severity === 'Critical').length,
    high: vulnerabilities.filter((v) => v.severity === 'High').length,
    medium: vulnerabilities.filter((v) => v.severity === 'Medium').length,
    low: vulnerabilities.filter((v) => v.severity === 'Low').length,
  };

  const executiveReport: ExecutiveReport = {
    source: 'mock',
    riskScore: 72,
    riskLevel: 'High',
    executiveSummary: `This report summarizes the findings of an external security assessment of ${targetUrl}. The assessment identified ${vulnerabilities.length} vulnerabilities that could impact business operations, customer trust, and regulatory compliance. Immediate action is recommended for critical findings.`,
    businessImpacts: [
      { title: 'Customer Data Exposure', description: 'Attackers could steal customer information, leading to privacy violations and loss of trust.' },
      { title: 'Operational Disruption', description: 'Exploitation could cause service outages, affecting revenue and user experience.' },
      { title: 'Reputational Damage', description: 'Public disclosure of vulnerabilities could harm your brand image.' },
    ],
    priorityFixes: [
      { number: '01', title: 'Close database port 3306', description: 'Contact your hosting provider to block external access.', severity: 'Critical' },
      { number: '02', title: 'Enable HTTPS', description: 'Install an SSL certificate to encrypt user data.', severity: 'Critical' },
      { number: '03', title: 'Add authentication to admin panel', description: 'Require strong passwords and multi-factor authentication.', severity: 'High' },
      { number: '04', title: 'Update security headers', description: 'Add CSP, HSTS, and X-Frame-Options.', severity: 'Medium' },
      { number: '05', title: 'Update outdated frameworks', description: 'Run a security update on all dependencies.', severity: 'Medium' },
    ],
    vulnerabilityCounts: counts,
  };

  const technicalReport: TechnicalReport = {
    source: 'mock',
    riskScore: 72,
    riskLevel: 'High',
    executiveSummary: `An external security assessment of ${targetUrl} identified ${vulnerabilities.length} vulnerabilities across multiple severity levels. The most critical finding is a SQL injection in the login endpoint (CVSS 9.8) enabling authentication bypass and data exfiltration. Immediate remediation is required.`,
    vulnerabilities,
    summaryTable: vulnerabilities.map((v) => ({
      severity: v.severity,
      vulnerability: v.title,
      cvss: v.cvss,
      status: 'Open',
    })),
  };

  return {
    scanId: `mock-${Date.now()}`,
    status: 'complete',
    targetUrl,
    riskScore: 72,
    riskLevel: 'High',
    vulnerabilities,
    executiveReport,
    technicalReport,
    duration: 'N/A',
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };
}
