export default async function handler(req, res) {
  const results = {};

  // Test with Google's DNS (1.1.1.1) — definitely in Shodan
  const testHosts = ['1.1.1.1', '8.8.8.8', 'scanme.nmap.org'];

  for (const host of testHosts) {
    try {
      const response = await fetch(`https://internetdb.shodan.io/${host}`);
      results[host] = {
        status: response.status,
        ok: response.ok,
      };
      if (response.ok) {
        const data = await response.json();
        results[host].ports = data.ports || [];
        results[host].vulns = Object.keys(data.vulns || {}).length;
      }
    } catch (err) {
      results[host] = { error: err.message };
    }
  }

  res.status(200).json(results);
}