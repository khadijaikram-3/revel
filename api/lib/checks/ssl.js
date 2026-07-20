export async function checkSSL(hostname) {
  try {
    console.log("[ssl] Checking SSL Labs...");

    const response = await fetch(
      `https://api.ssllabs.com/api/v3/analyze?host=${hostname}&all=done`
    );

    if (!response.ok) {
      return {
        status: "error",
        error: `SSL Labs returned ${response.status}`,
      };
    }

    const data = await response.json();

    const endpoint = data.endpoints?.[0] || {};
    const details = endpoint.details || {};

    return {
      status: "success",
      data: {
        host: hostname,
        grade: endpoint.grade || null,
        ipAddress: endpoint.ipAddress || null,
        hasWarnings: endpoint.hasWarnings || false,
        isExceptional: endpoint.isExceptional || false,
        protocol: details.protocols || [],
        hsts: details.hstsPolicy || null,
        certExpiry: details.cert?.notAfter || null,
      },
    };
  } catch (err) {
    return {
      status: "error",
      error: err.message,
    };
  }
}