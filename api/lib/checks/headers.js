export async function checkSecurityHeaders(targetUrl) {
  try {
    const response = await fetch(targetUrl, {
      method: "HEAD",
      redirect: "follow",
    });

    const headers = response.headers;

    const securityHeaders = {
      "content-security-policy": headers.get("content-security-policy"),
      "strict-transport-security": headers.get("strict-transport-security"),
      "x-frame-options": headers.get("x-frame-options"),
      "x-content-type-options": headers.get("x-content-type-options"),
      "referrer-policy": headers.get("referrer-policy"),
      "permissions-policy": headers.get("permissions-policy"),
      "cross-origin-opener-policy": headers.get("cross-origin-opener-policy"),
      "cross-origin-resource-policy": headers.get("cross-origin-resource-policy"),
    };

    const missing = Object.entries(securityHeaders)
      .filter(([, value]) => !value)
      .map(([key]) => key);

    return {
      status: "success",
      data: {
        headers: securityHeaders,
        missing,
        score:
          ((Object.keys(securityHeaders).length - missing.length) /
            Object.keys(securityHeaders).length) *
          100,
      },
    };
  } catch (err) {
    return {
      status: "error",
      error: err.message,
    };
  }
}