import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, FileSearch, Download, Globe } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useScan } from '../context/ScanContext';
import type { ScanData } from '../types/scan';

const severityConfig: Record<string, { borderClass: string; severityColor: string; bgSeverity: string }> = {
  Critical: { borderClass: 'glass-card-danger', severityColor: 'text-danger', bgSeverity: 'bg-danger/10' },
  High: { borderClass: 'glass-card-danger', severityColor: 'text-danger', bgSeverity: 'bg-danger/10' },
  Medium: { borderClass: 'glass-card-medium', severityColor: 'text-medium-risk', bgSeverity: 'bg-medium-risk/10' },
  Low: { borderClass: 'glass-card-low', severityColor: 'text-low-risk', bgSeverity: 'bg-low-risk/10' },
};

function formatDate(iso: string | null): string {
  if (!iso) return 'N/A';
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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

export default function ReportsPage() {
  const [animatedFill, setAnimatedFill] = useState(0);
  const { scanData } = useScan();

  const data: ScanData | null = scanData;
  const score = data?.riskScore ?? 0;
  const vulnerabilities = data?.vulnerabilities ?? [];
  const riskLevel = data?.riskLevel ?? 'N/A';

  const counts = vulnerabilities.reduce(
    (acc, v) => {
      const sev = v.severity;
      if (sev === 'Critical') acc.critical++;
      else if (sev === 'High') acc.high++;
      else if (sev === 'Medium') acc.medium++;
      else if (sev === 'Low') acc.low++;
      return acc;
    },
    { critical: 0, high: 0, medium: 0, low: 0 }
  );

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedFill(score), 300);
    return () => clearTimeout(timer);
  }, [score]);

  const displayDate = data ? formatDate(data.completedAt || data.createdAt) : 'N/A';
  const assessmentId = data ? getAssessmentId(data.createdAt) : '#REV-2026-001';

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 pt-32 pb-20 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-card-bg border border-border flex items-center justify-center">
              <FileText className="w-7 h-7 text-muted-text" />
            </div>
            <p className="text-secondary-text text-lg mb-8 leading-relaxed">No scan data available.</p>
            <Link to="/scan">
              <button className="btn-primary px-8 py-3.5">Run a Scan</button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 md:pb-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-16 md:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-success/10 border border-success/30">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-success text-xs font-mono font-semibold tracking-widest uppercase">Scan Complete</span>
            </div>
            <h1 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-primary-text mb-5 leading-[1.1] tracking-tight">
              Security Assessment
              <span className="block text-gradient mt-1">Complete</span>
            </h1>
            <p className="text-secondary-text text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
              Your security assessment has finished. Review the findings and recommended actions below.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 mb-6 text-sm text-secondary-text">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-silver" />
                <span className="text-muted-text">Target:</span>
                <span className="text-primary-text font-medium font-mono">{data.targetUrl}</span>
              </div>
              <span className="text-border hidden sm:block">|</span>
              <div className="flex items-center space-x-2">
                <span className="text-muted-text">Date:</span>
                <span className="text-primary-text font-medium">{displayDate}</span>
              </div>
              <span className="text-border hidden sm:block">|</span>
              <div className="flex items-center space-x-2">
                <span className="text-muted-text">Duration:</span>
                <span className="text-primary-text font-medium">{data.duration || 'N/A'}</span>
              </div>
            </div>
            <span className="badge-enterprise inline-block tracking-[0.12em]">Assessment ID: {assessmentId}</span>
          </div>

          {/* Risk Score Gauge */}
          <div className="flex justify-center mb-16 md:mb-20">
            <div className="hexagon-gauge">
              <div
                className="hexagon-fill"
                style={{ height: `${animatedFill}%` }}
              />
              <div className="hexagon-content">
                <span className="hexagon-score font-heading">{score}</span>
                <span className="hexagon-label font-heading">{riskLevel.toUpperCase()} RISK</span>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 mb-16 md:mb-20">
            <div className="glass-card-danger p-6 md:p-7 text-center animate-card-enter rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-danger/10" style={{ animationDelay: '100ms' }}>
              <div className="text-4xl md:text-5xl font-heading font-bold text-danger mb-2 leading-none">{counts.critical}</div>
              <div className="text-secondary-text text-sm font-medium tracking-wide">Critical</div>
            </div>
            <div className="glass-card-medium p-6 md:p-7 text-center animate-card-enter rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-medium-risk/10" style={{ animationDelay: '200ms' }}>
              <div className="text-4xl md:text-5xl font-heading font-bold text-medium-risk mb-2 leading-none">{counts.medium}</div>
              <div className="text-secondary-text text-sm font-medium tracking-wide">Medium</div>
            </div>
            <div className="glass-card-low p-6 md:p-7 text-center animate-card-enter rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-low-risk/10" style={{ animationDelay: '300ms' }}>
              <div className="text-4xl md:text-5xl font-heading font-bold text-low-risk mb-2 leading-none">{counts.low}</div>
              <div className="text-secondary-text text-sm font-medium tracking-wide">Low</div>
            </div>
            <div className="glass-card p-6 md:p-7 text-center animate-card-enter rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-silver/10" style={{ animationDelay: '400ms' }}>
              <div className="text-4xl md:text-5xl font-heading font-bold text-silver mb-2 leading-none">{vulnerabilities.length}</div>
              <div className="text-secondary-text text-sm font-medium tracking-wide">Total Issues</div>
            </div>
          </div>

          {/* Vulnerability List */}
          <div className="mb-16 md:mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 bg-danger rounded-full" />
              <h2 className="font-heading font-bold text-2xl md:text-3xl text-primary-text tracking-tight">
                Identified Vulnerabilities
              </h2>
            </div>
            <div className="space-y-4 md:space-y-5">
              {vulnerabilities.map((vuln, index) => {
                const cfg = severityConfig[vuln.severity] || severityConfig.Low;
                return (
                  <div
                    key={vuln.id || index}
                    className={`${cfg.borderClass} p-6 md:p-7 animate-card-enter rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-danger/5`}
                    style={{ animationDelay: `${(index + 1) * 100}ms` }}
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <h3 className="font-heading font-semibold text-lg md:text-xl text-primary-text leading-tight">
                            {vuln.title}
                          </h3>
                          <span className={`${cfg.bgSeverity} ${cfg.severityColor} text-xs font-semibold font-mono px-2.5 py-1 rounded-md tracking-wide`}>
                            {vuln.severity}
                          </span>
                        </div>
                        <p className="text-secondary-text text-sm md:text-[0.95rem] leading-[1.7]">{vuln.description}</p>
                      </div>
                      <div className="flex items-center gap-4 md:pl-6 md:border-l md:border-border shrink-0">
                        <div className="text-right">
                          <div className="text-muted-text text-xs uppercase tracking-wider mb-1.5">
                            CVSS Score
                          </div>
                          <div className={`text-3xl font-heading font-bold ${cfg.severityColor} leading-none`}>
                            {vuln.cvss}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4">
            <Link to="/executive-report" className="flex-1 sm:flex-initial">
              <button className="btn-primary flex items-center justify-center space-x-2 px-8 py-4 w-full sm:w-auto h-14 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-danger/30">
                <FileText className="w-5 h-5" />
                <span>View Executive Report</span>
              </button>
            </Link>
            <Link to="/technical-report" className="flex-1 sm:flex-initial">
              <button className="btn-outline flex items-center justify-center space-x-2 px-8 py-4 w-full sm:w-auto h-14 transition-all duration-300 hover:-translate-y-0.5">
                <FileSearch className="w-5 h-5" />
                <span>View Technical Report</span>
              </button>
            </Link>
            <button className="btn-silver flex items-center justify-center space-x-2 px-8 py-4 w-full sm:w-auto h-14 transition-all duration-300 hover:-translate-y-0.5">
              <Download className="w-5 h-5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
