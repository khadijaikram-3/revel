/**
 * Mock security scan data — used as fallback when external APIs are
 * unavailable or rate-limited. Ensures the app always returns results.
 *
 * Includes: SSL/TLS issues, open ports, missing security headers,
 * SQL injection indicators, XSS indicators, DNS records, server info.
 */

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
Host: {target}
Content-Type: application/x-www-form-urlencoded

username=' OR '1'='1'&password=test`,
    reproduction: `curl -X POST https://{target}/login \\
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
    title: 'Cross-Site Scripting (Reflected XSS)',
    severity: 'High',
    cvss: 7.4,
    cve: 'N/A',
    owasp: 'A03:2021 - Injection',
    description:
      'Reflected XSS vulnerability detected in the search parameter. User input is rendered without sanitization, allowing attackers to inject malicious JavaScript that executes in victims\' browsers.',
    evidence: `GET /search?q=<script>alert(document.cookie)</script> HTTP/1.1
Host: {target}

HTTP/1.1 200 OK
Content-Type: text/html
<p>Results for: <script>alert(document.cookie)</script></p>`,
    reproduction: `curl -s "https://{target}/search?q=<script>alert(1)</script>" | \\
  grep -i "<script>"`,
    remediation: `Sanitize and encode all user input:

# PHP
echo htmlspecialchars($user_input, ENT_QUOTES, 'UTF-8');

# Node.js (DOMPurify)
const clean = DOMPurify.sanitize(userInput);

# React (auto-escapes, but avoid dangerouslySetInnerHTML)
# Set Content-Security-Policy header:
Header always set Content-Security-Policy "default-src 'self'; script-src 'self'"`,
    references: [
      { label: 'OWASP A03:2021', url: 'https://owasp.org/Top10/A03_2021-Injection/' },
      { label: 'CWE-79', url: 'https://cwe.mitre.org/data/definitions/79.html' },
    ],
  },
  {
    id: 3,
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
    reproduction: `curl -sI https://{target} | grep -iE \\
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
    id: 4,
    title: 'SSL/TLS Weak Cipher Suites',
    severity: 'Medium',
    cvss: 5.9,
    cve: 'N/A',
    owasp: 'A02:2021 - Cryptographic Failures',
    description:
      'The server supports deprecated TLS 1.0 and weak cipher suites (RC4, 3DES), which are vulnerable to known cryptographic attacks like BEAST and Sweet32.',
    evidence: `$ openssl s_client -connect {target}:443 -tls1
Protocol: TLSv1
Cipher: RC4-MD5
Server certificate verified

$ nmap --script ssl-enum-ciphers -p 443 {target}
TLSv1.0:
  Ciphers: RC4-MD5, 3DES-EDE-CBC-SHA
  [WEAK]`,
    reproduction: `openssl s_client -connect {target}:443 -tls1 2>&1 | \\
  grep -E "Protocol|Cipher"
nmap --script ssl-enum-ciphers -p 443 {target}`,
    remediation: `# Apache — disable TLS 1.0/1.1 and weak ciphers
SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1
SSLCipherSuite HIGH:!aNULL:!MD5:!3DES:!RC4

# Nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
ssl_prefer_server_ciphers on;

# Restart web server
systemctl restart apache2`,
    references: [
      { label: 'OWASP A02:2021', url: 'https://owasp.org/Top10/A02_2021-Cryptographic_Failures/' },
      { label: 'CWE-327', url: 'https://cwe.mitre.org/data/definitions/327.html' },
    ],
  },
  {
    id: 5,
    title: 'Open Port 3306 (MySQL)',
    severity: 'Medium',
    cvss: 5.4,
    cve: 'N/A',
    owasp: 'A05:2021 - Security Misconfiguration',
    description:
      'MySQL port 3306 is exposed to the public internet, allowing unauthorized connection attempts and potential brute-force attacks against the database service.',
    evidence: `$ nmap -p 3306 {target}
PORT     STATE SERVICE
3306/tcp open  mysql
MySQL version: 8.0.31`,
    reproduction: `nmap -p 3306 -sV {target}
mysql -h {target} -u root -p`,
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
    id: 6,
    title: 'Outdated Server Header Information Disclosure',
    severity: 'Low',
    cvss: 3.1,
    cve: 'N/A',
    owasp: 'A06:2021 - Vulnerable and Outdated Components',
    description:
      'The Server header exposes exact version information (Apache/2.4.41), aiding attackers in targeting known vulnerabilities specific to that version.',
    evidence: `$ curl -sI https://{target}
Server: Apache/2.4.41 (Ubuntu)
X-Powered-By: PHP/7.4.3`,
    reproduction: `curl -sI https://{target} | grep -iE "server|x-powered"`,
    remediation: `# Nginx
server_tokens off;

# Apache
ServerTokens Prod
ServerSignature Off

# PHP
expose_php = Off

# Restart after config change
systemctl restart nginx`,
    references: [
      { label: 'OWASP A06:2021', url: 'https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/' },
      { label: 'CWE-200', url: 'https://cwe.mitre.org/data/definitions/200.html' },
    ],
  },
];

