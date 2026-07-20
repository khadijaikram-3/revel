export async function checkSubdomains(hostname) {
  try {
    const response = await fetch(
      `https://crt.sh/?q=${hostname}&output=json`
    );

    if (!response.ok) {
      return {
        status: "error",
        error: "crt.sh unavailable",
      };
    }

    const data = await response.json();

    const names = [
      ...new Set(
        data
          .flatMap((x) => x.name_value.split("\n"))
          .filter(Boolean)
      ),
    ];

    return {
      status: "success",
      data: {
        total: names.length,
        subdomains: names.slice(0, 25),
      },
    };
  } catch (err) {
    return {
      status: "error",
      error: err.message,
    };
  }
}