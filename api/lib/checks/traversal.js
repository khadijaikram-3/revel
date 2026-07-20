export async function checkDirectoryTraversal(targetUrl) {
    try {
        const payload = "../../../../etc/passwd";

        const url = `${targetUrl}?file=${encodeURIComponent(payload)}`;

        const response = await fetch(url);

        const body = await response.text();

        const vulnerable =
            body.includes("root:") ||
            body.includes("/bin/bash");

        return {
            status: "success",
            data: {
                vulnerable,
                payload,
            },
        };
    } catch (err) {
        return {
            status: "error",
            error: err.message,
        };
    }
}