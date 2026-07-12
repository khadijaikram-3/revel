import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe,
  Calendar,
  Clock,
  AlertTriangle,
  FileText,
  Download,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  Circle,
  ShieldAlert,
  Bug,
  Server,
  Tag,
} from 'lucide-react';
import Footer from '../components/Footer';

const SCORE = 72;

type Severity = 'Critical' | 'High' | 'Medium' | 'Low';

interface Vulnerability {
  id: number;
  severity: Severity;
  title: string;
  cvss: number;
  cve: string;
  owasp: string;
  description: string;
  evidence: string;
  reproduction: string;
  remediation: string;
  references: { label: string; url: string }[];
}

const vulnerabilities: Vulnerability[] = [
  {
    id: 1,
    severity: 'Critical',
    title: 'SQL Injection Detected',
    cvss: 9.8,
    cve: 'CVE-2024-1234',
    owasp: 'A03:2021 - Injection',
    description:
      'SQL injection vulnerability detected in the login endpoint. Attackers can bypass authentication and extract database contents by injecting malicious SQL via the username parameter.',
    evidence: `POST /login HTTP/1.1
Host: example.com
Content-Type: application/x-www-form-urlencoded

username=' OR '1'='1'&password=test`,
    reproduction: `curl -X POST https://example.com/login \\
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
    severity: 'High',
    title: 'Missing Security Headers',
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
    reproduction: `curl -sI https://example.com | grep -iE \\
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
    severity: 'Medium',
    title: 'Open Port 3306 (MySQL)',
    cvss: 5.4,
    cve: 'N/A',
    owasp: 'A05:2021 - Security Misconfiguration',
    description:
      'MySQL port 3306 is exposed to the public internet, allowing unauthorized connection attempts and potential brute-force attacks against the database service.',
    evidence: `$ nmap -p 3306 example.com
PORT     STATE SERVICE
3306/tcp open  mysql
MySQL version: 8.0.31`,
    reproduction: `nmap -p 3306 -sV example.com
mysql -h example.com -u root -p`,
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
    severity: 'Low',
    title: 'Outdated Server Header',
    cvss: 3.1,
    cve: 'N/A',
    owasp: 'A06:2021 - Vulnerable and Outdated Components',
    description:
      'The Server header exposes exact version information (Apache/2.4.41), aiding attackers in targeting known vulnerabilities specific to that version.',
    evidence: `$ curl -sI https://example.com
Server: Apache/2.4.41 (Ubuntu)`,
    reproduction: `curl -sI https://example.com | grep -i server`,
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

const severityConfig: Record<
  Severity,
  { badge: string; text: string; bg: string; border: string; rowBg: string }
> = {
  Critical: {
    badge: 'bg-danger/15 text-danger border border-danger/40',
    text: 'text-danger',
    bg: 'bg-danger/10',
    border: 'glass-card-danger',
    rowBg: 'bg-danger/5',
  },
  High: {
    badge: 'bg-danger/10 text-danger/80 border border-danger/25',
    text: 'text-danger/80',
    bg: 'bg-danger/5',
    border: 'glass-card',
    rowBg: 'bg-danger/5',
  },
  Medium: {
    badge: 'bg-medium-risk/15 text-orange-400 border border-medium-risk/40',
    text: 'text-orange-400',
    bg: 'bg-medium-risk/10',
    border: 'glass-card-medium',
    rowBg: 'bg-medium-risk/5',
  },
  Low: {
    badge: 'bg-low-risk/15 text-emerald-400 border border-low-risk/40',
    text: 'text-emerald-400',
    bg: 'bg-low-risk/10',
    border: 'glass-card-low',
    rowBg: 'bg-low-risk/5',
  },
};

function CodeBlock({ code, label }: { code: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-mono text-muted-text uppercase tracking-wider">{label}</span>
        <button
          onClick={handleCopy}
          className="text-xs text-muted-text hover:text-silver transition-colors font-mono"
        >
          {copied ? 'copied' : 'copy'}
        </button>
      </div>
      <pre className="bg-background border border-border rounded-lg p-4 overflow-x-auto text-sm font-mono text-secondary-text leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function TechnicalReportPage() {
  const [animatedFill, setAnimatedFill] = useState(0);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => setAnimatedFill(SCORE), 400);
    return () => clearTimeout(timer);
  }, []);

  const toggleCheck = (id: number) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-[10px] border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2.5">
              <img
                src="/revel_logo.jpeg"
                alt="Revel"
                className="h-8 w-auto rounded-sm transition-all duration-300"
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLImageElement).style.boxShadow =
                    '0 0 15px rgba(192, 192, 192, 0.3)')
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLImageElement).style.boxShadow = 'none')
                }
              />
              <span className="font-orbitron font-bold text-xl tracking-wide">
                <span className="text-danger">R</span>
                <span className="text-primary-text">evel</span>
              </span>
            </Link>
            <Link to="/reports">
              <button className="btn-primary flex items-center space-x-2 text-sm">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Results</span>
              </button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ── HEADER ───────────────────────────────────────────── */}
          <div className="text-center mb-12">
            <span className="badge-enterprise inline-block mb-5">Technical Report</span>
            <h1 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-primary-text mb-4 leading-tight">
              Security Assessment — Technical Findings
            </h1>
            <p className="text-secondary-text text-lg mb-8">
              Detailed technical analysis for security engineers and developers
            </p>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-secondary-text mb-6">
              <span className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-silver" />
                <span>Target:</span>
                <span className="text-primary-text font-medium">https://example.com</span>
              </span>
              <span className="text-border hidden sm:block">|</span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-silver" />
                <span>Date:</span>
                <span className="text-primary-text font-medium">July 9, 2026</span>
              </span>
              <span className="text-border hidden sm:block">|</span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-silver" />
                <span>Duration:</span>
                <span className="text-primary-text font-medium">2m 34s</span>
              </span>
              <span className="text-border hidden sm:block">|</span>
              <span className="text-primary-text font-mono text-sm">Assessment ID: #REV-2026-001</span>
            </div>
          </div>

          {/* ── EXECUTIVE SUMMARY (TECHNICAL) ─────────────────────── */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 bg-danger rounded-full" />
              <h2 className="font-heading font-bold text-2xl text-primary-text">
                Executive Summary
              </h2>
            </div>
            <div className="glass-card p-6">
              <p className="text-secondary-text leading-relaxed mb-6">
                An external security assessment of{' '}
                <span className="text-silver font-medium">https://example.com</span> identified
                4 vulnerabilities across 4 severity levels. The most critical finding is a
                SQL injection in the login endpoint (CVSS 9.8) enabling authentication bypass
                and data exfiltration. Immediate remediation is required.
              </p>

              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Score ring */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="relative w-28 h-28">
                    <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#2C2C2C" strokeWidth="10" />
                      <circle
                        cx="60" cy="60" r="50" fill="none" stroke="#E11D48" strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray="314.16"
                        strokeDashoffset={314.16 - (314.16 * animatedFill) / 100}
                        style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-heading font-bold text-3xl text-primary-text leading-none">{SCORE}</span>
                      <span className="font-heading font-semibold text-[10px] text-danger mt-0.5 tracking-widest">/ 100</span>
                    </div>
                  </div>
                  <span className="font-heading font-bold text-xs text-danger tracking-widest mt-2 uppercase">
                    High Risk
                  </span>
                </div>

                {/* Counts */}
                <div className="flex-1 grid grid-cols-4 gap-2 w-full">
                  <div className="bg-danger/10 border border-danger/30 rounded-lg px-2 py-3 text-center">
                    <div className="font-heading font-bold text-2xl text-danger">1</div>
                    <div className="text-[10px] text-secondary-text mt-0.5 font-medium">Critical</div>
                  </div>
                  <div className="bg-danger/5 border border-danger/20 rounded-lg px-2 py-3 text-center">
                    <div className="font-heading font-bold text-2xl text-danger/80">1</div>
                    <div className="text-[10px] text-secondary-text mt-0.5 font-medium">High</div>
                  </div>
                  <div className="bg-medium-risk/10 border border-medium-risk/30 rounded-lg px-2 py-3 text-center">
                    <div className="font-heading font-bold text-2xl text-orange-400">1</div>
                    <div className="text-[10px] text-secondary-text mt-0.5 font-medium">Medium</div>
                  </div>
                  <div className="bg-low-risk/10 border border-low-risk/30 rounded-lg px-2 py-3 text-center">
                    <div className="font-heading font-bold text-2xl text-emerald-400">1</div>
                    <div className="text-[10px] text-secondary-text mt-0.5 font-medium">Low</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── VULNERABILITY DETAILS ────────────────────────────── */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 bg-danger rounded-full" />
              <h2 className="font-heading font-bold text-2xl text-primary-text">
                Vulnerability Details
              </h2>
            </div>

            <div className="space-y-6">
              {vulnerabilities.map((vuln) => {
                const cfg = severityConfig[vuln.severity];
                return (
                  <div key={vuln.id} className={`${cfg.border} p-6`}>
                    {/* Header row */}
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <span className={`text-xs font-semibold font-mono px-2.5 py-1 rounded ${cfg.badge}`}>
                            {vuln.severity.toUpperCase()}
                          </span>
                          <h3 className="font-heading font-semibold text-xl text-primary-text">
                            {vuln.title}
                          </h3>
                        </div>
                        <p className="text-secondary-text text-sm leading-relaxed">
                          {vuln.description}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-muted-text text-xs uppercase tracking-wide mb-1">
                          CVSS Score
                        </div>
                        <div className={`text-3xl font-heading font-bold ${cfg.text}`}>
                          {vuln.cvss}
                        </div>
                      </div>
                    </div>

                    {/* Meta grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 py-3 border-y border-border">
                      <div>
                        <div className="text-muted-text text-xs uppercase tracking-wide mb-1">CVE Reference</div>
                        <span className="font-mono text-sm text-primary-text">{vuln.cve}</span>
                      </div>
                      <div>
                        <div className="text-muted-text text-xs uppercase tracking-wide mb-1">OWASP Mapping</div>
                        <span className="font-mono text-sm text-primary-text">{vuln.owasp}</span>
                      </div>
                      <div>
                        <div className="text-muted-text text-xs uppercase tracking-wide mb-1">CWE</div>
                        <span className="font-mono text-sm text-primary-text">
                          {vuln.references.find((r) => r.label.startsWith('CWE'))?.label ?? 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Evidence */}
                    <CodeBlock code={vuln.evidence} label="Evidence" />

                    {/* Reproduction */}
                    <CodeBlock code={vuln.reproduction} label="Reproduction Steps" />

                    {/* Remediation */}
                    <CodeBlock code={vuln.remediation} label="Remediation" />

                    {/* References */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-muted-text uppercase tracking-wider">References:</span>
                      {vuln.references.map((ref) => (
                        <a
                          key={ref.label}
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-mono text-silver hover:text-silver-hover transition-colors border border-silver/20 hover:border-silver/50 rounded px-2 py-1"
                        >
                          {ref.label}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── SUMMARY TABLE ─────────────────────────────────────── */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 bg-silver/60 rounded-full" />
              <h2 className="font-heading font-bold text-2xl text-primary-text">
                Vulnerability Summary
              </h2>
            </div>
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="px-4 py-3 font-heading font-semibold text-secondary-text">Severity</th>
                      <th className="px-4 py-3 font-heading font-semibold text-secondary-text">Vulnerability</th>
                      <th className="px-4 py-3 font-heading font-semibold text-secondary-text">CVSS</th>
                      <th className="px-4 py-3 font-heading font-semibold text-secondary-text">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vulnerabilities.map((vuln) => {
                      const cfg = severityConfig[vuln.severity];
                      return (
                        <tr
                          key={vuln.id}
                          className={`border-b border-border last:border-0 ${cfg.rowBg} hover:bg-card-bg transition-colors`}
                        >
                          <td className="px-4 py-3">
                            <span className={`text-xs font-semibold font-mono px-2 py-1 rounded ${cfg.badge}`}>
                              {vuln.severity.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-primary-text font-medium">{vuln.title}</td>
                          <td className="px-4 py-3">
                            <span className={`font-mono font-semibold ${cfg.text}`}>{vuln.cvss}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-secondary-text text-xs font-mono">Open</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* ── REMEDIATION CHECKLIST ─────────────────────────────── */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 bg-danger rounded-full" />
              <h2 className="font-heading font-bold text-2xl text-primary-text">
                Remediation Checklist
              </h2>
            </div>
            <div className="glass-card p-6">
              <ol className="space-y-3">
                {vulnerabilities.map((vuln) => {
                  const checked = checkedItems.has(vuln.id);
                  const cfg = severityConfig[vuln.severity];
                  return (
                    <li
                      key={vuln.id}
                      className="flex items-start gap-3 cursor-pointer group"
                      onClick={() => toggleCheck(vuln.id)}
                    >
                      {checked ? (
                        <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${cfg.text}`} />
                      ) : (
                        <Circle className="w-5 h-5 shrink-0 mt-0.5 text-muted-text group-hover:text-silver transition-colors" />
                      )}
                      <div className={checked ? 'line-through text-muted-text' : ''}>
                        <span className={`font-mono text-xs ${cfg.text} font-semibold`}>
                          [{vuln.severity.toUpperCase()}]
                        </span>{' '}
                        <span className="text-primary-text font-medium">{vuln.title}</span>
                        <span className="text-secondary-text"> — {vuln.remediation.split('\n')[0]}</span>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </section>

          {/* ── DIVIDER ───────────────────────────────────────────── */}
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-10" />

          {/* ── ACTION BUTTONS ────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4">
            <Link to="/executive-report">
              <button className="btn-primary flex items-center justify-center space-x-2 px-8 py-4">
                <FileText className="w-5 h-5" />
                <span>View Executive Report</span>
              </button>
            </Link>
            <button className="btn-silver flex items-center justify-center space-x-2 px-8 py-4">
              <Download className="w-5 h-5" />
              <span>Download PDF Report</span>
            </button>
            <Link to="/reports">
              <button className="btn-outline flex items-center justify-center space-x-2 px-8 py-4 w-full sm:w-auto">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
