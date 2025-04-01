export default class LSPClient {
    ws: WebSocket;
    requestId: number;
    pendingRequests: Map<number, { resolve: (result: any) => void; reject: (error: any) => void }>;

    constructor(url: string) {
        this.ws = new WebSocket(url);
        this.requestId = 0;
        this.pendingRequests = new Map();

        this.ws.onopen = () => {
            console.log("LSP WebSocket connected");
            // Optionally send the initialize request here:
            this.sendRequest("initialize", {capabilities: {}})
                .then((res) => console.log("Initialize response:", res))
                .catch((err) => console.error("Initialize error:", err));
        };

        this.ws.onmessage = (event) => this.handleMessage(event.data);
        this.ws.onerror = (e) => console.error("LSP WebSocket error:", e);
        this.ws.onclose = (e) => console.log("LSP WebSocket closed:", e);
    }

    sendNotification(method: string, params: any): void {
        const notification = {
            jsonrpc: "2.0",
            method,
            params,
        };

        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(notification));
            return
        }

        this.ws.addEventListener(
            "open",
            () => {
                this.ws.send(JSON.stringify(notification));
            },
            {once: true}
        );
    }

    sendRequest(method: string, params: any): Promise<any> {
        const id = ++this.requestId;
        const request = {
            jsonrpc: "2.0",
            id,
            method,
            params,
        };
        return new Promise((resolve, reject) => {
            this.pendingRequests.set(id, {resolve, reject});
            if (this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify(request));
            } else {
                this.ws.addEventListener("open", () => {
                    this.ws.send(JSON.stringify(request));
                }, {once: true});
            }
        });
    }

    handleMessage(data: string) {
        try {
            const message = JSON.parse(data);
            if (message.id && this.pendingRequests.has(message.id)) {
                const {resolve} = this.pendingRequests.get(message.id)!;
                resolve(message);
                this.pendingRequests.delete(message.id);
            } else {
                // Handle notifications or unsolicited messages
                console.log("LSP notification:", message);
            }
        } catch (error) {
            console.error("Error parsing LSP message:", error);
        }
    }
}
