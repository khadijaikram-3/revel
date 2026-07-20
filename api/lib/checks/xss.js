export async function checkXSS(targetUrl) {
    try {
        const payload = "<script>alert('revel')</script>";
        const url = `${targetUrl}?revel=${encodeURIComponent(payload)}`;

        const response = await fetch(url);
        const html = await response.text();

        const reflected = html.includes(payload);

        return {
            status: "success",
            data: {
                vulnerable: reflected,
                payload,
                evidence: reflected ? "Payload reflected in response." : null,
            },
        };
    } catch (err) {
        return {
            status: "error",
            error: err.message,
        };
    }
}