export async function checkSQLInjection(targetUrl) {
    try {
        const payload = "' OR 1=1--";

        const url = `${targetUrl}?id=${encodeURIComponent(payload)}`;

        const response = await fetch(url);
        const body = await response.text();

        const sqlErrors = [
            "sql syntax",
            "mysql",
            "postgresql",
            "sqlite",
            "oracle",
            "odbc",
            "syntax error",
            "sqlstate",
        ];

        const vulnerable = sqlErrors.some(error =>
            body.toLowerCase().includes(error)
        );

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