/**
 * @api {post} /api/scan Start a security scan
 * Uses ONLY real data from Shodan InternetDB, VirusTotal, and OpenRouter.
 * NO MOCK DATA.
 */
export default async function handler(req, res) {
  console.log('\n========== /api/scan START ==========');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url: targetUrl } = req.body || {};
    console.log('[scan] URL received:', targetUrl);

    if (!targetUrl) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const { createScan, updateScan } = await import('./lib/scanStore.js');
    const { runSecurityAPIChecks } = await import('./lib/securityApis.js');
    const { generateReports } = await import('./lib/openrouter.js');

    // 1. Create scan
    const scan = await createScan({
      target_url: targetUrl,
      status: 'scanning',
    });
    console.log('[scan] Scan created — scanId:', scan.id);

    await updateScan(scan.id, { status: 'analyzing' });

    // 2. Run REAL security checks (NO MOCK)
    console.log('[scan] Running REAL security checks...');
    const apiResults = await runSecurityAPIChecks(targetUrl);
    console.log('[scan] API Results:', JSON.stringify(apiResults, null, 2));

    // 3. Build vulnerability list from REAL data ONLY
    const vulnerabilities = [];
    let riskScore = 10;

    // ✅ Shodan InternetDB — REAL open ports
    if (apiResults.shodan?.data?.ports) {
      const ports = apiResults.shodan.data.ports;
      ports.forEach((port) => {
        let severity = 'Low';
        let cvss = 3.0;
        if ([22, 23, 3389, 3306, 5432, 27017].includes(port)) {
          severity = 'High';
          cvss = 7.5;
        } else if ([80, 443, 8080, 8443].includes(port)) {
          severity = 'Medium';
          cvss = 5.0;
        }
        vulnerabilities.push({
          id: `port-${port}`,
          title: `Open Port ${port} Detected`,
          severity: severity,
          cvss: cvss,
          cve: 'N/A',
          owasp: 'A05:2021 - Security Misconfiguration',
          description: `Port ${port} is open on this host.`,
          evidence: `Shodan InternetDB found port ${port} open`,
          reproduction: `nmap -p ${port} ${new URL(targetUrl).hostname}`,
          remediation: `Close port ${port} using a firewall if not needed.`,
        });
        riskScore += severity === 'High' ? 15 : severity === 'Medium' ? 8 : 3;
      });
    }

    // ✅ VirusTotal — REAL malware detection
    if (apiResults.virustotal?.data?.data?.attributes?.last_analysis_stats) {
      const stats = apiResults.virustotal.data.data.attributes.last_analysis_stats;
      if (stats.malicious > 0) {
        vulnerabilities.push({
          id: 'vt-malicious',
          title: `Malicious URL Detected (${stats.malicious} detections)`,
          severity: 'Critical',
          cvss: 9.0,
          cve: 'N/A',
          owasp: 'A06:2021 - Vulnerable and Outdated Components',
          description: `VirusTotal detected ${stats.malicious} vendors flagging this URL as malicious.`,
          evidence: `VirusTotal analysis: ${stats.malicious} malicious detections`,
          reproduction: `Visit VirusTotal for details`,
          remediation: 'Investigate the URL immediately.',
        });
        riskScore += 25;
      }
    }

    // ✅ Calculate REAL risk score
    const riskLevel = riskScore > 65 ? 'High' : riskScore > 35 ? 'Medium' : 'Low';
    console.log('[scan] REAL risk score:', riskScore, riskLevel);

    // 4. Generate AI reports from REAL data (NO MOCK)
    console.log('[scan] Generating AI reports with REAL data...');
    const scanData = {
      targetUrl,
      vulnerabilities,
      riskScore,
      riskLevel,
      apiResults,
    };

    let executive, technical;
    try {
      const reports = await generateReports(scanData);
      executive = reports.executive;
      technical = reports.technical;
      console.log('[scan] AI reports generated successfully');
    } catch (err) {
      console.error('[scan] AI generation failed:', err.message);
      // ✅ If AI fails, create a basic report from REAL data (still NO mock)
      executive = {
        source: 'api',
        riskScore: riskScore,
        riskLevel: riskLevel,
        executiveSummary: `Assessment of ${targetUrl} found ${vulnerabilities.length} issues.`,
        businessImpacts: vulnerabilities.map(v => ({
          title: v.title,
          description: v.description
        })),
        priorityFixes: vulnerabilities.map((v, i) => ({
          number: String(i + 1).padStart(2, '0'),
          title: v.title,
          description: v.remediation,
          severity: v.severity
        })),
        vulnerabilityCounts: {
          critical: vulnerabilities.filter(v => v.severity === 'Critical').length,
          high: vulnerabilities.filter(v => v.severity === 'High').length,
          medium: vulnerabilities.filter(v => v.severity === 'Medium').length,
          low: vulnerabilities.filter(v => v.severity === 'Low').length,
        },
      };
      technical = {
        source: 'api',
        riskScore: riskScore,
        riskLevel: riskLevel,
        executiveSummary: `Assessment of ${targetUrl} found ${vulnerabilities.length} issues.`,
        vulnerabilities: vulnerabilities,
        summaryTable: vulnerabilities.map((v) => ({
          severity: v.severity,
          vulnerability: v.title,
          cvss: v.cvss,
          status: 'Open',
        })),
      };
    }

    // 5. Update scan with REAL results
    await updateScan(scan.id, {
      status: 'complete',
      risk_score: riskScore,
      risk_level: riskLevel,
      vulnerabilities: vulnerabilities,
      executive_report: executive,
      technical_report: technical,
    });

    console.log('[scan] ✅ Scan completed with REAL data!');
    return res.status(200).json({
      scanId: scan.id,
      status: 'complete',
      targetUrl,
    });
  } catch (error) {
    console.error('[scan] ERROR:', error.message);
    return res.status(500).json({ error: 'Failed to start scan', detail: error.message });
  }
}