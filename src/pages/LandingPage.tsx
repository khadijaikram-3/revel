import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Lock,
  Server,
  Database,
  Globe,
  Search,
  AlertTriangle,
  FileText,
  Eye,
  Cpu,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  FileSearch,
  ScanLine,
  ShieldAlert,
  Crosshair,
  Bug,
  Network,
  GitBranch,
  BarChart3,
  Bot,
  Files,
  UserX,
  MailX,
  Trash2,
  Clock,
  Radar,
} from 'lucide-react';

export default function LandingPage() {
  const [url, setUrl] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Methodology', href: '#methodology' },
    { name: 'Reports', href: '#reports' },
    { name: 'Privacy', href: '#privacy' },
  ];

  const threatData = {
    level: 'Elevated',
    cves: '278,421',
    owasp: '100%',
    engine: 'Online',
    ai: 'Operational',
  };

  const howItWorks = [
    {
      step: '01',
      title: 'Submit URL',
      description: 'Enter the target website URL for security assessment',
      icon: Globe,
    },
    {
      step: '02',
      title: 'AI Analyzes',
      description: 'Our AI engine scans for vulnerabilities across multiple attack vectors',
      icon: Cpu,
    },
    {
      step: '03',
      title: 'Receive Dual Reports',
      description: 'Get both executive summary and technical reports instantly',
      icon: Files,
    },
  ];

  const securityCategories = [
    { name: 'SSL', icon: Lock, description: 'Certificate validation & configuration' },
    { name: 'TLS', icon: Shield, description: 'Protocol versions & cipher suites' },
    { name: 'Headers', icon: Server, description: 'Security headers analysis' },
    { name: 'SQLi', icon: Database, description: 'SQL injection detection' },
    { name: 'XSS', icon: Bug, description: 'Cross-site scripting vectors' },
    { name: 'Ports', icon: Network, description: 'Open port scanning' },
    { name: 'DNS', icon: Globe, description: 'DNS configuration & records' },
    { name: 'CSP', icon: ShieldCheck, description: 'Content Security Policy' },
    { name: 'Server', icon: Server, description: 'Server fingerprinting' },
    { name: 'Malware', icon: AlertTriangle, description: 'Malware detection' },
    { name: 'Admin Panels', icon: Lock, description: 'Exposed admin interfaces' },
    { name: 'Subdomains', icon: GitBranch, description: 'Subdomain enumeration' },
  ];

  const methodologySteps = [
    { name: 'Recon', description: 'Passive information gathering', icon: Search },
    { name: 'Fingerprinting', description: 'Technology stack identification', icon: Crosshair },
    { name: 'TLS Analysis', description: 'Certificate & protocol inspection', icon: Lock },
    { name: 'Headers', description: 'Security headers evaluation', icon: Server },
    { name: 'Ports', description: 'Network port scanning', icon: Network },
    { name: 'Vulnerabilities', description: 'Active vulnerability detection', icon: Bug },
    { name: 'Risk Analysis', description: 'Threat prioritization', icon: BarChart3 },
    { name: 'AI Processing', description: 'Intelligent report generation', icon: Bot },
    { name: 'Reports', description: 'Dual report delivery', icon: FileText },
  ];

  const privacyFeatures = [
    { name: 'No Login', description: 'No account registration required', icon: UserX },
    { name: 'No Emails', description: 'We never ask for email addresses', icon: MailX },
    { name: 'No Storage', description: 'Scan results are not stored', icon: Trash2 },
    { name: 'No Tracking', description: 'Zero cookies or analytics', icon: Radar },
    { name: 'No Permanent Records', description: 'Data is ephemeral and temporary', icon: Clock },
  ];

  const faqs = [
    {
      question: 'What does Revel scan for?',
      answer: 'Revel performs comprehensive security assessments including SSL/TLS configuration, security headers, SQL injection vectors, XSS vulnerabilities, open ports, DNS configuration, Content Security Policy, server fingerprinting, malware indicators, exposed admin panels, and subdomain enumeration. Our coverage aligns with OWASP Top 10 and includes over 278,000 known CVEs.',
    },
    {
      question: 'Does Revel perform penetration testing?',
      answer: 'No, Revel is a security assessment tool, not a penetration testing platform. We perform non-invasive scans that identify potential vulnerabilities without exploiting them. This approach is safe for production systems and provides actionable intelligence without risk of service disruption.',
    },
    {
      question: 'Is my data stored after a scan?',
      answer: 'No. Revel operates on a zero-storage principle. All scan data is processed in memory and delivered directly to you. Once you close the report, no trace remains on our systems. Your security assessment is completely ephemeral.',
    },
    {
      question: 'Why does Revel provide two reports?',
      answer: 'We understand that security findings need to reach different audiences. The Executive Summary translates technical findings into business impact language for stakeholders and decision-makers. The Technical Report provides detailed CVE references, CVSS scores, reproduction commands, and remediation steps for security engineers and developers.',
    },
    {
      question: 'How long does a scan take?',
      answer: 'Scan duration varies based on target complexity, typically ranging from 30 seconds to 3 minutes. Our AI-powered engine optimizes scan paths for efficiency while maintaining comprehensive coverage. You will receive real-time progress updates throughout the assessment.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-[10px] border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <a href="#" className="flex items-center space-x-2.5">
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
              </a>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-secondary-text hover:text-primary-text transition-colors font-medium"
                >
                  {link.name}
                </a>
              ))}
            </div>
            <div className="flex items-center">
              <Link to="/scan">
                <button className="btn-primary flex items-center space-x-2">
                  <ScanLine className="w-4 h-4" />
                  <span>Scan Website</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Threat Intelligence Bar */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-secondary-bg border-b border-border">
        <div className="overflow-hidden">
          <div className="flex items-center justify-center py-2 space-x-2 text-sm animate-pulse">
            <span className="text-muted-text">Threat Level:</span>
            <span className="text-warning font-semibold">{threatData.level}</span>
            <span className="text-border">|</span>
            <span className="text-muted-text">Latest CVEs:</span>
            <span className="text-primary-text font-mono font-semibold">{threatData.cves}</span>
            <span className="text-border">|</span>
            <span className="text-muted-text">OWASP Coverage:</span>
            <span className="text-success font-semibold">{threatData.owasp}</span>
            <span className="text-border">|</span>
            <span className="text-muted-text">Engine:</span>
            <span className="text-success font-semibold">{threatData.engine}</span>
            <span className="text-border">|</span>
            <span className="text-muted-text">AI:</span>
            <span className="text-glow font-semibold">{threatData.ai}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-danger/5 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-danger/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-primary-text leading-tight animate-slide-up">
            Your Security Holes Are Visible.
            <br />
            <span className="text-danger">Close Them.</span>
          </h1>
          <p className="mt-6 text-secondary-text text-lg md:text-xl max-w-3xl mx-auto animate-slide-up animate-delay-100">
            AI-powered website security assessment that transforms technical vulnerabilities into actionable intelligence.
          </p>
          <p className="mt-4 font-heading font-semibold text-lg md:text-xl text-gradient animate-slide-up animate-delay-200">
            Reveal the Risk. Close the Hole.
          </p>

          {/* Scan Input */}
          <div className="mt-12 max-w-2xl mx-auto animate-slide-up animate-delay-300">
            <div className="glass-card p-2 flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-text" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full bg-secondary-bg border border-border rounded-lg pl-12 pr-4 py-4 text-primary-text placeholder:text-muted-text focus:outline-none focus:border-silver focus:ring-1 focus:ring-silver/50 transition-all duration-300"
                />
              </div>
              <Link to="/scan">
                <button className="btn-primary px-8 py-4 flex items-center justify-center space-x-2">
                  <ScanLine className="w-5 h-5" />
                  <span>Scan Website</span>
                </button>
              </Link>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-text">
              <span className="flex items-center space-x-1">
                <UserX className="w-4 h-4" />
                <span>Anonymous</span>
              </span>
              <span className="text-border">|</span>
              <span className="flex items-center space-x-1">
                <Lock className="w-4 h-4" />
                <span>No Login</span>
              </span>
              <span className="text-border">|</span>
              <span className="flex items-center space-x-1">
                <Trash2 className="w-4 h-4" />
                <span>Zero Storage</span>
              </span>
              <span className="text-border">|</span>
              <span className="flex items-center space-x-1">
                <Files className="w-4 h-4" />
                <span>Dual Reports</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="about" className="py-20 md:py-32 bg-secondary-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">Security Assessment in Three Steps</h2>
            <p className="section-subtitle">
              From URL submission to comprehensive reports in under three minutes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {howItWorks.map((step, index) => (
              <div key={step.step} className="relative">
                <div className="glass-card p-8 text-center group hover:border-danger/50 transition-all duration-300 glow-border">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-danger/10 flex items-center justify-center group-hover:bg-danger/20 transition-colors">
                    <step.icon className="w-8 h-8 text-danger" />
                  </div>
                  <div className="font-mono text-sm text-silver mb-2">Step {step.step}</div>
                  <h3 className="font-heading font-semibold text-xl text-primary-text mb-3">
                    {step.title}
                  </h3>
                  <p className="text-secondary-text">{step.description}</p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <div className="w-8 h-8 rounded-full bg-card-bg border border-border flex items-center justify-center animate-pulse">
                      <ChevronRight className="w-4 h-4 text-danger" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Coverage Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">What Revel Detects</h2>
            <p className="section-subtitle">
              Comprehensive security coverage powered by AI-driven threat intelligence
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {securityCategories.map((category) => (
              <div
                key={category.name}
                className="group glass-card p-6 text-center cursor-pointer hover:border-silver/50 transition-all duration-300"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-card-bg border border-border flex items-center justify-center group-hover:border-silver/50 group-hover:bg-silver/10 transition-all duration-300">
                  <category.icon className="w-6 h-6 text-muted-text group-hover:text-silver transition-colors" />
                </div>
                <h3 className="font-heading font-semibold text-primary-text mb-2">
                  {category.name}
                </h3>
                <p className="text-secondary-text text-sm">{category.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section id="methodology" className="py-20 md:py-32 bg-secondary-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">Assessment Methodology</h2>
            <p className="section-subtitle">
              A systematic approach to comprehensive security analysis
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-danger via-silver to-danger" />

            <div className="space-y-8">
              {methodologySteps.map((step, index) => (
                <div
                  key={step.name}
                  className="relative pl-16 md:pl-20"
                >
                  <div className="absolute left-3 md:left-5 w-6 h-6 rounded-full bg-card-bg border-2 border-danger flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-danger" />
                  </div>

                  <div className="glass-card p-6 group hover:border-danger/50 transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-danger/10 flex items-center justify-center shrink-0 group-hover:bg-danger/20 transition-colors">
                        <step.icon className="w-5 h-5 text-danger" />
                      </div>
                      <div>
                        <h3 className="font-heading font-semibold text-lg text-primary-text mb-1">
                          {step.name}
                        </h3>
                        <p className="text-secondary-text">{step.description}</p>
                      </div>
                    </div>
                  </div>

                  {index < methodologySteps.length - 1 && (
                    <div className="absolute left-[27px] md:left-[35px] top-full h-8 flex items-center justify-center">
                      <ChevronDown className="w-4 h-4 text-silver animate-bounce" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI Dual Reports Section */}
      <section id="reports" className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">Two Reports. One Assessment.</h2>
            <p className="section-subtitle">
              Tailored intelligence for both business stakeholders and security professionals
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Executive Summary */}
            <div className="glass-card overflow-hidden">
              <div className="bg-danger/10 px-6 py-4 border-b border-border">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-danger" />
                  <h3 className="font-heading font-semibold text-lg text-primary-text">
                    Executive Summary
                  </h3>
                </div>
              </div>
              <div className="p-6 bg-white/[0.02]">
                <div className="space-y-4">
                  <div className="h-4 bg-card-bg rounded w-3/4" />
                  <div className="h-3 bg-card-bg/50 rounded w-full" />
                  <div className="h-3 bg-card-bg/50 rounded w-5/6" />
                  <div className="h-3 bg-card-bg/50 rounded w-full" />
                  <div className="h-3 bg-card-bg/50 rounded w-4/6" />
                  <div className="mt-6 p-4 bg-danger/10 border border-danger/30 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-danger" />
                      <span className="font-semibold text-danger">Business Impact</span>
                    </div>
                    <div className="h-3 bg-card-bg/50 rounded w-full" />
                    <div className="h-3 bg-card-bg/50 rounded w-4/5 mt-2" />
                  </div>
                  <div className="mt-4 p-4 bg-success/10 border border-success/30 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <ShieldCheck className="w-4 h-4 text-success" />
                      <span className="font-semibold text-success">Recommendations</span>
                    </div>
                    <div className="h-3 bg-card-bg/50 rounded w-full" />
                    <div className="h-3 bg-card-bg/50 rounded w-3/4 mt-2" />
                  </div>
                </div>
                <p className="mt-4 text-sm text-secondary-text flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  Plain English analysis for stakeholders
                </p>
              </div>
            </div>

            {/* Technical Report */}
            <div className="glass-card overflow-hidden">
              <div className="bg-danger/10 px-6 py-4 border-b border-border">
                <div className="flex items-center space-x-3">
                  <FileSearch className="w-5 h-5 text-danger" />
                  <h3 className="font-heading font-semibold text-lg text-primary-text">
                    Technical Report
                  </h3>
                </div>
              </div>
              <div className="p-6 bg-white/[0.02] font-mono text-sm">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-danger font-semibold">CVSS:</span>
                    <span className="text-danger">9.8</span>
                    <span className="text-warning ml-2">CRITICAL</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-secondary-text">CVE:</span>
                    <span className="text-primary-text">CVE-2024-1234</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-secondary-text">OWASP:</span>
                    <span className="text-danger">A01:2021</span>
                  </div>
                  <div className="mt-4 p-3 bg-card-bg rounded border border-border">
                    <div className="text-secondary-text text-xs mb-1">REPRODUCTION</div>
                    <code className="text-primary-text">curl -X POST https://target/api</code>
                  </div>
                  <div className="mt-4 p-3 bg-card-bg rounded border border-border">
                    <div className="text-secondary-text text-xs mb-1">REMEDIATION</div>
                    <div className="h-3 bg-border/50 rounded w-full mt-1" />
                    <div className="h-3 bg-border/50 rounded w-4/5 mt-2" />
                  </div>
                </div>
                <p className="mt-4 text-secondary-text flex items-center text-sm font-body">
                  <Eye className="w-4 h-4 mr-2" />
                  Detailed technical specifications
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section id="privacy" className="py-20 md:py-32 bg-secondary-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">Anonymous by Design</h2>
            <p className="section-subtitle">
              Your privacy is not a feature. It is our foundation.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {privacyFeatures.map((feature) => (
              <div
                key={feature.name}
                className="glass-card p-6 text-center group hover:border-danger/50 transition-all duration-300"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-danger/10 flex items-center justify-center group-hover:bg-danger/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-danger" />
                </div>
                <h3 className="font-heading font-semibold text-primary-text mb-2">
                  {feature.name}
                </h3>
                <p className="text-secondary-text text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle">
              Clear answers to common questions about Revel
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="glass-card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-card-bg/50 transition-colors"
                >
                  <span className="font-heading font-semibold text-primary-text pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-secondary-text shrink-0 transition-transform duration-300 ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === index ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="px-6 pb-4 text-secondary-text">{faq.answer}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-secondary-bg border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col items-center md:items-start">
              <div className="flex items-center space-x-2 mb-2">
                <ShieldAlert className="w-6 h-6 text-silver" />
                <span className="font-heading font-bold text-xl text-primary-text">Revel</span>
              </div>
              <p className="text-secondary-text text-sm">Reveal the Risk. Close the Hole.</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <a href="#about" className="text-secondary-text hover:text-silver transition-colors">
                About
              </a>
              <a href="#methodology" className="text-secondary-text hover:text-silver transition-colors">
                Methodology
              </a>
              <a href="#" className="text-secondary-text hover:text-silver transition-colors">
                Documentation
              </a>
              <a href="#privacy" className="text-secondary-text hover:text-silver transition-colors">
                Privacy
              </a>
              <a href="#" className="text-secondary-text hover:text-silver transition-colors">
                Contact
              </a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <p className="text-muted-text text-sm">
              &copy; 2026 Revel. All rights reserved.
            </p>
            <p className="text-muted-text text-xs">
              Developed for DYLP Vibe Coding Hackathon 2026
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
