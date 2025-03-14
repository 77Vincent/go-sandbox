import {ExecuteResultI, SSEEvent} from "../types";
import {HTTP_INTERNAL_ERROR} from "../constants.ts";

export async function healthCheck() {
    const res = await fetch("/api/status");
    if (!res.ok) {
        throw new Error("Failed to fetch");
    }
    return await res.json();
}

export async function* executeCodeStream(code: string): AsyncGenerator<SSEEvent, void, unknown> {
    const res = await fetch("/api/execute", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({code}),
    })

    if (res.status === HTTP_INTERNAL_ERROR) {
        const {error} = await res.json();
        throw new Error(error);
    }

    // 获取响应流
    const reader = res.body?.getReader();
    if (!reader) {
        throw new Error("ReadableStream not supported.");
    }

    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // 将读取到的数据解码并累加到 buffer 中
        buffer += decoder.decode(value, { stream: true });
        // SSE 事件以两个换行符 "\n\n" 作为分隔符
        const parts = buffer.split("\n\n");
        // 最后一部分可能不完整，保留到下一轮处理
        buffer = parts.pop() || "";

        for (const part of parts) {
            const lines = part.split("\n").filter(line => line.trim() !== "");
            let eventName = "message";
            let data = "";
            for (const line of lines) {
                if (line.startsWith("event:")) {
                    eventName = line.substring("event:".length).trim();
                } else if (line.startsWith("data:")) {
                    data += line.substring("data:".length).trim() + "\n";
                }
            }
            if (data.endsWith("\n")) {
                data = data.slice(0, -1);
            }
            yield { event: eventName, data };
        }
    }

    return
}

export async function formatCode(code: string): Promise<ExecuteResultI> {
    const res = await fetch("/api/format", {
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
