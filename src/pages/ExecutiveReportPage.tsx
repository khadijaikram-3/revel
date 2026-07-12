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
  Database,
  Lock,
  Shield,
  RefreshCw,
  ClipboardList,
} from 'lucide-react';
import Footer from '../components/Footer';

const SCORE = 72;

const businessImpacts = [
  {
    icon: TrendingDown,
    title: 'Customer Data Exposure',
    description:
      'Attackers could steal customer information, leading to privacy violations and loss of trust.',
    accent: 'danger',
  },
  {
    icon: ServerCrash,
    title: 'Operational Disruption',
    description:
      'Exploitation could cause service outages, affecting revenue and user experience.',
    accent: 'medium',
  },
  {
    icon: Megaphone,
    title: 'Reputational Damage',
    description:
      'Public disclosure of vulnerabilities could harm your brand image.',
    accent: 'silver',
  },
];

const priorityFixes = [
  {
    number: '01',
    icon: Database,
    title: 'Close database port 3306',
    description: 'Contact your hosting provider to block external access.',
    severity: 'Critical',
  },
  {
    number: '02',
    icon: Lock,
    title: 'Enable HTTPS',
    description: 'Install an SSL certificate to encrypt user data.',
    severity: 'Critical',
  },
  {
    number: '03',
    icon: Shield,
    title: 'Add authentication to admin panel',
    description: 'Require strong passwords and multi-factor authentication.',
    severity: 'High',
  },
  {
    number: '04',
    icon: ClipboardList,
    title: 'Update security headers',
    description: 'Add CSP, HSTS, and X-Frame-Options.',
    severity: 'Medium',
  },
  {
    number: '05',
    icon: RefreshCw,
    title: 'Update outdated frameworks',
    description: 'Run a security update on all dependencies.',
    severity: 'Medium',
  },
];

const nextSteps = [
  {
    icon: FileText,
    text: 'Review the full Technical Report for detailed remediation steps.',
  },
  {
    icon: Calendar,
    text: 'Schedule a follow-up security assessment after fixes are applied.',
  },
  {
    icon: Shield,
    text: 'Consider a full penetration test for comprehensive coverage.',
  },
];

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    Critical: 'bg-danger/15 text-danger border border-danger/30',
    High: 'bg-danger/10 text-danger/80 border border-danger/20',
    Medium: 'bg-medium-risk/15 text-orange-400 border border-medium-risk/30',
    Low: 'bg-low-risk/15 text-emerald-400 border border-low-risk/30',
  };
  return (
    <span
      className={`text-xs font-semibold font-mono px-2.5 py-1 rounded ${map[severity] ?? ''}`}
    >
      {severity.toUpperCase()}
    </span>
  );
}

