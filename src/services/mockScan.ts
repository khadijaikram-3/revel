/**
 * Frontend mock scan service — simulates a full security scan entirely
 * client-side so the app works without a backend API.
 *
 * Returns realistic ScanData (vulnerabilities, risk score, executive &
 * technical reports) matching the types consumed by the report pages.
 */

import type {
  ScanData,
  Vulnerability,
  ExecutiveReport,
  TechnicalReport,
  Severity,
} from '../types/scan';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function buildVulnerabilities(hostname: string): Vulnerability[] {
  const target = hostname;
  return [
    {
      id: 1,
      title: 'SQL Injection Detected',
      severity: 'Critical' as Severity,
      cvss: 9.8,
      cve: 'CVE-2024-1234',
      owasp: 'A03:2021 - Injection',
      description:
        'SQL injection vulnerability detected in the login endpoint. Attackers can bypass authentication and extract database contents by injecting malicious SQL via the username parameter.',
      evidence: `POST /login HTTP/1.1\nHost: ${target}\nContent-Type: application/x-www-form-urlencoded\n\nusername=' OR '1'='1'&password=test`,
      reproduction: `curl -X POST https://${target}/login -d "username=' OR '1'='1'&password=test"`,
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
      severity: 'High' as Severity,
      cvss: 7.5,
      cve: 'N/A',
      owasp: 'A05:2021 - Security Misconfiguration',
      description:
        'Critical security headers (Content-Security-Policy, Strict-Transport-Security, X-Frame-Options) are missing from HTTP responses, leaving the site exposed to clickjacking, MIME-sniffing, and downgrade attacks.',
      evidence: `HTTP/1.1 200 OK\nServer: Apache/2.4.41\n\n[Missing: Content-Security-Policy]\n[Missing: Strict-Transport-Security]\n[Missing: X-Frame-Options]`,
      reproduction: `curl -sI https://${target} | grep -iE "content-security-policy|strict-transport|x-frame"`,
      remediation: `# Apache .htaccess\nHeader always set Content-Security-Policy "default-src 'self'"\nHeader always set Strict-Transport-Security "max-age=31536000"\nHeader always set X-Frame-Options "SAMEORIGIN"`,
      references: [
        { label: 'OWASP A05:2021', url: 'https://owasp.org/Top10/A05_2021-Security_Misconfiguration/' },
        { label: 'CWE-693', url: 'https://cwe.mitre.org/data/definitions/693.html' },
      ],
    },
    {
      id: 3,
      title: 'Open Port 3306 (MySQL)',
      severity: 'Medium' as Severity,
      cvss: 5.4,
      cve: 'N/A',
      owasp: 'A05:2021 - Security Misconfiguration',
      description:
        'MySQL port 3306 is exposed to the public internet, allowing unauthorized connection attempts and brute-force attacks against the database service.',
      evidence: `$ nmap -p 3306 ${target}\nPORT     STATE SERVICE\n3306/tcp open  mysql`,
      reproduction: `nmap -p 3306 -sV ${target}`,
      remediation: `ufw deny 3306\nufw reload\n# Bind MySQL to localhost\nbind-address = 127.0.0.1`,
      references: [
        { label: 'OWASP A05:2021', url: 'https://owasp.org/Top10/A05_2021-Security_Misconfiguration/' },
        { label: 'CWE-668', url: 'https://cwe.mitre.org/data/definitions/668.html' },
      ],
    },
    {
      id: 4,
      title: 'Outdated Server Header',
      severity: 'Low' as Severity,
      cvss: 3.1,
      cve: 'N/A',
      owasp: 'A06:2021 - Vulnerable and Outdated Components',
      description:
        'The Server header exposes exact version information (Apache/2.4.41), aiding attackers in targeting known vulnerabilities for that specific version.',
      evidence: `$ curl -sI https://${target}\nServer: Apache/2.4.41 (Ubuntu)`,
      reproduction: `curl -sI https://${target} | grep -i server`,
      remediation: `# Nginx\nserver_tokens off;\n# Apache\nServerTokens Prod\nServerSignature Off`,
      references: [
        { label: 'OWASP A06:2021', url: 'https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/' },
        { label: 'CWE-200', url: 'https://cwe.mitre.org/data/definitions/200.html' },
      ],
    },
  ];
}

