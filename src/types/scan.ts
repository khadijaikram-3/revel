/**
 * Shared TypeScript types for scan data and reports.
 */

export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';

export type ScanStatus = 'pending' | 'scanning' | 'analyzing' | 'complete' | 'failed';

export interface VulnerabilityReference {
  label: string;
  url: string;
}

export interface Vulnerability {
  id: string;
  severity: Severity;
  title: string;
  cvss: number;
  cve: string;
  owasp: string;
  description: string;
  evidence: string;
  reproduction: string;
  remediation: string;
  references?: VulnerabilityReference[];
}

export interface BusinessImpact {
  title: string;
  description: string;
}

export interface PriorityFix {
  number: string;
  title: string;
  description: string;
  severity: Severity;
}

export interface VulnerabilityCounts {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface ExecutiveReport {
  source: 'api' | 'openrouter';
  riskScore: number;
  riskLevel: string;
  executiveSummary: string;
  businessImpacts: BusinessImpact[];
  priorityFixes: PriorityFix[];
  vulnerabilityCounts: VulnerabilityCounts;
}

export interface TechnicalReport {
  source: 'api' | 'openrouter';
  riskScore: number;
  riskLevel: string;
  executiveSummary: string;
  vulnerabilities: Vulnerability[];
  summaryTable: {
    severity: Severity;
    vulnerability: string;
    cvss: number;
    status: string;
  }[];
}

export interface ScanData {
  scanId: string;
  status: ScanStatus;
  targetUrl: string;
  riskScore: number | null;
  riskLevel: string | null;
  vulnerabilities: Vulnerability[] | null;
  executiveReport: ExecutiveReport | null;
  technicalReport: TechnicalReport | null;
  duration: string | null;
  createdAt: string;
  completedAt: string | null;
}