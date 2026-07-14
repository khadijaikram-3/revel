/**
 * Mock security scan data — used as fallback when external APIs are
 * unavailable or rate-limited. Ensures the app always returns results.
 */

const mockVulnerabilities = [
  {
    id: 1,
    title: 'SQL Injection Detected',
    severity: 'Critical',
    cvss: 9.8,
    cve: 'CVE-2024-1234',
    owasp: 'A03:2021 - Injection',
    description: 'SQL injection vulnerability detected in the login endpoint. Attackers can bypass authentication and extract database contents by injecting malicious SQL via the username parameter.',
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
    description: 'Critical security headers (Content-Security-Policy, Strict-Transport-Security, X-Frame-Options) are missing from HTTP responses.',
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
    description: 'MySQL port 3306 is exposed to the public internet, allowing unauthorized connection attempts.',
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
    description: 'The Server header exposes exact version information (Apache/2.4.41), aiding attackers in targeting known vulnerabilities.',
    evidence: `$ curl -sI https://{target}\nServer: Apache/2.4.41 (Ubuntu)`,
    reproduction: `curl -sI https://{target} | grep -i server`,
    remediation: `# Nginx\nserver_tokens off;\n# Apache\nServerTokens Prod\nServerSignature Off`,
    references: [
      { label: 'OWASP A06:2021', url: 'https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/' },
      { label: 'CWE-200', url: 'https://cwe.mitre.org/data/definitions/200.html' },
    ],
  },
];

export function generateMockScanData(targetUrl) {
  const hostname = targetUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const vulnerabilities = mockVulnerabilities.map((v) => ({
    ...v,
    evidence: v.evidence.replace(/\{target\}/g, hostname),
    reproduction: v.reproduction.replace(/\{target\}/g, hostname),
  }));

  const counts = vulnerabilities.reduce(
    (acc, v) => { acc[v.severity] = (acc[v.severity] || 0) + 1; return acc; },
    { Critical: 0, High: 0, Medium: 0, Low: 0 }
  );

  return {
    vulnerabilities,
    riskScore: 72,
    riskLevel: 'High',
    summary: { total: vulnerabilities.length, ...counts },
  };
}

export { mockVulnerabilities };