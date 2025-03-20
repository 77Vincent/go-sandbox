import {ExecuteResultI} from "../types";
import {HTTP_INTERNAL_ERROR} from "../constants.ts";

const apiUrl = import.meta.env.VITE_API_URL || "";

function getUrl(path: string): string {
    if (import.meta.env.MODE === "development") {
        return `/api${path}`;
    }
    return `${apiUrl}${path}`;
}

export async function healthCheck() {
    const res = await fetch(getUrl("/status"));
    if (!res.ok) {
        throw new Error("Failed to fetch");
    }
    return await res.json();
}

export async function formatCode(code: string): Promise<ExecuteResultI> {
    const res = await fetch(getUrl("/format"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({code}),
    });

    if (res.status === HTTP_INTERNAL_ERROR) {
        const {error} = await res.json();
        throw new Error(error);
    }

    return await res.json();
}
