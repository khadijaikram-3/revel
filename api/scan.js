let riskScore = 10; // Base score
vulnerabilities.forEach((v) => {
  if (v.severity === 'Critical') riskScore += 25;
  else if (v.severity === 'High') riskScore += 15;
  else if (v.severity === 'Medium') riskScore += 8;
  else riskScore += 3;
});