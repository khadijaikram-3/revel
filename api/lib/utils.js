// api/lib/utils.js

/**
 * Common network timeout.
 */
export const DEFAULT_TIMEOUT = 10000;

/**
 * Fetch with timeout using AbortController.
 */
export async function fetchWithTimeout(
  url,
  options = {},
  timeout = DEFAULT_TIMEOUT
) {
  const controller = new AbortController();

  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    return response;
  } finally {
    clearTimeout(id);
  }
}

/**
 * Get friendly service name for a port.
 */
export function getPortName(port) {
  const ports = {
    20: "FTP (Data)",
    21: "FTP (Control)",
    22: "SSH",
    23: "Telnet",
    25: "SMTP",
    53: "DNS",
    80: "HTTP",
    110: "POP3",
    143: "IMAP",
    443: "HTTPS",
    3306: "MySQL",
    3389: "RDP",
    5432: "PostgreSQL",
    6379: "Redis",
    8080: "HTTP Alternate",
    8443: "HTTPS Alternate",
    27017: "MongoDB",
  };

  return ports[port] || "Unknown Service";
}

/**
 * Get remediation guidance for an exposed port.
 */
export function getPortRemediation(port) {
  const fixes = {
    22: "Restrict SSH access to trusted IP addresses or disable it if unused.",
    23: "Disable Telnet and replace it with SSH.",
    3306: "Restrict MySQL to localhost or trusted networks.",
    3389: "Disable RDP if not required or place it behind a VPN.",
    5432: "Restrict PostgreSQL access using firewall rules.",
    6379: "Do not expose Redis publicly.",
    27017: "Restrict MongoDB access using firewall rules.",
  };

  return (
    fixes[port] ||
    `Close port ${port} if it is not required for public access.`
  );
}