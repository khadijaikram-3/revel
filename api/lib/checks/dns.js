export async function checkDNS(hostname) {
  try {
    const response = await fetch(
      `https://dns.google/resolve?name=${hostname}&type=A`
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