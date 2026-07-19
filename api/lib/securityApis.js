// api/lib/securityApis.js — REAL CHECKS FOR ALL FEATURES

export async function runSecurityAPIChecks(targetUrl) {
  console.log('[securityApis] Starting REAL security checks for:', targetUrl);

  const url = new URL(targetUrl);
  const hostname = url.hostname;

  const results = {};

  // 1. ✅ SSL/TLS Check (Real)
  console.log('[securityApis] Checking SSL/TLS...');
  try {
    // Use a free SSL checker API
    const sslResponse = await fetch(`https://api.ssllabs.com/api/v3/analyze?host=${hostname}&all=done`);
    if (sslResponse.ok) {
      const sslData = await sslResponse.json();
      results.ssl = {
        status: 'success',
        data: {
          grade: sslData.endpoints?.[0]?.grade || 'Unknown',
          hasHSTS: sslData.endpoints?.[0]?.details?.hstsPolicy || false,
          protocol: sslData.endpoints?.[0]?.details?.protocol || 'Unknown',
        }
      };
      console.log('[securityApis] SSL check complete');
    } else {
      results.ssl = { status: 'error', error: `SSL Labs API returned ${sslResponse.status}` };
    }
  } catch (err) {
    results.ssl = { status: 'error', error: err.message };
    console.log('[securityApis] SSL check failed:', err.message);
  }

  // 2. ✅ Security Headers Check (Real)
  console.log('[securityApis] Checking Security Headers...');
  try {
    const response = await fetch(targetUrl, { method: 'HEAD' });
    const headers = response.headers;
    
    results.headers = {
      status: 'success',
      data: {
        'Content-Security-Policy': headers.get('content-security-policy') || 'Missing',
        'Strict-Transport-Security': headers.get('strict-transport-security') || 'Missing',
        'X-Frame-Options': headers.get('x-frame-options') || 'Missing',
        'X-Content-Type-Options': headers.get('x-content-type-options') || 'Missing',
        'Referrer-Policy': headers.get('referrer-policy') || 'Missing',
      }
    };
    console.log('[securityApis] Headers check complete');
  } catch (err) {
    results.headers = { status: 'error', error: err.message };
  }

  // 3. ✅ Server Fingerprinting (Real)
  console.log('[securityApis] Checking Server Fingerprint...');
  try {
    const response = await fetch(targetUrl, { method: 'HEAD' });
    const server = response.headers.get('server') || 'Unknown';
    const poweredBy = response.headers.get('x-powered-by') || 'Unknown';
    
    results.server = {
      status: 'success',
      data: { server, poweredBy }
    };
    console.log('[securityApis] Server fingerprint complete');
  } catch (err) {
    results.server = { status: 'error', error: err.message };
  }

  // 4. ✅ DNS Check (Real)
  console.log('[securityApis] Checking DNS...');
  try {
    // Use a free DNS API
    const dnsResponse = await fetch(`https://dns.google/resolve?name=${hostname}&type=A`);
    if (dnsResponse.ok) {
      const dnsData = await dnsResponse.json();
      results.dns = {
        status: 'success',
        data: {
          records: dnsData.Answer || [],
          count: dnsData.Answer?.length || 0,
        }
      };
      console.log('[securityApis] DNS check complete');
    } else {
      results.dns = { status: 'error', error: 'DNS lookup failed' };
    }
  } catch (err) {
    results.dns = { status: 'error', error: err.message };
  }

  // 5. ✅ CSP Check (Real) — Already included in headers, but let's add details
  console.log('[securityApis] Checking CSP details...');
  if (results.headers?.data?.['Content-Security-Policy'] !== 'Missing') {
    const csp = results.headers.data['Content-Security-Policy'];
    results.csp = {
      status: 'success',
      data: {
        present: true,
        value: csp,
        hasDefaultSrc: csp.includes('default-src'),
        hasScriptSrc: csp.includes('script-src'),
        hasStyleSrc: csp.includes('style-src'),
      }
    };
  } else {
    results.csp = { 
      status: 'warning', 
      data: { present: false, message: 'CSP header is missing' } 
    };
  }

  // 6. ✅ Admin Panels Check (Real) — Try common admin paths
  console.log('[securityApis] Checking for exposed admin panels...');
  const adminPaths = ['/admin', '/wp-admin', '/administrator', '/login', '/cpanel', '/phpmyadmin'];
  const foundAdmin = [];
  
  for (const path of adminPaths) {
    try {
      const adminUrl = `${targetUrl}${path}`;
      const response = await fetch(adminUrl, { method: 'HEAD' });
      if (response.status === 200) {
        foundAdmin.push(path);
      }
    } catch (err) {
      // Silently skip
    }
  }
  
  results.adminPanels = {
    status: 'success',
    data: {
      found: foundAdmin,
      count: foundAdmin.length,
    }
  };
  console.log('[securityApis] Admin panels check complete');

  // 7. ✅ Subdomain Enumeration (Real)
  console.log('[securityApis] Checking subdomains...');
  try {
    // Use a free subdomain API (crt.sh)
    const subdomainResponse = await fetch(`https://crt.sh/?q=${hostname}&output=json`);
    if (subdomainResponse.ok) {
      const subdomainData = await subdomainResponse.json();
      const subdomains = subdomainData.map(entry => entry.name_value).filter(Boolean);
      const uniqueSubdomains = [...new Set(subdomains)];
      
      results.subdomains = {
        status: 'success',
        data: {
          found: uniqueSubdomains.slice(0, 10),
          count: uniqueSubdomains.length,
        }
      };
      console.log('[securityApis] Subdomain check complete');
    } else {
      results.subdomains = { status: 'error', error: 'Subdomain lookup failed' };
    }
  } catch (err) {
    results.subdomains = { status: 'error', error: err.message };
  }

  // 8. ✅ Open Ports (Shodan InternetDB)
  console.log('[securityApis] Checking open ports...');
  try {
    const shodanResponse = await fetch(`https://internetdb.shodan.io/${hostname}`);
    if (shodanResponse.ok) {
      const shodanData = await shodanResponse.json();
      results.ports = {
        status: 'success',
        data: {
          ports: shodanData.ports || [],
          vulns: shodanData.vulns || {},
          hostnames: shodanData.hostnames || [],
        }
      };
      console.log('[securityApis] Open ports check complete');
    } else {
      results.ports = { status: 'error', error: 'Shodan lookup failed' };
    }
  } catch (err) {
    results.ports = { status: 'error', error: err.message };
  }

  // 9. ✅ Malware Check (VirusTotal)
  console.log('[securityApis] Checking malware reputation...');
  const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;
  if (VIRUSTOTAL_API_KEY) {
    try {
      const encodedUrl = Buffer.from(targetUrl).toString('base64').replace(/=/g, '');
      const vtResponse = await fetch(
        `https://www.virustotal.com/api/v3/urls/${encodedUrl}`,
        { headers: { 'x-apikey': VIRUSTOTAL_API_KEY } }
      );
      if (vtResponse.ok) {
        const vtData = await vtResponse.json();
        const stats = vtData.data?.attributes?.last_analysis_stats || {};
        results.malware = {
          status: 'success',
          data: {
            malicious: stats.malicious || 0,
            suspicious: stats.suspicious || 0,
            harmless: stats.harmless || 0,
            undetected: stats.undetected || 0,
          }
        };
        console.log('[securityApis] Malware check complete');
      } else {
        results.malware = { status: 'error', error: `VirusTotal API error: ${vtResponse.status}` };
      }
    } catch (err) {
      results.malware = { status: 'error', error: err.message };
    }
  } else {
    results.malware = { status: 'skipped', error: 'No VirusTotal API key' };
  }

  // 10. ✅ XSS Detection (Basic real check)
  console.log('[securityApis] Testing for XSS...');
  try {
    const testPayload = '<script>alert(1)</script>';
    const xssUrl = `${targetUrl}?q=${encodeURIComponent(testPayload)}`;
    const xssResponse = await fetch(xssUrl);
    const xssText = await xssResponse.text();
    
    // Check if the payload is reflected in the response
    const isReflected = xssText.includes(testPayload);
    results.xss = {
      status: 'success',
      data: {
        vulnerable: isReflected,
        message: isReflected ? 'Potential XSS vulnerability detected!' : 'No XSS detected in basic test',
      }
    };
    console.log('[securityApis] XSS check complete');
  } catch (err) {
    results.xss = { status: 'error', error: err.message };
  }

  // 11. ✅ SQL Injection (Basic real check)
  console.log('[securityApis] Testing for SQL Injection...');
  try {
    const sqlPayload = "' OR '1'='1";
    const sqlUrl = `${targetUrl}?id=${encodeURIComponent(sqlPayload)}`;
    const sqlResponse = await fetch(sqlUrl);
    const sqlText = await sqlResponse.text();
    
    // Check for common SQL error messages
    const sqlErrors = ['sql syntax', 'mysql_fetch', 'ORA-', 'PostgreSQL', 'SQLite', 'Microsoft OLE DB'];
    const hasSqlError = sqlErrors.some(error => sqlText.toLowerCase().includes(error.toLowerCase()));
    
    results.sqli = {
      status: 'success',
      data: {
        vulnerable: hasSqlError,
        message: hasSqlError ? 'Potential SQL Injection vulnerability detected!' : 'No SQL injection detected in basic test',
      }
    };
    console.log('[securityApis] SQL Injection check complete');
  } catch (err) {
    results.sqli = { status: 'error', error: err.message };
  }

  // 12. ✅ Directory Traversal (Basic real check)
  console.log('[securityApis] Testing for Directory Traversal...');
  try {
    const traversalPayload = '../../../../etc/passwd';
    const traversalUrl = `${targetUrl}?file=${encodeURIComponent(traversalPayload)}`;
    const traversalResponse = await fetch(traversalUrl);
    const traversalText = await traversalResponse.text();
    
    const isVulnerable = traversalText.includes('root:') || traversalText.includes('bin:');
    results.dirTraversal = {
      status: 'success',
      data: {
        vulnerable: isVulnerable,
        message: isVulnerable ? 'Potential Directory Traversal detected!' : 'No directory traversal detected',
      }
    };
    console.log('[securityApis] Directory Traversal check complete');
  } catch (err) {
    results.dirTraversal = { status: 'error', error: err.message };
  }

  console.log('[securityApis] All checks complete!');
  return results;
}