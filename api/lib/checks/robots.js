export async function checkRobots(targetUrl) {
    try {
        const response = await fetch(`${targetUrl}/robots.txt`);

        return {
            status: "success",
            data: {
                exists: response.ok,
                statusCode: response.status,
            },
        };
    } catch (err) {
        return {
            status: "error",
            error: err.message,
        };
    }
}