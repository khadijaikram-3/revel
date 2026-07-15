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

    // 2. Run REAL security checks
    console.log('[scan] Running REAL security checks...');
    const apiResults = await runSecurityAPIChecks(targetUrl);
    console.log('[scan] API Results:', JSON.stringify(apiResults, null, 2));

    // 3. Build vulnerability list from REAL data ONLY
    const vulnerabilities = [];
    let riskScore = 10;
    const hostname = new URL(targetUrl).hostname;

    // ✅ Shodan InternetDB — REAL open ports + vulnerabilities
    if (apiResults.shodan?.data) {
      const shodanData = apiResults.shodan.data;
      
      // Open ports
      if (shodanData.ports && shodanData.ports.length > 0) {
        shodanData.ports.forEach((port) => {
          let severity = 'Low';
          let cvss = 3.0;
          let description = `Port ${port} is open on this host.`;
          
          // ✅ Categorize ports by risk
          if ([22, 23, 3389, 3306, 5432, 27017, 6379].includes(port)) {
            severity = 'High';
            cvss = 7.5;
            description = `Port ${port} (${getPortName(port)}) is open. This service is commonly targeted by attackers.`;
          } else if ([80, 443, 8080, 8443].includes(port)) {
            severity = 'Medium';
            cvss = 5.0;
            description = `Port ${port} (${getPortName(port)}) is open. This is a web service.`;
          }
          
          vulnerabilities.push({
            id: `port-${port}`,
            title: `Open Port ${port} (${getPortName(port)})`,
            severity: severity,
            cvss: cvss,
            cve: 'N/A',
            owasp: 'A05:2021 - Security Misconfiguration',
            description: description,
            evidence: `Shodan InternetDB found port ${port} open`,
            reproduction: `nmap -p ${port} ${hostname}`,
            remediation: getPortRemediation(port),
          });
          riskScore += severity === 'High' ? 15 : severity === 'Medium' ? 8 : 3;
        });
      }
      
      // ✅ Shodan known vulnerabilities (CVE)
      if (shodanData.vulns && Object.keys(shodanData.vulns).length > 0) {
        Object.keys(shodanData.vulns).forEach((cveId) => {
          vulnerabilities.push({
            id: `cve-${cveId}`,
            title: `Known Vulnerability: ${cveId}`,
            severity: 'High',
            cvss: 7.0,
            cve: cveId,
            owasp: 'A06:2021 - Vulnerable and Outdated Components',
            description: `This host has a known vulnerability (${cveId}) according to Shodan.`,
            evidence: `Shodan InternetDB detected ${cveId}`,
            reproduction: `Check https://nvd.nist.gov/vuln/detail/${cveId}`,
            remediation: `Update or patch the affected service.`,
          });
          riskScore += 15;
        });
      }
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
          description: `VirusTotal detected ${stats.malicious} security vendors flagging this URL as malicious.`,
          evidence: `VirusTotal analysis: ${stats.malicious} malicious detections, ${stats.suspicious} suspicious`,
          reproduction: `Visit https://www.virustotal.com/gui/domain/${hostname}`,
          remediation: 'Investigate the URL immediately. Remove any malicious content. Scan your server for compromise.',
        });
        riskScore += 25;
      }
    }

    // ✅ Calculate REAL risk score
    const riskLevel = riskScore > 65 ? 'High' : riskScore > 35 ? 'Medium' : 'Low';
    console.log('[scan] REAL risk score:', riskScore, riskLevel);
    console.log('[scan] Vulnerabilities found:', vulnerabilities.length);

    // 4. Prepare scan data for AI
    const scanData = {
      targetUrl,
      vulnerabilities,
      riskScore,
      riskLevel,
      apiResults,
      summary: {
        total: vulnerabilities.length,
        critical: vulnerabilities.filter(v => v.severity === 'Critical').length,
        high: vulnerabilities.filter(v => v.severity === 'High').length,
        medium: vulnerabilities.filter(v => v.severity === 'Medium').length,
        low: vulnerabilities.filter(v => v.severity === 'Low').length,
      },
    };

    // 5. Generate AI reports from REAL data
    console.log('[scan] Generating AI reports with REAL data...');
    let executive, technical;
    try {
      const reports = await generateReports(scanData);
      executive = reports.executive;
      technical = reports.technical;
      console.log('[scan] AI reports generated successfully');
    } catch (err) {
      console.error('[scan] AI generation failed:', err.message);
      // ✅ Create a basic report from REAL data (no mock)
      executive = {
        source: 'api',
        riskScore: riskScore,
        riskLevel: riskLevel,
        executiveSummary: `Security assessment of ${targetUrl} found ${vulnerabilities.length} issues. ${vulnerabilities.filter(v => v.severity === 'Critical' || v.severity === 'High').length} of these are high-risk.`,
        businessImpacts: vulnerabilities.slice(0, 3).map(v => ({
          title: v.title,
          description: v.description
        })),
        priorityFixes: vulnerabilities.slice(0, 5).map((v, i) => ({
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

    // 6. Update scan with REAL results
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

// ✅ Helper functions for port information
function getPortName(port) {
  const portMap = {
    20: 'FTP (Data)',
    21: 'FTP (Control)',
    22: 'SSH',
    23: 'Telnet',
    25: 'SMTP',
    53: 'DNS',
    80: 'HTTP',
    110: 'POP3',
    143: 'IMAP',
    443: 'HTTPS',
    3306: 'MySQL',
    3389: 'RDP',
    5432: 'PostgreSQL',
    6379: 'Redis',
    27017: 'MongoDB',
    8080: 'HTTP-Proxy',
    8443: 'HTPS-Alt',
  };
  return portMap[port] || 'Unknown Service';
}

function getPortRemediation(port) {
  const remediationMap = {
    22: 'Disable SSH if not needed, or restrict access to trusted IPs using a firewall.',
    23: 'Disable Telnet immediately. Use SSH instead.',
    3306: 'Bind MySQL to localhost only, or restrict access using a firewall.',
    3389: 'Disable RDP if not needed, or use a VPN for access.',
    5432: 'Bind PostgreSQL to localhost only, or restrict access using a firewall.',
    6379: 'Bind Redis to localhost only, or restrict access using a firewall.',
    27017: 'Bind MongoDB to localhost only, or restrict access using a firewall.',
  };
  return remediationMap[port] || `Close port ${port} using a firewall if it is not needed.`;
}