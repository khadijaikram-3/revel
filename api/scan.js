/**
 * @api {post} /api/scan Start a security scan
 * Uses ONLY real data from Shodan InternetDB, VirusTotal, and OpenRouter.
 */
import { validateTargetUrl } from "./lib/validators.js";
import { calculateRisk } from "./lib/riskEngine.js";
//import { buildVulnerabilities } from "./lib/vulnerabilityBuilder.js";
//import { buildReports } from "./lib/reportBuilder.js";

export default async function handler(req, res) {
  console.log('\n========== /api/scan START ==========');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const startedAt = Date.now();
    const { url } = req.body || {};

    let targetUrl;
    let hostname;

    try {
      const validated = validateTargetUrl(url);
      targetUrl = validated.normalizedUrl;
      hostname = validated.hostname;
      console.log("[scan] Normalized URL:", targetUrl);
    } catch (err) {
      return res.status(400).json({
        error: err.message,
      });
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

    // Check headers
    console.log("[scan] Headers result:", apiResults.headers);
    
    if (apiResults.headers?.status === 'success') {
      const h = apiResults.headers.data;

      if (h['Content-Security-Policy'] === 'Missing') {
        vulnerabilities.push({
          id: 'missing-csp',
          title: 'Missing Content Security Policy',
          severity: 'Medium',
          cvss: 6.5,
          cve: 'N/A',
          owasp: 'A05:2021 - Security Misconfiguration',
          description: 'The website does not define a Content Security Policy.',
          evidence: 'CSP header missing.',
          reproduction: `curl -I ${targetUrl}`,
          remediation: 'Add a Content-Security-Policy response header.',
        });
        riskScore += 10;
      }

      if (h['Strict-Transport-Security'] === 'Missing') {
        vulnerabilities.push({
          id: 'missing-hsts',
          title: 'Missing HSTS Header',
          severity: 'Medium',
          cvss: 6.3,
          cve: 'N/A',
          owasp: 'A05:2021 - Security Misconfiguration',
          description: 'Strict Transport Security is not enabled.',
          evidence: 'HSTS header missing.',
          reproduction: `curl -I ${targetUrl}`,
          remediation: 'Enable HSTS.',
        });
        riskScore += 8;
      }

      if (h['X-Content-Type-Options'] === 'Missing') {
        vulnerabilities.push({
          id: 'missing-nosniff',
          title: 'Missing X-Content-Type-Options',
          severity: 'Low',
          cvss: 3.7,
          cve: 'N/A',
          owasp: 'A05:2021 - Security Misconfiguration',
          description: 'Browser MIME sniffing protection is missing.',
          evidence: 'Header missing.',
          reproduction: `curl -I ${targetUrl}`,
          remediation: 'Set X-Content-Type-Options: nosniff',
        });
        riskScore += 4;
      }
    }

    // Shodan InternetDB — REAL open ports + vulnerabilities
    if (apiResults.ports?.data) {
      const shodanData = apiResults.ports.data;
      
      // Open ports
      if (shodanData.ports && shodanData.ports.length > 0) {
        shodanData.ports.forEach((port) => {
          let severity = 'Low';
          let cvss = 3.0;
          let description = `Port ${port} is open on this host.`;
          
          // Categorize ports by risk
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
      
      // Shodan known vulnerabilities (CVE)
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

    // Admin panels check
    if (apiResults.adminPanels?.status === 'success' && apiResults.adminPanels?.data?.count > 0) {
      vulnerabilities.push({
        id: 'admin-panels',
        title: 'Administrative Interfaces Exposed',
        severity: 'Medium',
        cvss: 6.8,
        cve: 'N/A',
        owasp: 'A05:2021 - Security Misconfiguration',
        description: `${apiResults.adminPanels.data.count} administrative endpoints were discovered.`,
        evidence: apiResults.adminPanels.data.found.join(', '),
        reproduction: 'Visit the discovered endpoints.',
        remediation: 'Restrict access to administrative interfaces.',
      });
      riskScore += 15;
    }

    // VirusTotal — REAL malware detection
    if (apiResults.malware?.status === "success") {
      const stats = apiResults.malware.data;
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

    // Calculate REAL risk score
    riskScore = Math.min(riskScore, 100);

    if (vulnerabilities.some(v => v.severity === "Critical")) {
      riskScore = Math.max(riskScore, 90);
    } else if (vulnerabilities.some(v => v.severity === "High")) {
      riskScore = Math.max(riskScore, 70);
    } else if (vulnerabilities.some(v => v.severity === "Medium")) {
      riskScore = Math.max(riskScore, 45);
    }

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

    // 5. Generate reports from REAL scan data
    console.log("[scan] Generating AI reports...");
    let executive = null;
    let technical = null;

    try {
      const reports = await generateReports(scanData);
      executive = reports.executive;
      technical = reports.technical;
      console.log("[scan] AI reports generated.");
    } catch (err) {
      console.error("[scan] AI Report Error:", err.message);
    }

    // 6. Update scan with REAL results
    await updateScan(scan.id, {
      status: 'complete',
      risk_score: riskScore,
      risk_level: riskLevel,
      api_results: apiResults,
      vulnerabilities: vulnerabilities,
      executive_report: executive,
      technical_report: technical,
    });

    const duration = Date.now() - startedAt;
    console.log(`[scan] ✅ Scan completed in ${duration} ms with REAL data!`);
    
    return res.status(200).json({
      scanId: scan.id,
      status: 'complete',
      targetUrl,
      duration,
    });
  } catch (error) {
    console.error('[scan] ERROR:', error.message);
    return res.status(500).json({ error: 'Failed to start scan', detail: error.message });
  }
}

// Helper functions for port information
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