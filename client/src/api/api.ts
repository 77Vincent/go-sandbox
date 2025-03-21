import {ExecuteResultI} from "../types";
import {HTTP_INTERNAL_ERROR, HTTP_NOT_FOUND} from "../constants.ts";
import {getUrl} from "../utils.ts";

export async function healthCheck() {
    const res = await fetch(getUrl("/status"));
    if (!res.ok) {
        throw new Error("Failed to fetch");
    }
    return await res.json();
}

export async function fetchSnippet(id: string): Promise<string> {
    const res = await fetch(getUrl(`/snippet/${id}`));
    if (res.status === HTTP_INTERNAL_ERROR || res.status === HTTP_NOT_FOUND) {
        const {error} = await res.json();
        throw new Error(error);
    }

    return await res.text();
}

export async function shareSnippet(code: string): Promise<string> {
    const res = await fetch(getUrl("/snippet"), {
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

    return await res.text();
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
