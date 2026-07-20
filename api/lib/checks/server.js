export async function checkServerFingerprint(targetUrl) {
  try {
    const response = await fetch(targetUrl, {
      method: "HEAD",
      redirect: "follow",
    });

    return {
      status: "success",
      data: {
        server: response.headers.get("server") || null,
        poweredBy: response.headers.get("x-powered-by") || null,
        via: response.headers.get("via") || null,
      },
    };
  } catch (err) {
    return {
      status: "error",
      error: err.message,
    };
  }
}