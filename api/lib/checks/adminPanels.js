const COMMON_ADMIN_PATHS = [
  "/admin",
  "/administrator",
  "/login",
  "/wp-admin",
  "/cpanel",
  "/phpmyadmin",
];

export async function checkAdminPanels(targetUrl) {
  const found = [];

  for (const path of COMMON_ADMIN_PATHS) {
    try {
      const response = await fetch(
        `${targetUrl.replace(/\/$/, "")}${path}`,
        {
          method: "HEAD",
          redirect: "manual",
        }
      );

      if (
        response.status === 200 ||
        response.status === 401 ||
        response.status === 403
      ) {
        found.push({
          path,
          status: response.status,
        });
      }
    } catch {}
  }

  return {
    status: "success",
    data: {
      found,
      count: found.length,
    },
  };
}