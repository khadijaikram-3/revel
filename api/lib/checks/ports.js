export async function checkOpenPorts(hostname) {
  try {
    const response = await fetch(
      `https://internetdb.shodan.io/${hostname}`
    );

    if (!response.ok) {
      return {
        status: "error",
        error: "Host not found",
      };
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