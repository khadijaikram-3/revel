import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe,
  Calendar,
  Clock,
  FileText,
  Download,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import Footer from '../components/Footer';
import { useScan } from '../context/ScanContext';
import type { ScanData, TechnicalReport, Severity, Vulnerability } from '../types/scan';

const severityConfig: Record<
  Severity,
  { badge: string; text: string; border: string; rowBg: string }
> = {
  Critical: {
    badge: 'bg-danger/15 text-danger border border-danger/40',
    text: 'text-danger',
    border: 'glass-card-danger',
    rowBg: 'bg-danger/5',
  },
  High: {
    badge: 'bg-danger/10 text-danger/80 border border-danger/25',
    text: 'text-danger/80',
    border: 'glass-card',
    rowBg: 'bg-danger/5',
  },
  Medium: {
    badge: 'bg-medium-risk/15 text-medium-risk border border-medium-risk/40',
    text: 'text-medium-risk',
    border: 'glass-card-medium',
    rowBg: 'bg-medium-risk/5',
  },
  Low: {
    badge: 'bg-low-risk/15 text-low-risk border border-low-risk/40',
    text: 'text-low-risk',
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
        <button onClick={handleCopy} className="text-xs text-muted-text hover:text-silver transition-colors font-mono">
          {copied ? 'copied' : 'copy'}
        </button>
      </div>
      <pre className="bg-[#1a1a1a] border border-border rounded-xl p-5 overflow-x-auto text-sm font-mono text-secondary-text leading-[1.7] text-[0.85rem] mt-2">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return 'N/A';
  try {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return 'N/A';
  }
}

function getAssessmentId(createdAt: string): string {
  const date = new Date(createdAt);
  const year = date.getFullYear();
  const num = date.getTime().toString().slice(-3);
  return `#REV-${year}-${num}`;
}

export default function TechnicalReportPage() {
  const [animatedFill, setAnimatedFill] = useState(0);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const { scanData } = useScan();

  const data: ScanData | null = scanData;
  const report: TechnicalReport | null = data?.technicalReport ?? null;

  const score = report?.riskScore ?? data?.riskScore ?? 0;
  const riskLevel = report?.riskLevel ?? data?.riskLevel ?? 'N/A';
  const vulnerabilities: Vulnerability[] = report?.vulnerabilities ?? data?.vulnerabilities ?? [];
  const summaryTable = report?.summaryTable ?? vulnerabilities.map((v) => ({
    severity: v.severity, vulnerability: v.title, cvss: v.cvss, status: 'Open',
  }));

  const counts = {
    Critical: vulnerabilities.filter((v) => v.severity === 'Critical').length,
    High: vulnerabilities.filter((v) => v.severity === 'High').length,
    Medium: vulnerabilities.filter((v) => v.severity === 'Medium').length,
    Low: vulnerabilities.filter((v) => v.severity === 'Low').length,
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => setAnimatedFill(score), 400);
    return () => clearTimeout(timer);
  }, [score]);

  const toggleCheck = (id: number) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-[10px] border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2.5">
              <img src="/revel_logo.jpeg" alt="Revel" className="h-8 w-auto rounded-sm" />
              <span className="font-orbitron font-bold text-xl tracking-wide">
                <span className="text-danger">R</span>
                <span className="text-primary-text">evel</span>
              </span>
            </Link>
            <Link to="/scan"><button className="btn-primary text-sm">Run a Scan</button></Link>
          </div>
        </nav>
        <main className="flex-1 pt-32 pb-20 flex items-center justify-center">
          <div className="text-center">
            <p className="text-secondary-text text-lg mb-6">No scan data available.</p>
            <Link to="/scan"><button className="btn-primary">Run a Scan</button></Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const displayDate = formatDate(data.completedAt || data.createdAt);
  const assessmentId = getAssessmentId(data.createdAt);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-[10px] border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2.5">
              <img src="/revel_logo.jpeg" alt="Revel" className="h-8 w-auto rounded-sm transition-all duration-300"
                onMouseEnter={(e) => ((e.currentTarget as HTMLImageElement).style.boxShadow = '0 0 15px rgba(192, 192, 192, 0.3)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLImageElement).style.boxShadow = 'none')}
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

          {/* HEADER */}
          <div className="text-center mb-14 animate-slide-up">
            <span className="badge-enterprise inline-block mb-6 px-5 py-2 text-sm tracking-[0.15em]">Technical Report</span>
            <h1 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-primary-text mb-5 leading-[1.1] tracking-tight">
              Security Assessment — Technical Findings
            </h1>
            <p className="text-secondary-text text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
              Detailed technical analysis for security engineers and developers
            </p>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-secondary-text mb-7 max-w-3xl mx-auto">
              <span className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-silver" />
                <span>Target:</span>
                <span className="text-primary-text font-medium">{data.targetUrl}</span>
              </span>
              <span className="text-border hidden sm:block">|</span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-silver" />
                <span>Date:</span>
                <span className="text-primary-text font-medium">{displayDate}</span>
              </span>
              <span className="text-border hidden sm:block">|</span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-silver" />
                <span>Duration:</span>
                <span className="text-primary-text font-medium">{data.duration || 'N/A'}</span>
              </span>
              <span className="text-border hidden sm:block">|</span>
              <span className="inline-flex items-center text-primary-text font-mono text-sm px-3 py-1 rounded-full border border-border bg-card-bg/50">Assessment ID: {assessmentId}</span>
            </div>
          </div>

          {/* EXECUTIVE SUMMARY (TECHNICAL) */}
          <section className="mb-14">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-7 bg-danger rounded-full" />
              <h2 className="font-heading font-bold text-2xl md:text-3xl text-primary-text">Executive Summary</h2>
            </div>
            <div className="glass-card p-7 md:p-8" style={{ boxShadow: '0 10px 40px -12px rgba(0, 0, 0, 0.3)' }}>
              <p className="text-secondary-text leading-[1.8] text-base md:text-[1.05rem] mb-7">
                {report?.executiveSummary || `An external security assessment of ${data.targetUrl} identified ${vulnerabilities.length} vulnerabilities across multiple severity levels. Immediate remediation is required.`}
              </p>

              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex flex-col items-center shrink-0">
                  <div className="relative w-32 h-32">
                    <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#2C2C2C" strokeWidth="8" />
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#E11D48" strokeWidth="8" strokeLinecap="round"
                        strokeDasharray="314.16" strokeDashoffset={314.16 - (314.16 * animatedFill) / 100}
                        style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)', filter: 'drop-shadow(0 0 6px rgba(225, 29, 72, 0.5))' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-heading font-bold text-4xl text-primary-text leading-none">{score}</span>
                      <span className="font-heading font-semibold text-[10px] text-danger mt-1 tracking-widest">/ 100</span>
                    </div>
                  </div>
                  <span className="font-heading font-bold text-xs text-danger tracking-[0.2em] mt-3 uppercase px-3.5 py-1.5 rounded-full bg-danger/10 border border-danger/30">
                    {riskLevel} Risk
                  </span>
                </div>

                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
                  <div className="bg-danger/10 border border-danger/30 rounded-xl px-3 py-4 text-center transition-all duration-300 hover:scale-[1.03] hover:bg-danger/15 hover:-translate-y-0.5">
                    <div className="font-heading font-bold text-2xl text-danger">{counts.Critical}</div>
                    <div className="text-xs text-secondary-text mt-1 font-medium tracking-wide">Critical</div>
                  </div>
                  <div className="bg-danger/5 border border-danger/20 rounded-xl px-3 py-4 text-center transition-all duration-300 hover:scale-[1.03] hover:bg-danger/10 hover:-translate-y-0.5">
                    <div className="font-heading font-bold text-2xl text-danger/80">{counts.High}</div>
                    <div className="text-xs text-secondary-text mt-1 font-medium tracking-wide">High</div>
                  </div>
                  <div className="bg-medium-risk/10 border border-medium-risk/30 rounded-xl px-3 py-4 text-center transition-all duration-300 hover:scale-[1.03] hover:bg-medium-risk/15 hover:-translate-y-0.5">
                    <div className="font-heading font-bold text-2xl text-medium-risk">{counts.Medium}</div>
                    <div className="text-xs text-secondary-text mt-1 font-medium tracking-wide">Medium</div>
                  </div>
                  <div className="bg-low-risk/10 border border-low-risk/30 rounded-xl px-3 py-4 text-center transition-all duration-300 hover:scale-[1.03] hover:bg-low-risk/15 hover:-translate-y-0.5">
                    <div className="font-heading font-bold text-2xl text-low-risk">{counts.Low}</div>
                    <div className="text-xs text-secondary-text mt-1 font-medium tracking-wide">Low</div>
                  </div>
                </div>
              </div>
              {report?.source === 'groq' && (
                <p className="text-muted-text text-xs mt-5 font-mono">Generated by AI (Groq)</p>
              )}
            </div>
          </section>

          {/* VULNERABILITY DETAILS */}
          <section className="mb-14">
            <div className="flex items-center gap-3 mb-7">
              <div className="w-1 h-7 bg-danger rounded-full" />
              <h2 className="font-heading font-bold text-2xl md:text-3xl text-primary-text">Vulnerability Details</h2>
            </div>

            <div className="space-y-6">
              {vulnerabilities.map((vuln, idx) => {
                const cfg = severityConfig[vuln.severity] || severityConfig.Low;
                return (
                  <div key={vuln.id || idx} className={`${cfg.border} p-6 md:p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-danger/5`}>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-5">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2.5 mb-3">
                          <span className={`text-xs font-semibold font-mono px-3 py-1.5 rounded-full ${cfg.badge} tracking-wide`}>
                            {vuln.severity.toUpperCase()}
                          </span>
                          <h3 className="font-heading font-semibold text-xl text-primary-text">{vuln.title}</h3>
                        </div>
                        <p className="text-secondary-text text-sm leading-[1.7]">{vuln.description}</p>
                      </div>
                      <div className="text-right shrink-0 md:pl-6 md:border-l md:border-border">
                        <div className="text-muted-text text-xs uppercase tracking-wider mb-1.5">CVSS Score</div>
                        <div className={`text-4xl font-heading font-bold ${cfg.text} leading-none`}>{vuln.cvss}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5 py-4 border-y border-border">
                      <div>
                        <div className="text-muted-text text-xs uppercase tracking-wider mb-1.5">CVE Reference</div>
                        <span className="font-mono text-sm text-primary-text">{vuln.cve || 'N/A'}</span>
                      </div>
                      <div>
                        <div className="text-muted-text text-xs uppercase tracking-wider mb-1.5">OWASP Mapping</div>
                        <span className="font-mono text-sm text-primary-text">{vuln.owasp || 'N/A'}</span>
                      </div>
                      <div>
                        <div className="text-muted-text text-xs uppercase tracking-wider mb-1.5">CWE</div>
                        <span className="font-mono text-sm text-primary-text">
                          {vuln.references?.find((r) => r.label.startsWith('CWE'))?.label ?? 'N/A'}
                        </span>
                      </div>
                    </div>

                    {vuln.evidence && <CodeBlock code={vuln.evidence} label="Evidence" />}
                    {vuln.reproduction && <CodeBlock code={vuln.reproduction} label="Reproduction Steps" />}
                    {vuln.remediation && <CodeBlock code={vuln.remediation} label="Remediation" />}

                    {vuln.references?.length > 0 && (
                      <div className="mt-5 flex flex-wrap items-center gap-2">
                        <span className="text-xs text-muted-text uppercase tracking-wider">References:</span>
                        {vuln.references.map((ref) => (
                          <a key={ref.label} href={ref.url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-mono text-silver hover:text-silver-hover transition-colors border border-silver/20 hover:border-silver/50 rounded-md px-2.5 py-1.5 hover:-translate-y-0.5">
                            {ref.label}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* SUMMARY TABLE */}
          <section className="mb-14">
            <div className="flex items-center gap-3 mb-7">
              <div className="w-1 h-7 bg-silver/60 rounded-full" />
              <h2 className="font-heading font-bold text-2xl md:text-3xl text-primary-text">Vulnerability Summary</h2>
            </div>
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="px-5 py-4 font-heading font-semibold text-secondary-text">Severity</th>
                      <th className="px-5 py-4 font-heading font-semibold text-secondary-text">Vulnerability</th>
                      <th className="px-5 py-4 font-heading font-semibold text-secondary-text">CVSS</th>
                      <th className="px-5 py-4 font-heading font-semibold text-secondary-text">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryTable.map((row, idx) => {
                      const cfg = severityConfig[row.severity as Severity] || severityConfig.Low;
                      return (
                        <tr key={idx} className={`border-b border-border last:border-0 ${cfg.rowBg} hover:bg-card-bg transition-colors`}>
                          <td className="px-5 py-4">
                            <span className={`text-xs font-semibold font-mono px-3 py-1.5 rounded-full ${cfg.badge} tracking-wide`}>
                              {row.severity.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-primary-text font-medium">{row.vulnerability}</td>
                          <td className="px-5 py-4"><span className={`font-mono font-semibold ${cfg.text}`}>{row.cvss}</span></td>
                          <td className="px-5 py-4"><span className="text-secondary-text text-xs font-mono">{row.status}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* REMEDIATION CHECKLIST */}
          <section className="mb-14">
            <div className="flex items-center gap-3 mb-7">
              <div className="w-1 h-7 bg-danger rounded-full" />
              <h2 className="font-heading font-bold text-2xl md:text-3xl text-primary-text">Remediation Checklist</h2>
            </div>
            <div className="glass-card p-7 md:p-8">
              <ol className="space-y-4">
                {vulnerabilities.map((vuln) => {
                  const checked = checkedItems.has(vuln.id);
                  const cfg = severityConfig[vuln.severity] || severityConfig.Low;
                  return (
                    <li key={vuln.id} className="flex items-start gap-3.5 cursor-pointer group rounded-lg p-2.5 -mx-2.5 hover:bg-card-bg/40 transition-colors" onClick={() => toggleCheck(vuln.id)}>
                      {checked ? (
                        <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${cfg.text}`} />
                      ) : (
                        <Circle className="w-5 h-5 shrink-0 mt-0.5 text-muted-text group-hover:text-silver transition-colors" />
                      )}
                      <div className={`flex-1 ${checked ? 'line-through text-muted-text' : ''}`}>
                        <span className={`font-mono text-xs ${cfg.text} font-semibold px-2 py-0.5 rounded-md ${cfg.badge}`}>[{vuln.severity.toUpperCase()}]</span>{' '}
                        <span className="text-primary-text font-medium">{vuln.title}</span>
                        <span className="text-secondary-text"> — {vuln.remediation?.split('\n')[0]}</span>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </section>

          {/* DIVIDER */}
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-12" />

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4">
            <Link to="/executive-report" className="flex-1 sm:flex-initial">
              <button className="btn-primary flex items-center justify-center space-x-2 px-8 py-4 w-full h-14 hover:-translate-y-0.5">
                <FileText className="w-5 h-5" />
                <span>View Executive Report</span>
              </button>
            </Link>
            <button className="btn-silver flex items-center justify-center space-x-2 px-8 py-4 w-full sm:w-auto h-14 hover:-translate-y-0.5">
              <Download className="w-5 h-5" />
              <span>Download PDF Report</span>
            </button>
            <Link to="/reports" className="flex-1 sm:flex-initial">
              <button className="btn-outline flex items-center justify-center space-x-2 px-8 py-4 w-full h-14 hover:-translate-y-0.5">
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