/**
 * @api {post} /api/scan Start a security scan
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
    const { generateMockScanData } = await import('./lib/mockData.js');

    // 1. Create scan
    const scan = await createScan({
      target_url: targetUrl,
      status: 'scanning',
    });
    console.log('[scan] Scan created — scanId:', scan.id);

    await updateScan(scan.id, { status: 'analyzing' });

    // 2. Run REAL security checks
    console.log('[scan] Running REAL security checks...');
    const apiResults = await runSecurityAPIChecks(targetUrl);

    // 3. Build REAL scan data from API results
    const scanData = {
      targetUrl,
      apiResults,
      // ✅ Use REAL open ports from Shodan
      vulnerabilities: [],
      riskScore: 0,
      riskLevel: 'Unknown',
    };

    // ✅ Add REAL open ports as vulnerabilities
    if (apiResults.shodan?.data?.ports) {
      const ports = apiResults.shodan.data.ports;
      if (ports.length > 0) {
        ports.forEach((port) => {
          // ✅ Calculate risk based on port type
          let severity = 'Low';
          let cvss = 3.0;
          if ([22, 23, 3389].includes(port)) {
            severity = 'High';
            cvss = 7.5;
          } else if ([80, 443, 8080].includes(port)) {
            severity = 'Medium';
            cvss = 5.0;
          }
          scanData.vulnerabilities.push({
            id: `port-${port}`,
            title: `Open Port ${port} Detected`,
            severity: severity,
            cvss: cvss,
            cve: 'N/A',
            owasp: 'A05:2021 - Security Misconfiguration',
            description: `Port ${port} is open on this host. ${port > 1024 ? 'This could indicate an exposed service.' : 'This is a well-known service port.'}`,
            evidence: `Shodan InternetDB found port ${port} open`,
            reproduction: `nmap -p ${port} ${new URL(targetUrl).hostname}`,
            remediation: `Close port ${port} using a firewall if it is not needed.`,
          });
        });
      }
    }

    // ✅ Add VirusTotal results if available
    if (apiResults.virustotal?.data?.data?.attributes?.last_analysis_stats) {
      const stats = apiResults.virustotal.data.data.attributes.last_analysis_stats;
      if (stats.malicious > 0) {
        scanData.vulnerabilities.push({
          id: 'vt-malicious',
          title: `Malicious URL Detected (${stats.malicious} detections)`,
          severity: 'Critical',
          cvss: 9.0,
          cve: 'N/A',
          owasp: 'A06:2021 - Vulnerable and Outdated Components',
          description: `VirusTotal detected ${stats.malicious} vendors flagging this URL as malicious.`,
          evidence: `VirusTotal analysis: ${stats.malicious} malicious detections`,
          reproduction: `Visit VirusTotal for details`,
          remediation: 'Investigate the URL immediately and remove any malicious content.',
        });
      }
    }

    // ✅ Calculate REAL risk score
    let riskScore = 10; // Base score
    scanData.vulnerabilities.forEach((v) => {
      if (v.severity === 'Critical') riskScore += 25;
      else if (v.severity === 'High') riskScore += 15;
      else if (v.severity === 'Medium') riskScore += 8;
      else riskScore += 3;
    });
    scanData.riskScore = Math.min(riskScore, 100);
    scanData.riskLevel = scanData.riskScore > 65 ? 'High' : scanData.riskScore > 35 ? 'Medium' : 'Low';

    console.log('[scan] Real risk score calculated:', scanData.riskScore, scanData.riskLevel);

    // 4. Generate AI reports using REAL data
    console.log('[scan] Generating AI reports with real data...');
    let executive, technical;
    try {
      const reports = await generateReports(scanData);
      executive = reports.executive;
      technical = reports.technical;
      console.log('[scan] AI reports generated successfully');
    } catch (err) {
      console.error('[scan] AI report generation failed:', err.message);
      // ✅ Fallback to mock ONLY if AI fails
      const mockData = generateMockScanData(targetUrl);
      executive = {
        source: 'mock',
        riskScore: scanData.riskScore,
        riskLevel: scanData.riskLevel,
        executiveSummary: `Assessment of ${targetUrl} found ${scanData.vulnerabilities.length} issues.`,
        businessImpacts: [],
        priorityFixes: [],
        vulnerabilityCounts: { critical: 0, high: 0, medium: 0, low: 0 },
      };
      technical = {
        source: 'mock',
        riskScore: scanData.riskScore,
        riskLevel: scanData.riskLevel,
        executiveSummary: `Assessment of ${targetUrl} completed.`,
        vulnerabilities: scanData.vulnerabilities,
        summaryTable: [],
      };
    }

    // 5. Update scan with REAL results
    await updateScan(scan.id, {
      status: 'complete',
      risk_score: scanData.riskScore,
      risk_level: scanData.riskLevel,
      vulnerabilities: scanData.vulnerabilities,
      executive_report: executive,
      technical_report: technical,
    });

    console.log('[scan] Scan completed with real data!');
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