function buildExecutiveReport(
  targetUrl: string,
  vulnerabilities: Vulnerability[],
  riskScore: number,
  riskLevel: string
): ExecutiveReport {
  const counts = {
    critical: vulnerabilities.filter((v) => v.severity === 'Critical').length,
    high: vulnerabilities.filter((v) => v.severity === 'High').length,
    medium: vulnerabilities.filter((v) => v.severity === 'Medium').length,
    low: vulnerabilities.filter((v) => v.severity === 'Low').length,
  };

  return {
    source: 'mock',
    riskScore,
    riskLevel,
    executiveSummary: `This report summarizes the findings of an external security assessment of ${targetUrl}. The assessment identified ${vulnerabilities.length} vulnerabilities that could impact business operations, customer trust, and regulatory compliance. The most critical finding is a SQL injection vulnerability in the login endpoint (CVSS 9.8) that enables authentication bypass and full database extraction. Immediate remediation is required for all critical and high severity findings.`,
    businessImpacts: [
      {
        title: 'Customer Data Exposure',
        description:
          'Attackers could steal customer information through SQL injection, leading to privacy violations, regulatory fines, and loss of customer trust.',
      },
      {
        title: 'Operational Disruption',
        description:
          'Exploitation of exposed database ports could cause service outages, data corruption, and significant downtime affecting revenue.',
      },
      {
        title: 'Reputational Damage',
        description:
          'Public disclosure of these vulnerabilities could severely harm your brand image and competitive position in the market.',
      },
    ],
    priorityFixes: [
      {
        number: '01',
        title: 'Patch SQL injection in login endpoint',
        description: 'Replace raw SQL queries with parameterized prepared statements immediately.',
        severity: 'Critical',
      },
      {
        number: '02',
        title: 'Add missing security headers',
        description: 'Configure CSP, HSTS, and X-Frame-Options in your web server config.',
        severity: 'High',
      },
      {
        number: '03',
        title: 'Close external MySQL port 3306',
        description: 'Block public access and bind MySQL to localhost only.',
        severity: 'Medium',
      },
      {
        number: '04',
        title: 'Hide server version information',
        description: 'Disable server_tokens / ServerTokens to prevent version fingerprinting.',
        severity: 'Low',
      },
    ],
    vulnerabilityCounts: counts,
  };
}

function buildTechnicalReport(
  targetUrl: string,
  vulnerabilities: Vulnerability[],
  riskScore: number,
  riskLevel: string
): TechnicalReport {
  return {
    source: 'mock',
    riskScore,
    riskLevel,
    executiveSummary: `An external security assessment of ${targetUrl} identified ${vulnerabilities.length} vulnerabilities across multiple severity levels. The most critical finding is a SQL injection in the login endpoint (CVSS 9.8) enabling authentication bypass and data exfiltration. Additional findings include missing security headers, an exposed MySQL port, and server version disclosure. Immediate remediation is required for all critical and high severity items.`,
    vulnerabilities,
    summaryTable: vulnerabilities.map((v) => ({
      severity: v.severity,
      vulnerability: v.title,
      cvss: v.cvss,
      status: 'Open',
    })),
  };
}

function hostnameFromUrl(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  }
}

/**
 * Run a simulated scan. Calls onProgress with status strings so the UI
 * can show live progress. Resolves to full ScanData after ~4 seconds.
 */
export async function runMockScan(
  targetUrl: string,
  onProgress?: (status: string, progressPercent: number) => void
): Promise<ScanData> {
  const hostname = hostnameFromUrl(targetUrl);
  const vulnerabilities = buildVulnerabilities(hostname);
  const riskScore = 72;
  const riskLevel = 'High';

  onProgress?.('pending', 5);
  await wait(600);

  onProgress?.('scanning', 25);
  await wait(1000);

  onProgress?.('scanning', 50);
  await wait(1000);

  onProgress?.('analyzing', 75);
  await wait(800);

  onProgress?.('analyzing', 90);
  await wait(600);

  const executiveReport = buildExecutiveReport(targetUrl, vulnerabilities, riskScore, riskLevel);
  const technicalReport = buildTechnicalReport(targetUrl, vulnerabilities, riskScore, riskLevel);

  const now = new Date().toISOString();
  return {
    scanId: `mock-${Date.now()}`,
    status: 'complete',
    targetUrl,
    riskScore,
    riskLevel,
    vulnerabilities,
    executiveReport,
    technicalReport,
    duration: '4.0s',
    createdAt: now,
    completedAt: now,
  };
}
