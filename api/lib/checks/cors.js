export async function checkCORS(targetUrl) {
  try {
    const response = await fetch(targetUrl, {
      method: "OPTIONS",
    });

    const origin =
      response.headers.get("access-control-allow-origin");

    const credentials =
      response.headers.get("access-control-allow-credentials");

    return {
      status: "success",
      data: {
        allowOrigin: origin,
        allowCredentials: credentials,
        wildcard: origin === "*",
        vulnerable:
          origin === "*" && credentials === "true",
      },
    };
  } catch (err) {
    return {
      status: "error",
      error: err.message,
    };
  }
}