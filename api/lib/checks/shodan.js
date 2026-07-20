export async function checkShodan(hostname) {
  try {
    const response = await fetch(`https://internetdb.shodan.io/${hostname}`);

    if (response.status === 404) {
      return {
        status: "success",
        data: {
          ports: [],
          vulns: {},
          hostnames: [],
          tags: [],
          cpes: [],
        },
      };
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

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