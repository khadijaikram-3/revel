/**
 * OpenRouter AI integration for generating Executive and Technical reports.
 * Uses DeepSeek V4 Flash via OpenRouter API.
 */

import axios from 'axios';

const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL = 'deepseek/deepseek-chat-v3-0324'; // ✅ Free model

// Helper function to create fallback report when AI fails
function createFallbackReport(scanData, type) {
  const vulnerabilities = scanData.vulnerabilities || [];
  const summary = scanData.summary || { critical: 0, high: 0, medium: 0, low: 0 };
  
  const baseReport = {
    source: 'api',
    riskScore: scanData.riskScore || 0,
    riskLevel: scanData.riskLevel || 'Unknown',
    executiveSummary: `Security assessment found ${vulnerabilities.length} vulnerabilities. ${vulnerabilities.filter(v => v.severity === 'Critical' || v.severity === 'High').length} of these are high-risk.`,
    vulnerabilityCounts: {
      critical: summary.critical || 0,
      high: summary.high || 0,
      medium: summary.medium || 0,
      low: summary.low || 0,
    },
  };

  if (type === 'executive') {
    return {
      ...baseReport,
      businessImpacts: vulnerabilities.slice(0, 3).map(v => ({
        title: v.title || 'Security Issue',
        description: v.description || 'Security vulnerability detected'
      })),
      priorityFixes: vulnerabilities.slice(0, 5).map((v, i) => ({
        number: String(i + 1).padStart(2, '0'),
        title: v.title || 'Unknown Issue',
        description: v.remediation || 'No remediation available',
        severity: v.severity || 'Medium'
      })),
    };
  }

  // Technical fallback
  return {
    ...baseReport,
    vulnerabilities: vulnerabilities.map(v => ({
      title: v.title || 'Unknown',
      cvss: v.cvss ?? 0, // ✅ FIX 2: Use nullish coalescing for numbers
      cve: v.cve || 'N/A',
      owasp: v.owasp || 'N/A',
      description: v.description || 'No description available',
      evidence: v.evidence || 'No evidence available',
      reproduction: v.reproduction || 'No reproduction steps available',
      remediation: v.remediation || 'No remediation available',
      severity: v.severity || 'Medium',
      status: 'Open'
    })),
    summaryTable: vulnerabilities.map(v => ({
      severity: v.severity || 'Medium',
      vulnerability: v.title || 'Unknown',
      cvss: v.cvss ?? 0, // ✅ FIX 2: Use nullish coalescing for numbers
      status: 'Open'
    })),
  };
}

async function callOpenRouter(systemPrompt, userPrompt) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.log('[openrouter] No API key — skipping');
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  console.log('[openrouter] Calling OpenRouter API — model:', OPENROUTER_MODEL);

  try {
    const response = await axios.post(
      OPENROUTER_ENDPOINT,
      {
        model: OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1800, // ✅ FIX 3: Reduced from 4096 to 1800
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://revel-gules.vercel.app',
          'X-Title': 'Revel Security Scanner',
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    console.log('[openrouter] Response status:', response.status);
    const content = response.data?.choices?.[0]?.message?.content || '';
    console.log('[openrouter] Response length:', content.length, 'chars');
    console.log('[openrouter] AI Response content:', content);
    return content;
  } catch (error) {
    console.error('[openrouter] API call failed:', error.response?.status, error.response?.data || error.message);
    throw new Error(`OpenRouter API error: ${error.response?.status || 'unknown'}`);
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

  // Reduce apiResults to essential data only
  const reducedScanData = {
    ...scanData,
    apiResults: scanData.apiResults ? {
      ssl: scanData.apiResults.ssl,
      malware: scanData.apiResults.malware,
      ports: scanData.apiResults.ports,
      headers: scanData.apiResults.headers,
    } : undefined,
  };

  const userPrompt = `Scan Data:\n${JSON.stringify(reducedScanData, null, 2)}`;

  try {
    console.log('[openrouter] Generating executive report...');
    const text = await callOpenRouter(systemPrompt, userPrompt);
    
    // ✅ FIX 1: Safer JSON extraction using indexOf/lastIndexOf
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1) {
      console.error('[openrouter] Executive: No JSON found in AI response');
      throw new Error('No JSON found');
    }

    const parsed = JSON.parse(text.substring(start, end + 1));
    console.log('[openrouter] Executive report parsed OK');

    return {
      source: 'openrouter',
      ...parsed,
    };

  } catch (error) {
    console.error('[openrouter] Executive report generation failed:', error.message);
    return createFallbackReport(scanData, 'executive');
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

  // Reduce apiResults to essential data only
  const reducedScanData = {
    ...scanData,
    apiResults: scanData.apiResults ? {
      ssl: scanData.apiResults.ssl,
      malware: scanData.apiResults.malware,
      ports: scanData.apiResults.ports,
      headers: scanData.apiResults.headers,
    } : undefined,
  };

  const userPrompt = `Scan Data:\n${JSON.stringify(reducedScanData, null, 2)}`;

  try {
    console.log('[openrouter] Generating technical report...');
    const text = await callOpenRouter(systemPrompt, userPrompt);
    
    // ✅ FIX 1: Safer JSON extraction using indexOf/lastIndexOf
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1) {
      console.error('[openrouter] Technical: No JSON found in AI response');
      throw new Error('No JSON found');
    }

    const parsed = JSON.parse(text.substring(start, end + 1));
    console.log('[openrouter] Technical report parsed OK');

    return {
      source: 'openrouter',
      ...parsed,
    };

  } catch (error) {
    console.error('[openrouter] Technical report generation failed:', error.message);
    return createFallbackReport(scanData, 'technical');
  }
}

async function generateReports(scanData) {
  console.log('[openrouter] Generating both reports in parallel...');
  const [executive, technical] = await Promise.all([
    generateExecutiveReport(scanData),
    generateTechnicalReport(scanData),
  ]);
  console.log('[openrouter] Both reports generated — exec source:', executive.source, '— tech source:', technical.source);
  return { executive, technical };
}

export { generateReports, generateExecutiveReport, generateTechnicalReport };