import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe,
  Calendar,
  Clock,
  AlertTriangle,
  TrendingDown,
  ServerCrash,
  Megaphone,
  CheckCircle2,
  FileText,
  Download,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import Footer from '../components/Footer';
import { useScan } from '../context/ScanContext';
import type { ScanData, ExecutiveReport } from '../types/scan';

const defaultImpacts = [
  { icon: TrendingDown, title: 'Customer Data Exposure', description: 'Attackers could steal customer information, leading to privacy violations and loss of trust.', accent: 'danger' },
  { icon: ServerCrash, title: 'Operational Disruption', description: 'Exploitation could cause service outages, affecting revenue and user experience.', accent: 'medium' },
  { icon: Megaphone, title: 'Reputational Damage', description: 'Public disclosure of vulnerabilities could harm your brand image.', accent: 'silver' },
];

const defaultNextSteps = [
  { icon: FileText, text: 'Review the full Technical Report for detailed remediation steps.' },
  { icon: Calendar, text: 'Schedule a follow-up security assessment after fixes are applied.' },
  { icon: CheckCircle2, text: 'Consider a full penetration test for comprehensive coverage.' },
];

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    Critical: 'bg-danger/15 text-danger border border-danger/30',
    High: 'bg-danger/10 text-danger/80 border border-danger/20',
    Medium: 'bg-medium-risk/15 text-medium-risk border border-medium-risk/30',
    Low: 'bg-low-risk/15 text-low-risk border border-low-risk/30',
  };
  return (
    <span className={`text-xs font-semibold font-mono px-2.5 py-1 rounded ${map[severity] ?? ''}`}>
      {severity.toUpperCase()}
    </span>
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

export default function ExecutiveReportPage() {
  const [animatedFill, setAnimatedFill] = useState(0);
  const { scanData } = useScan();

  const data: ScanData | null = scanData;
  const report: ExecutiveReport | null = data?.executiveReport ?? null;

  const score = report?.riskScore ?? data?.riskScore ?? 0;
  const riskLevel = report?.riskLevel ?? data?.riskLevel ?? 'N/A';

  const counts = report?.vulnerabilityCounts ?? {
    critical: data?.vulnerabilities?.filter((v) => v.severity === 'Critical').length ?? 0,
    high: data?.vulnerabilities?.filter((v) => v.severity === 'High').length ?? 0,
    medium: data?.vulnerabilities?.filter((v) => v.severity === 'Medium').length ?? 0,
    low: data?.vulnerabilities?.filter((v) => v.severity === 'Low').length ?? 0,
  };

  const businessImpacts = report?.businessImpacts?.length
    ? report.businessImpacts.map((b, i) => ({
        ...b,
        icon: [TrendingDown, ServerCrash, Megaphone][i % 3],
        accent: ['danger', 'medium', 'silver'][i % 3],
      }))
    : defaultImpacts;

  const priorityFixes = report?.priorityFixes?.length
    ? report.priorityFixes
    : [];

  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => setAnimatedFill(score), 400);
    return () => clearTimeout(timer);
  }, [score]);

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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* HEADER */}
          <div className="text-center mb-14 animate-slide-up">
            <span className="badge-enterprise inline-block mb-6 px-5 py-2 text-sm tracking-[0.15em]">Executive Summary</span>
            <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-primary-text mb-5 leading-[1.08] tracking-tight">
              Security Assessment Report
            </h1>
            <p className="text-secondary-text text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
              Plain-English analysis for business stakeholders
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
            </div>

            <span className="badge-enterprise inline-block px-5 py-2 text-sm tracking-[0.15em]">Assessment ID: {assessmentId}</span>
          </div>

          {/* RISK SUMMARY CARD */}
          <div className="glass-card-danger p-8 md:p-10 mb-12 animate-slide-up animate-delay-100" style={{ boxShadow: '0 10px 40px -12px rgba(225, 29, 72, 0.22)' }}>
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-10">
              <div className="flex flex-col items-center shrink-0">
                <div className="relative w-40 h-40">
                  <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#2C2C2C" strokeWidth="8" />
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#E11D48" strokeWidth="8" strokeLinecap="round"
                      strokeDasharray="314.16" strokeDashoffset={314.16 - (314.16 * animatedFill) / 100}
                      style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)', filter: 'drop-shadow(0 0 6px rgba(225, 29, 72, 0.5))' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-heading font-bold text-5xl text-primary-text leading-none">{score}</span>
                    <span className="font-heading font-semibold text-xs text-danger mt-1.5 tracking-widest">/ 100</span>
                  </div>
                </div>
                <span className="font-heading font-bold text-sm text-danger tracking-[0.2em] mt-4 uppercase px-4 py-1.5 rounded-full bg-danger/10 border border-danger/30">
                  {riskLevel} Risk
                </span>
              </div>

              <div className="flex-1 text-center md:text-left w-full">
                <div className="flex items-start gap-3 mb-6 justify-center md:justify-start">
                  <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-1" />
                  <p className="text-primary-text font-medium text-lg leading-snug">
                    Your website has {counts.critical} critical {counts.critical === 1 ? 'vulnerability' : 'vulnerabilities'} that require immediate attention.
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-danger/10 border border-danger/30 rounded-xl px-4 py-4 text-center transition-all duration-300 hover:scale-[1.03] hover:bg-danger/15 hover:-translate-y-0.5">
                    <div className="font-heading font-bold text-3xl text-danger">{counts.critical}</div>
                    <div className="text-xs text-secondary-text mt-1.5 font-medium tracking-wide">Critical</div>
                  </div>
                  <div className="bg-danger/5 border border-danger/20 rounded-xl px-4 py-4 text-center transition-all duration-300 hover:scale-[1.03] hover:bg-danger/10 hover:-translate-y-0.5">
                    <div className="font-heading font-bold text-3xl text-danger/80">{counts.high}</div>
                    <div className="text-xs text-secondary-text mt-1.5 font-medium tracking-wide">High</div>
                  </div>
                  <div className="bg-medium-risk/10 border border-medium-risk/30 rounded-xl px-4 py-4 text-center transition-all duration-300 hover:scale-[1.03] hover:bg-medium-risk/15 hover:-translate-y-0.5">
                    <div className="font-heading font-bold text-3xl text-medium-risk">{counts.medium}</div>
                    <div className="text-xs text-secondary-text mt-1.5 font-medium tracking-wide">Medium</div>
                  </div>
                  <div className="bg-low-risk/10 border border-low-risk/30 rounded-xl px-4 py-4 text-center transition-all duration-300 hover:scale-[1.03] hover:bg-low-risk/15 hover:-translate-y-0.5">
                    <div className="font-heading font-bold text-3xl text-low-risk">{counts.low}</div>
                    <div className="text-xs text-secondary-text mt-1.5 font-medium tracking-wide">Low</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* EXECUTIVE SUMMARY */}
          <section className="mb-12 animate-slide-up animate-delay-200">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-7 bg-danger rounded-full" />
              <h2 className="font-heading font-bold text-2xl md:text-3xl text-primary-text">Executive Summary</h2>
            </div>
            <div className="glass-card p-7 md:p-8">
              <p className="text-secondary-text leading-[1.8] text-base md:text-[1.05rem]">
                {report?.executiveSummary || `This report summarizes the findings of an external security assessment of ${data.targetUrl}. The assessment identified vulnerabilities that could impact business operations, customer trust, and regulatory compliance. Immediate action is recommended for critical findings.`}
              </p>
              {report?.source === 'groq' && (
                <p className="text-muted-text text-xs mt-5 font-mono">Generated by AI (Groq)</p>
              )}
            </div>
          </section>

          {/* BUSINESS IMPACT */}
          <section className="mb-12 animate-slide-up animate-delay-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-7 bg-danger rounded-full" />
              <h2 className="font-heading font-bold text-2xl md:text-3xl text-primary-text">Business Impact</h2>
            </div>
            <p className="text-secondary-text text-sm mb-7 ml-4">What these vulnerabilities mean for your business</p>
            <div className="grid md:grid-cols-3 gap-5">
              {businessImpacts.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="glass-card p-7 group transition-all duration-300 hover:border-silver/50 glow-border hover:-translate-y-1 hover:shadow-lg hover:shadow-danger/5">
                    <div className={`w-12 h-12 rounded-xl mb-5 flex items-center justify-center ${
                      item.accent === 'danger' ? 'bg-danger/10 group-hover:bg-danger/20' :
                      item.accent === 'medium' ? 'bg-medium-risk/10 group-hover:bg-medium-risk/20' :
                      'bg-silver/10 group-hover:bg-silver/20'
                    } transition-colors`}>
                      <Icon className={`w-5 h-5 ${
                        item.accent === 'danger' ? 'text-danger' :
                        item.accent === 'medium' ? 'text-medium-risk' : 'text-silver'
                      }`} />
                    </div>
                    <h3 className="font-heading font-semibold text-primary-text mb-2.5 text-lg">{item.title}</h3>
                    <p className="text-secondary-text text-sm leading-[1.7]">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* PRIORITY FIXES */}
          {priorityFixes.length > 0 && (
            <section className="mb-12 animate-slide-up animate-delay-400">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-7 bg-danger rounded-full" />
                <h2 className="font-heading font-bold text-2xl md:text-3xl text-primary-text">Priority Fixes</h2>
              </div>
              <p className="text-secondary-text text-sm mb-7 ml-4">What to do immediately</p>
              <div className="space-y-3.5">
                {priorityFixes.map((fix) => (
                  <div key={fix.number} className="glass-card p-5 md:p-6 flex items-start gap-5 group hover:border-danger/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-danger/5">
                    <div className="shrink-0 w-11 h-11 rounded-xl bg-danger/10 flex items-center justify-center group-hover:bg-danger/20 transition-colors">
                      <CheckCircle2 className="w-5 h-5 text-danger" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5 mb-2">
                        <span className="font-mono text-xs text-silver font-semibold">{fix.number}</span>
                        <span className="font-heading font-semibold text-primary-text text-[0.95rem]">{fix.title}</span>
                        <SeverityBadge severity={fix.severity} />
                      </div>
                      <p className="text-secondary-text text-sm leading-relaxed">{fix.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-text shrink-0 mt-1.5 group-hover:text-danger group-hover:translate-x-0.5 transition-all" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* NEXT STEPS */}
          <section className="mb-14 animate-slide-up animate-delay-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-7 bg-silver/60 rounded-full" />
              <h2 className="font-heading font-bold text-2xl md:text-3xl text-primary-text">Recommended Next Steps</h2>
            </div>
            <div className="glass-card divide-y divide-border overflow-hidden">
              {defaultNextSteps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={idx} className="flex items-center gap-4 px-6 md:px-7 py-5 group hover:bg-card-bg/50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-silver/10 flex items-center justify-center shrink-0 group-hover:bg-silver/20 transition-colors">
                      <Icon className="w-4 h-4 text-silver" />
                    </div>
                    <div className="flex items-center gap-3.5 flex-1">
                      <CheckCircle2 className="w-4 h-4 text-silver/60 shrink-0 group-hover:text-silver transition-colors" />
                      <p className="text-secondary-text text-sm leading-relaxed group-hover:text-primary-text transition-colors">
                        {step.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* DIVIDER */}
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-12" />

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 animate-slide-up animate-delay-600">
            <Link to="/technical-report" className="flex-1 sm:flex-initial">
              <button className="btn-primary flex items-center justify-center space-x-2 px-8 py-4 w-full h-14 hover:-translate-y-0.5">
                <FileText className="w-5 h-5" />
                <span>View Technical Report</span>
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