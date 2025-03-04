export async function healthCheck() {
    const res = await fetch("/api/status");
    if (!res.ok) {
        throw new Error("Failed to fetch");
    }
    return await res.json();
}

export async function formatCode(code: string): Promise<string> {
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