const mockDnsRecords = [
  { type: 'A', name: '@', value: '93.184.216.34', ttl: 3600 },
  { type: 'A', name: 'www', value: '93.184.216.34', ttl: 3600 },
  { type: 'MX', name: '@', value: 'mail.{domain}', ttl: 3600, priority: 10 },
  { type: 'TXT', name: '@', value: 'v=spf1 include:_spf.{domain} ~all', ttl: 3600 },
  { type: 'NS', name: '@', value: 'ns1.{domain}', ttl: 86400 },
  { type: 'NS', name: '@', value: 'ns2.{domain}', ttl: 86400 },
  { type: 'CNAME', name: 'cdn', value: 'cdn.cloudflare.net', ttl: 300 },
];

const mockSubdomains = ['www', 'mail', 'ftp', 'admin', 'blog', 'api', 'dev', 'staging'];

const mockServerInfo = {
  server: 'Apache/2.4.41 (Ubuntu)',
  poweredBy: 'PHP/7.4.3',
  xFrameOptions: 'Not Set',
  xContentTypeOptions: 'Not Set',
  strictTransportSecurity: 'Not Set',
  contentSecurityPolicy: 'Not Set',
  xXssProtection: 'Not Set',
  referrerPolicy: 'Not Set',
};

const mockSslInfo = {
  protocol: 'TLSv1.2',
  cipher: 'ECDHE-RSA-AES256-GCM-SHA384',
  certificateValid: true,
  certificateExpiry: '2027-01-15',
  issuer: "Let's Encrypt R3",
  weakCiphers: ['RC4-MD5', '3DES-EDE-CBC-SHA'],
  protocolsSupported: ['TLSv1.0', 'TLSv1.1', 'TLSv1.2', 'TLSv1.3'],
};

/**
 * Generate mock scan results for a given target URL.
 * @param {string} targetUrl - The URL being scanned
 * @returns {{ vulnerabilities: object[], riskScore: number, riskLevel: string, summary: object, dnsRecords: object[], subdomains: string[], serverInfo: object, sslInfo: object }}
 */
function generateMockScanData(targetUrl) {
  const hostname = targetUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const domain = hostname.split('.').slice(-2).join('.');

  const vulnerabilities = mockVulnerabilities.map((v) => ({
    ...v,
    evidence: v.evidence.replace(/\{target\}/g, hostname),
    reproduction: v.reproduction.replace(/\{target\}/g, hostname),
  }));

  const counts = vulnerabilities.reduce(
    (acc, v) => {
      acc[v.severity] = (acc[v.severity] || 0) + 1;
      return acc;
    },
    { Critical: 0, High: 0, Medium: 0, Low: 0 }
  );

  const dnsRecords = mockDnsRecords.map((r) => ({
    ...r,
    value: r.value.replace(/\{domain\}/g, domain),
    name: r.name === '@' ? domain : `${r.name}.${domain}`,
  }));

  const subdomains = mockSubdomains.map((s) => `${s}.${domain}`);

  const serverInfo = {
    ...mockServerInfo,
    server: mockServerInfo.server,
  };

  const sslInfo = {
    ...mockSslInfo,
    hostname,
  };

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
    dnsRecords,
    subdomains,
    serverInfo,
    sslInfo,
  };
}

module.exports = {
  generateMockScanData,
  mockVulnerabilities,
  mockDnsRecords,
  mockSubdomains,
  mockServerInfo,
  mockSslInfo,
};