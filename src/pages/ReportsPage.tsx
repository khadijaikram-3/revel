import { useEffect, useState } from 'react';
import { FileText, FileSearch, Download, AlertTriangle, Shield, Server, Globe, Lock } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const vulnerabilities = [
  {
    id: 1,
    title: 'SQL Injection detected',
    severity: 'Critical',
    cvss: 9.8,
    description: 'SQL injection vulnerability found in login form parameter. Attacker can extract sensitive database information.',
    borderClass: 'glass-card-danger',
    severityColor: 'text-danger',
    bgSeverity: 'bg-danger/10',
  },
  {
    id: 2,
    title: 'Missing Security Headers',
    severity: 'High',
    cvss: 7.5,
    description: 'Critical security headers (X-Frame-Options, CSP, X-Content-Type-Options) are not configured.',
    borderClass: 'glass-card-danger',
    severityColor: 'text-danger',
    bgSeverity: 'bg-danger/10',
  },
  {
    id: 3,
    title: 'Open Port 3306',
    severity: 'Medium',
    cvss: 5.4,
    description: 'MySQL database port is exposed to the internet, allowing potential brute force attacks.',
    borderClass: 'glass-card-medium',
    severityColor: 'text-medium-risk',
    bgSeverity: 'bg-medium-risk/10',
  },
  {
    id: 4,
    title: 'Outdated Server Header',
    severity: 'Low',
    cvss: 3.1,
    description: 'Server header reveals exact version information, aiding attackers in targeting known vulnerabilities.',
    borderClass: 'glass-card-low',
    severityColor: 'text-low-risk',
    bgSeverity: 'bg-low-risk/10',
  },
];

export default function ReportsPage() {
  const [animatedScore, setAnimatedScore] = useState(0);
  const score = 72;
  const gaugeCircumference = 283;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const gaugeOffset = gaugeCircumference - (animatedScore / 100) * gaugeCircumference;
  const needleAngle = -90 + (animatedScore / 100) * 180;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="font-heading font-bold text-3xl md:text-4xl text-primary-text mb-4">
              Security Assessment Complete
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
              <div className="flex items-center space-x-2 text-secondary-text text-sm">
                <Globe className="w-4 h-4" />
                <span>Target: https://example.com</span>
              </div>
              <div className="flex items-center space-x-2 text-secondary-text text-sm">
                <span className="text-muted-text">|</span>
                <span>Date: July 8, 2026</span>
              </div>
              <div className="flex items-center space-x-2 text-secondary-text text-sm">
                <span className="text-muted-text">|</span>
                <span>Duration: 2m 34s</span>
              </div>
            </div>
            <span className="badge-enterprise">Assessment ID: #REV-2026-001</span>
          </div>

          {/* Risk Score Gauge */}
          <div className="flex justify-center mb-12">
            <div className="relative w-64 h-40">
              <svg className="w-full h-full" viewBox="0 0 100 60">
                {/* Background arc */}
                <path
                  d="M 10 55 A 40 40 0 0 1 90 55"
                  fill="none"
                  stroke="#2C2C2C"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                {/* Filled arc */}
                <path
                  d="M 10 55 A 40 40 0 0 1 90 55"
                  fill="none"
                  stroke="#E11D48"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={gaugeCircumference}
                  strokeDashoffset={gaugeOffset}
                  className="transition-all duration-1500 ease-out"
                  style={{ transform: 'rotate(0deg)', transformOrigin: 'center' }}
                />
                {/* Center text */}
                <text
                  x="50"
                  y="42"
                  textAnchor="middle"
                  className="font-heading font-bold text-2xl fill-primary-text"
                >
                  {animatedScore}/100
                </text>
                <text
                  x="50"
                  y="52"
                  textAnchor="middle"
                  className="font-heading font-semibold text-xs fill-danger"
                >
                  HIGH RISK
                </text>
              </svg>
              {/* Needle */}
              <div
                className="absolute bottom-0 left-1/2 w-1 h-12 bg-silver origin-bottom transition-transform duration-1500 ease-out rounded-full"
                style={{ transform: `translateX(-50%) rotate(${needleAngle}deg)` }}
              />
              <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-white rounded-full -translate-x-1/2 translate-y-1/2" />
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="glass-card-danger p-6 text-center animate-card-enter" style={{animationDelay: '100ms'}}>
              <div className="text-4xl font-heading font-bold text-danger mb-2">3</div>
              <div className="text-secondary-text text-sm font-medium">Critical</div>
            </div>
            <div className="glass-card-medium p-6 text-center animate-card-enter" style={{animationDelay: '200ms'}}>
              <div className="text-4xl font-heading font-bold text-medium-risk mb-2">4</div>
              <div className="text-secondary-text text-sm font-medium">Medium</div>
            </div>
            <div className="glass-card-low p-6 text-center animate-card-enter" style={{animationDelay: '300ms'}}>
              <div className="text-4xl font-heading font-bold text-low-risk mb-2">5</div>
              <div className="text-secondary-text text-sm font-medium">Low</div>
            </div>
            <div className="glass-card p-6 text-center animate-card-enter" style={{animationDelay: '400ms'}}>
              <div className="text-4xl font-heading font-bold text-silver mb-2">12</div>
              <div className="text-secondary-text text-sm font-medium">Total Issues</div>
            </div>
          </div>

          {/* Vulnerability List */}
          <div className="mb-12">
            <h2 className="font-heading font-semibold text-2xl text-primary-text mb-6">
              Identified Vulnerabilities
            </h2>
            <div className="space-y-4">
              {vulnerabilities.map((vuln, index) => (
                <div
                  key={vuln.id}
                  className={`${vuln.borderClass} p-6 animate-card-enter`}
                  style={{ animationDelay: `${(index + 1) * 100}ms` }}
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-heading font-semibold text-lg text-primary-text">
                          {vuln.title}
                        </h3>
                        <span
                          className={`${vuln.bgSeverity} ${
                            vuln.severityColor
                          } text-xs font-semibold px-2 py-1 rounded`}
                        >
                          {vuln.severity}
                        </span>
                      </div>
                      <p className="text-secondary-text text-sm mb-3">{vuln.description}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-muted-text text-xs uppercase tracking-wide mb-1">
                          CVSS Score
                        </div>
                        <div className={`text-2xl font-heading font-bold ${vuln.severityColor}`}>
                          {vuln.cvss}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <button className="btn-primary flex items-center space-x-2 px-8 py-4">
              <FileText className="w-5 h-5" />
              <span>View Executive Report</span>
            </button>
            <button className="btn-outline flex items-center space-x-2 px-8 py-4">
              <FileSearch className="w-5 h-5" />
              <span>View Technical Report</span>
            </button>
            <button className="btn-silver flex items-center space-x-2 px-8 py-4">
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
