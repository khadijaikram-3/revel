// api/lib/reportBuilder.js

export function buildReports({
  targetUrl,
  vulnerabilities,
  riskScore,
  riskLevel,
  apiResults,
}) {

  const summary = {
    total: vulnerabilities.length,
    critical: vulnerabilities.filter(v => v.severity === "Critical").length,
    high: vulnerabilities.filter(v => v.severity === "High").length,
    medium: vulnerabilities.filter(v => v.severity === "Medium").length,
    low: vulnerabilities.filter(v => v.severity === "Low").length,
    info: vulnerabilities.filter(v => v.severity === "Info").length,
  };

  const topRisks = [...vulnerabilities]
    .sort((a, b) => b.cvss - a.cvss)
    .slice(0, 5);

  return {

    generatedAt: new Date().toISOString(),

    targetUrl,

    riskScore,

    riskLevel,

    summary,

    vulnerabilities,

    topRisks,

    apiResults,

    metadata: {

      scanner: "Revel",

      version: "1.0",

      totalChecks: Object.keys(apiResults).length,

      completedChecks: Object.values(apiResults)
        .filter(r => r.status === "success").length,

      failedChecks: Object.values(apiResults)
        .filter(r => r.status !== "success").length,

    },

  };

}