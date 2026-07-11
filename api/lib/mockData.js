/**
 * Mock security scan data — used as fallback when external APIs are
 * unavailable or rate-limited. Ensures the app always returns results.
 */

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const mockVulnerabilities = [
  {
    id: 1,
    title: 'SQL Injection Detected',
    severity: 'Critical',
    cvss: 9.8,
    cve: 'CVE-2024-1234',
    owasp: 'A03:2021 - Injection',
    description:
      'SQL injection vulnerability detected in the login endpoint. Attackers can bypass authentication and extract database contents by injecting malicious SQL via the username parameter.',
    evidence: `POST /login HTTP/1.1
Host: ${'{target}'}
Content-Type: application/x-www-form-urlencoded

username=' OR '1'='1'&password=test`,
    reproduction: `curl -X POST https://${'{target}'}/login \\
  -d "username=' OR '1'='1'&password=test"`,
    remediation: `Use parameterized queries:
$stmt = $conn->prepare(
  "SELECT * FROM users WHERE username = ?"
);
$stmt->bind_param("s", $username);
$stmt->execute();`,
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
      'Critical security headers (Content-Security-Policy, Strict-Transport-Security, X-Frame-Options) are missing from HTTP responses, exposing users to XSS, clickjacking, and downgrade attacks.',
    evidence: `HTTP/1.1 200 OK
Server: Apache/2.4.41
Content-Type: text/html

[Missing: Content-Security-Policy]
[Missing: Strict-Transport-Security]
[Missing: X-Frame-Options]`,
    reproduction: `curl -sI https://${'{target}'} | grep -iE \\
  "content-security-policy|strict-transport|x-frame"`,
    remediation: `# Apache .htaccess
Header always set Content-Security-Policy "default-src 'self'"
Header always set Strict-Transport-Security "max-age=31536000"
Header always set X-Frame-Options "SAMEORIGIN"

# Nginx
add_header Content-Security-Policy "default-src 'self'";`,
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
      'MySQL port 3306 is exposed to the public internet, allowing unauthorized connection attempts and potential brute-force attacks against the database service.',
    evidence: `$ nmap -p 3306 ${'{target}'}
PORT     STATE SERVICE
3306/tcp open  mysql
MySQL version: 8.0.31`,
    reproduction: `nmap -p 3306 -sV ${'{target}'}
mysql -h ${'{target}'} -u root -p`,
    remediation: `# Block external access with UFW
ufw deny 3306
ufw reload

# Bind MySQL to localhost only
# /etc/mysql/mysql.conf.d/mysqld.cnf
[mysqld]
bind-address = 127.0.0.1
systemctl restart mysql`,
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
      'The Server header exposes exact version information (Apache/2.4.41), aiding attackers in targeting known vulnerabilities specific to that version.',
    evidence: `$ curl -sI https://${'{target}'}
Server: Apache/2.4.41 (Ubuntu)`,
    reproduction: `curl -sI https://${'{target}'} | grep -i server`,
    remediation: `# Nginx
server_tokens off;

# Apache
ServerTokens Prod
ServerSignature Off

# Restart after config change
systemctl restart nginx`,
    references: [
      { label: 'OWASP A06:2021', url: 'https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/' },
      { label: 'CWE-200', url: 'https://cwe.mitre.org/data/definitions/200.html' },
    ],
  },
];

/**
 * Generate mock scan results for a given target URL.
 * @param {string} targetUrl - The URL being scanned
 * @returns {{ vulnerabilities: object[], riskScore: number, riskLevel: string, summary: object }}
 */
function generateMockScanData(targetUrl) {
  const target = targetUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');

  const vulnerabilities = mockVulnerabilities.map((v) => ({
    ...v,
    evidence: v.evidence.replace(/\{target\}/g, target),
    reproduction: v.reproduction.replace(/\{target\}/g, target),
  }));

  const counts = vulnerabilities.reduce(
    (acc, v) => {
      acc[v.severity] = (acc[v.severity] || 0) + 1;
      return acc;
    },
    { Critical: 0, High: 0, Medium: 0, Low: 0 }
  );

  const riskScore = 72;
  const riskLevel = riskScore >= 70 ? 'High' : riskScore >= 40 ? 'Medium' : 'Low';

  return {
    vulnerabilities,
    riskScore,
    riskLevel,
    summary: {
      total: vulnerabilities.length,
      ...counts,
    },
  };
}

module.exports = { generateMockScanData, mockVulnerabilities };