export async function checkVirusTotal(targetUrl) {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;

  if (!apiKey) {
    return {
      status: "skipped",
      error: "No API key",
    };
  }

  try {
    const encoded = Buffer.from(targetUrl)
      .toString("base64")
      .replace(/=/g, "");

    const response = await fetch(
      `https://www.virustotal.com/api/v3/urls/${encoded}`,
      {
        headers: {
          "x-apikey": apiKey,
        },
      }
    );

    const data = await response.json();

    return {
      status: "success",
      data,
    };
  } catch (err) {
    return {
      status: "error",
      error: err.message,
    };
  }
}