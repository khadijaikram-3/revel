// api/test-shodan.js — Test your REAL Shodan key
export default async function handler(req, res) {
  const SHODAN_API_KEY = process.env.SHODAN_API_KEY;
  const target = "scanme.nmap.org"; // This is a SAFE, legal test site

  console.log("========================================");
  console.log("[test-shodan] Testing your Shodan API Key");
  console.log("[test-shodan] API Key:", SHODAN_API_KEY ? `${SHODAN_API_KEY.substring(0, 6)}...` : "NOT FOUND");
  console.log("[test-shodan] Target:", target);

  let result = {};

  if (!SHODAN_API_KEY) {
    result.error = "SHODAN_API_KEY is not set in environment variables";
    return res.status(500).json(result);
  }

  try {
    // ✅ TRY THE FREE HOST ENDPOINT (This is what actually works)
    const url = `https://api.shodan.io/shodan/host/scanme.nmap.org?key=${SHODAN_API_KEY}`;
    console.log("[test-shodan] Requesting:", url);

    const response = await fetch(url);

    console.log("[test-shodan] Response Status:", response.status);

    if (response.ok) {
      const data = await response.json();
      result = {
        success: true,
        status: response.status,
        message: "✅ SHODAN KEY IS WORKING!",
        data: {
          ip: data.ip_str,
          ports: data.ports || [],
          hostnames: data.hostnames || [],
          org: data.org || "N/A",
          os: data.os || "N/A",
        },
      };
      console.log("[test-shodan] ✅ Key works! Found ports:", data.ports);
    } else {
      const errorText = await response.text();
      result = {
        success: false,
        status: response.status,
        message: `❌ Shodan API returned ${response.status}`,
        error: errorText,
        suggestion: "",
      };

      // ✅ GIVE SPECIFIC ADVICE BASED ON STATUS CODE
      if (response.status === 403) {
        result.suggestion =
          "Your Shodan API key is valid but you are using the wrong endpoint. Your key works for the free tier, but this endpoint requires a paid plan. Try using https://api.shodan.io/shodan/host/{ip}?key=...";
      } else if (response.status === 401) {
        result.suggestion = "Your Shodan API key is INVALID. Generate a new one in your Shodan account.";
      } else if (response.status === 402) {
        result.suggestion = "You have exceeded your Shodan API credit limit. You need to purchase more credits or wait for the monthly reset.";
      } else if (response.status === 404) {
        result.suggestion = "The host was not found in Shodan's database. This is normal for new or uncommon IPs.";
      }
    }
  } catch (error) {
    console.error("[test-shodan] Exception:", error.message);
    result = {
      success: false,
      message: "❌ Network error or timeout",
      error: error.message,
    };
  }

  console.log("========================================");
  return res.status(200).json(result);
}