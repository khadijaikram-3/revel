// api/lib/riskEngine.js

const RISK_WEIGHTS = {
  Critical: 25,
  High: 15,
  Medium: 8,
  Low: 3,
  Info: 1,
};

export function calculateRisk(vulnerabilities = []) {
  let riskScore = 0;

  const summary = {
    total: vulnerabilities.length,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  };

  for (const vuln of vulnerabilities) {
    riskScore += RISK_WEIGHTS[vuln.severity] || 0;

    switch (vuln.severity) {
      case "Critical":
        summary.critical++;
        break;
      case "High":
        summary.high++;
        break;
      case "Medium":
        summary.medium++;
        break;
      case "Low":
        summary.low++;
        break;
      default:
        summary.info++;
    }
  }

  riskScore = Math.min(100, riskScore);

  let riskLevel = "Low";

  if (riskScore >= 70)
    riskLevel = "Critical";
  else if (riskScore >= 45)
    riskLevel = "High";
  else if (riskScore >= 20)
    riskLevel = "Medium";

  return {
    riskScore,
    riskLevel,
    summary,
  };
}