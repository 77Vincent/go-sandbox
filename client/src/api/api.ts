export async function healthCheck() {
    const res = await fetch("/api/status");
    if (!res.ok) {
        throw new Error("Failed to fetch");
    }
    return await res.json();
}

interface BaseResultI {
    error?: string;
}

interface ExecuteResultI extends BaseResultI {
    output: string;
}

interface FormatResultI extends BaseResultI {
    output: string;
}

export async function executeCode(code: string): Promise<ExecuteResultI> {
    const res = await fetch("/api/execute", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({code}),
    })

    if (!res.ok) {
        // how to throw structured error here?
        const {error} = await res.json();
        throw new Error(error);
    }

    return await res.json();
}

export async function formatCode(code: string): Promise<FormatResultI> {
    const res = await fetch("/api/format", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({code}),
    });

    if (!res.ok) {
        // how to throw structured error here?
        const {error} = await res.json();
        throw new Error(error);
    }

    return await res.json();
}
