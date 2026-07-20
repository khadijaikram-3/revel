export async function checkClickjacking(targetUrl) {
    try {
        const response = await fetch(targetUrl, {
            method: "HEAD",
        });

        const xFrame = response.headers.get("x-frame-options");
        const csp = response.headers.get("content-security-policy");

        return {
            status: "success",
            data: {
                protected:
                    !!xFrame ||
                    (csp && csp.includes("frame-ancestors")),
                xFrameOptions: xFrame,
                csp,
            },
        };
    } catch (err) {
        return {
            status: "error",
            error: err.message,
        };
    }
}