export default function ExecutiveReportPage() {
  const [animatedFill, setAnimatedFill] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedFill(SCORE), 400);
    return () => clearTimeout(timer);
  }, []);

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
            <div className="hidden md:flex items-center space-x-6 text-sm text-secondary-text font-medium">
              <a href="/#about" className="hover:text-primary-text transition-colors">About</a>
              <a href="/#methodology" className="hover:text-primary-text transition-colors">Methodology</a>
              <a href="/#reports" className="hover:text-primary-text transition-colors">Reports</a>
              <a href="/#privacy" className="hover:text-primary-text transition-colors">Privacy</a>
            </div>
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

          {/* ── HEADER ───────────────────────────────────────────── */}
          <div className="text-center mb-12 animate-slide-up">
            <span className="badge-enterprise inline-block mb-5">Executive Summary</span>
            <h1 className="font-heading font-bold text-4xl md:text-5xl text-primary-text mb-4 leading-tight">
              Security Assessment Report
            </h1>
            <p className="text-secondary-text text-lg mb-8">
              Plain-English analysis for business stakeholders
            </p>

            {/* Scan details */}
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
            </div>

            <span className="badge-enterprise inline-block">Assessment ID: #REV-2026-001</span>
          </div>

          {/* ── RISK SUMMARY CARD ─────────────────────────────────── */}
          <div
            className="glass-card-danger p-8 mb-10 animate-slide-up animate-delay-100"
            style={{ boxShadow: '0 0 40px rgba(225, 29, 72, 0.18)' }}
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Score */}
              <div className="flex flex-col items-center shrink-0">
                <div className="relative w-36 h-36">
                  <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                    <circle
                      cx="60" cy="60" r="50"
                      fill="none"
                      stroke="#2C2C2C"
                      strokeWidth="10"
                    />
                    <circle
                      cx="60" cy="60" r="50"
                      fill="none"
                      stroke="#E11D48"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray="314.16"
                      strokeDashoffset={314.16 - (314.16 * animatedFill) / 100}
                      style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-heading font-bold text-4xl text-primary-text leading-none">{SCORE}</span>
                    <span className="font-heading font-semibold text-xs text-danger mt-1 tracking-widest">/ 100</span>
                  </div>
                </div>
                <span className="font-heading font-bold text-sm text-danger tracking-widest mt-3 uppercase">
                  High Risk
                </span>
              </div>

              {/* Summary text + counts */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-start gap-3 mb-5">
                  <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                  <p className="text-primary-text font-medium text-lg leading-snug">
                    Your website has 3 critical vulnerabilities that require immediate attention.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-danger/10 border border-danger/30 rounded-lg px-4 py-3 text-center">
                    <div className="font-heading font-bold text-3xl text-danger">3</div>
                    <div className="text-xs text-secondary-text mt-1 font-medium">Critical</div>
                  </div>
                  <div className="bg-medium-risk/10 border border-medium-risk/30 rounded-lg px-4 py-3 text-center">
                    <div className="font-heading font-bold text-3xl text-orange-400">4</div>
                    <div className="text-xs text-secondary-text mt-1 font-medium">Medium</div>
                  </div>
                  <div className="bg-low-risk/10 border border-low-risk/30 rounded-lg px-4 py-3 text-center">
                    <div className="font-heading font-bold text-3xl text-emerald-400">5</div>
                    <div className="text-xs text-secondary-text mt-1 font-medium">Low</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── EXECUTIVE SUMMARY ─────────────────────────────────── */}
          <section className="mb-10 animate-slide-up animate-delay-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 bg-danger rounded-full" />
              <h2 className="font-heading font-bold text-2xl text-primary-text">Executive Summary</h2>
            </div>
            <div className="glass-card p-6">
              <p className="text-secondary-text leading-relaxed text-base">
                This report summarizes the findings of an external security assessment of{' '}
                <span className="text-silver font-medium">https://example.com</span>. The assessment
                identified vulnerabilities that could impact business operations, customer trust,
                and regulatory compliance. Immediate action is recommended for critical findings.
              </p>
            </div>
          </section>

          {/* ── BUSINESS IMPACT ───────────────────────────────────── */}
          <section className="mb-10 animate-slide-up animate-delay-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-6 bg-danger rounded-full" />
              <h2 className="font-heading font-bold text-2xl text-primary-text">Business Impact</h2>
            </div>
            <p className="text-secondary-text text-sm mb-6 ml-4">
              What these vulnerabilities mean for your business
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {businessImpacts.map((item) => (
                <div
                  key={item.title}
                  className={`glass-card p-6 group transition-all duration-300 hover:border-${item.accent === 'danger' ? 'danger' : item.accent === 'medium' ? 'medium-risk' : 'silver'}/50 glow-border`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl mb-4 flex items-center justify-center ${
                      item.accent === 'danger'
                        ? 'bg-danger/10 group-hover:bg-danger/20'
                        : item.accent === 'medium'
                        ? 'bg-medium-risk/10 group-hover:bg-medium-risk/20'
                        : 'bg-silver/10 group-hover:bg-silver/20'
                    } transition-colors`}
                  >
                    <item.icon
                      className={`w-5 h-5 ${
                        item.accent === 'danger'
                          ? 'text-danger'
                          : item.accent === 'medium'
                          ? 'text-orange-400'
                          : 'text-silver'
                      }`}
                    />
                  </div>
                  <h3 className="font-heading font-semibold text-primary-text mb-2">
                    {item.title}
                  </h3>
                  <p className="text-secondary-text text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ── PRIORITY FIXES ────────────────────────────────────── */}
          <section className="mb-10 animate-slide-up animate-delay-400">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-6 bg-danger rounded-full" />
              <h2 className="font-heading font-bold text-2xl text-primary-text">Priority Fixes</h2>
            </div>
            <p className="text-secondary-text text-sm mb-6 ml-4">What to do immediately</p>

            <div className="space-y-3">
              {priorityFixes.map((fix, idx) => (
                <div
                  key={fix.number}
                  className="glass-card p-5 flex items-start gap-5 group hover:border-danger/40 transition-all duration-300"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-danger/10 flex items-center justify-center group-hover:bg-danger/20 transition-colors">
                    <fix.icon className="w-5 h-5 text-danger" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <span className="font-mono text-xs text-silver font-semibold">{fix.number}</span>
                      <span className="font-heading font-semibold text-primary-text">
                        {fix.title}
                      </span>
                      <SeverityBadge severity={fix.severity} />
                    </div>
                    <p className="text-secondary-text text-sm">{fix.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-text shrink-0 mt-1 group-hover:text-danger transition-colors" />
                </div>
              ))}
            </div>
          </section>

          {/* ── NEXT STEPS ────────────────────────────────────────── */}
          <section className="mb-12 animate-slide-up animate-delay-500">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-6 bg-silver/60 rounded-full" />
              <h2 className="font-heading font-bold text-2xl text-primary-text">
                Recommended Next Steps
              </h2>
            </div>

            <div className="glass-card divide-y divide-border overflow-hidden">
              {nextSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 px-6 py-5 group hover:bg-card-bg/50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-silver/10 flex items-center justify-center shrink-0 group-hover:bg-silver/20 transition-colors">
                    <step.icon className="w-4 h-4 text-silver" />
                  </div>
                  <div className="flex items-center gap-3 flex-1">
                    <CheckCircle2 className="w-4 h-4 text-silver/60 shrink-0" />
                    <p className="text-secondary-text text-sm leading-relaxed group-hover:text-primary-text transition-colors">
                      {step.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── DIVIDER ───────────────────────────────────────────── */}
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-10" />

          {/* ── ACTION BUTTONS ────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 animate-slide-up animate-delay-600">
            <Link to="/technical-report">
              <button className="btn-primary flex items-center justify-center space-x-2 px-8 py-4">
                <FileText className="w-5 h-5" />
                <span>View Technical Report</span>
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
