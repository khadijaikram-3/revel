/**
 * Groq AI integration for generating Executive and Technical reports.
 * Uses the mixtral-8x7b-32768 model via the Groq API.
 */

import axios from 'axios';

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'mixtral-8x7b-32768'; // ✅ Fixed: working model

async function callGroq(systemPrompt, userPrompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.log('[groq] No API key — skipping Groq call');
    throw new Error('GROQ_API_KEY is not configured');
  }

  console.log('[groq] Calling Groq API — model:', GROQ_MODEL, '— key:', `${apiKey.substring(0, 8)}...`);

  try {
    const response = await axios.post(
      GROQ_ENDPOINT,
      {
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    console.log('[groq] Response status:', response.status);
    const content = response.data?.choices?.[0]?.message?.content || '';
    console.log('[groq] Response length:', content.length, 'chars');
    return content;
  } catch (error) {
    console.error('[groq] API call failed:', error.response?.status, error.response?.data || error.message);
    throw new Error(`Groq API error: ${error.response?.status || 'unknown'}`);
  }
}

async function generateExecutiveReport(scanData) {
  const systemPrompt =
    'You are a cybersecurity analyst. Generate an Executive Report from the following scan data. ' +
    'The report should include: Risk Score (0-100), Risk Level (High/Medium/Low), ' +
    'Executive Summary (2-3 sentences, plain English), Business Impact (explain what the vulnerabilities mean for the business), ' +
    'Priority Fixes (5 actionable steps, no jargon), Vulnerability Counts (Critical, High, Medium, Low). ' +
    'Use plain English. No technical jargon. Focus on business impact. ' +
    'Return your response as a JSON object with keys: riskScore, riskLevel, executiveSummary, businessImpacts (array of {title, description}), priorityFixes (array of {number, title, description, severity}), vulnerabilityCounts ({critical, high, medium, low}).';

  const userPrompt = `Scan Data:\n${JSON.stringify(scanData, null, 2)}`;

  try {
    console.log('[groq] Generating executive report...');
    const text = await callGroq(systemPrompt, userPrompt);
    const parsed = JSON.parse(text);
    console.log('[groq] Executive report parsed OK — riskScore:', parsed.riskScore);
    return { source: 'groq', ...parsed };
  } catch (error) {
    console.error('[groq] Executive report generation failed:', error.message);
    return generateMockExecutiveReport(scanData);
  }
}

async function generateTechnicalReport(scanData) {
  const systemPrompt =
    'You are a cybersecurity engineer. Generate a Technical Report from the following scan data. ' +
    'The report should include: Risk Score (0-100), Risk Level (High/Medium/Low), ' +
    'Vulnerability Details (for each vulnerability: title, CVSS score, CVE reference if applicable, OWASP mapping, description, evidence (HTTP request/response), reproduction steps (curl command), remediation (exact commands)), ' +
    'Summary Table (Severity, Vulnerability, CVSS, Status). ' +
    'Use technical language. Include exact commands. Reference CVSS, CVE, OWASP where applicable. ' +
    'Return your response as a JSON object with keys: riskScore, riskLevel, executiveSummary, vulnerabilities (array with all fields), summaryTable (array of {severity, vulnerability, cvss, status}).';

  const userPrompt = `Scan Data:\n${JSON.stringify(scanData, null, 2)}`;

  try {
    console.log('[groq] Generating technical report...');
    const text = await callGroq(systemPrompt, userPrompt);
    const parsed = JSON.parse(text);
    console.log('[groq] Technical report parsed OK — riskScore:', parsed.riskScore, '— vulns:', parsed.vulnerabilities?.length || 0);
    return { source: 'groq', ...parsed };
  } catch (error) {
    console.error('[groq] Technical report generation failed:', error.message);
    return generateMockTechnicalReport(scanData);
  }
}

async function generateReports(scanData) {
  console.log('[groq] Generating both reports in parallel...');
  const [executive, technical] = await Promise.all([
    generateExecutiveReport(scanData),
    generateTechnicalReport(scanData),
  ]);
  console.log('[groq] Both reports generated — exec source:', executive.source, '— tech source:', technical.source);
  return { executive, technical };
}

function generateMockExecutiveReport(scanData) {
  const counts = scanData.summary || { Critical: 0, High: 0, Medium: 0, Low: 0 };
  return {
    source: 'mock',
    riskScore: scanData.riskScore || 72,
    riskLevel: scanData.riskLevel || 'High',
    executiveSummary: `This report summarizes the findings of an external security assessment of ${scanData.targetUrl}. The assessment identified ${scanData.vulnerabilities?.length || 0} vulnerabilities that could impact business operations, customer trust, and regulatory compliance. Immediate action is recommended for critical findings.`,
    businessImpacts: [
      { title: 'Customer Data Exposure', description: 'Attackers could steal customer information, leading to privacy violations and loss of trust.' },
      { title: 'Operational Disruption', description: 'Exploitation could cause service outages, affecting revenue and user experience.' },
      { title: 'Reputational Damage', description: 'Public disclosure of vulnerabilities could harm your brand image.' },
    ],
    priorityFixes: [
      { number: '01', title: 'Close database port 3306', description: 'Contact your hosting provider to block external access.', severity: 'Critical' },
      { number: '02', title: 'Enable HTTPS', description: 'Install an SSL certificate to encrypt user data.', severity: 'Critical' },
      { number: '03', title: 'Add authentication to admin panel', description: 'Require strong passwords and multi-factor authentication.', severity: 'High' },
      { number: '04', title: 'Update security headers', description: 'Add CSP, HSTS, and X-Frame-Options.', severity: 'Medium' },
      { number: '05', title: 'Update outdated frameworks', description: 'Run a security update on all dependencies.', severity: 'Medium' },
    ],
    vulnerabilityCounts: {
      critical: counts.Critical || 0,
      high: counts.High || 0,
      medium: counts.Medium || 0,
      low: counts.Low || 0,
    },
  };
}

function generateMockTechnicalReport(scanData) {
  return {
    source: 'mock',
    riskScore: scanData.riskScore || 72,
    riskLevel: scanData.riskLevel || 'High',
    executiveSummary: `An external security assessment of ${scanData.targetUrl} identified ${scanData.vulnerabilities?.length || 0} vulnerabilities across multiple severity levels. The most critical finding is a SQL injection in the login endpoint (CVSS 9.8) enabling authentication bypass and data exfiltration. Immediate remediation is required.`,
    vulnerabilities: scanData.vulnerabilities || [],
    summaryTable: (scanData.vulnerabilities || []).map((v) => ({
      severity: v.severity, vulnerability: v.title, cvss: v.cvss, status: 'Open',
    })),
  };
}

export { generateReports, generateExecutiveReport, generateTechnicalReport };