// api/lib/validators.js

/**
 * Validate and normalize a target URL.
 */
export function validateTargetUrl(input) {
  if (!input || typeof input !== "string") {
    throw new Error("Target URL is required.");
  }

  let url = input.trim();

  // Add https:// if protocol is missing
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  let parsed;

  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Invalid URL.");
  }

  // Only allow HTTP & HTTPS
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only HTTP and HTTPS URLs are allowed.");
  }

  // Prevent localhost/private scans
  const hostname = parsed.hostname.toLowerCase();

  const blockedHosts = [
    "localhost",
    "127.0.0.1",
    "::1",
    "0.0.0.0"
  ];

  if (blockedHosts.includes(hostname)) {
    throw new Error("Scanning localhost is not allowed.");
  }

  return {
    normalizedUrl: parsed.toString(),
    hostname: parsed.hostname,
    protocol: parsed.protocol
  };
}