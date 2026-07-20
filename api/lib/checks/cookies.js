export async function checkCookies(targetUrl) {
    try {
        const response = await fetch(targetUrl, {
            method: "HEAD",
        });

        const cookie = response.headers.get("set-cookie");

        return {
            status: "success",
            data: {
                present: !!cookie,
                secure: cookie?.includes("Secure") || false,
                httpOnly: cookie?.includes("HttpOnly") || false,
                sameSite:
                    cookie?.includes("SameSite") || false,
            },
        };
    } catch (err) {
        return {
            status: "error",
            error: err.message,
        };
    }
}