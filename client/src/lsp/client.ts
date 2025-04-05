import {LSPCompletionItem, LSPCompletionResponse, pendingRequests} from "../types";

const WORKSPACE = "workspace";
const URI_BASE = `file:///${WORKSPACE}`
const URI = `${URI_BASE}/main.go`

// LSP events
const EVENT_INITIALIZE = "initialize"
const EVENT_INITIALIZED = "initialized"
const EVENT_COMPLETION = "textDocument/completion"
const EVENT_DID_OPEN = "textDocument/didOpen"
const EVENT_DID_CHANGE = "textDocument/didChange"
const KIND_MAP: Record<number, string> = {
    1: "Text",
    2: "Method",
    3: "Function",
    4: "Constructor",
    5: "Field",
    6: "Variable",
    7: "Class",
    8: "Interface",
    9: "Module",
    10: "Property",
    11: "Unit",
    12: "Value",
    13: "Enum",
    14: "Keyword",
    15: "Snippet",
    16: "Color",
    17: "File",
    18: "Reference",
    19: "Folder",
    20: "EnumMember",
    21: "Constant",
    22: "Struct",
    23: "Event",
    24: "Operator",
    25: "TypeParameter",
}

export default class LSPClient {
    ws: WebSocket;
    requestId: number;
    pendingRequests: pendingRequests;

    constructor(url: string) {
        this.ws = new WebSocket(url);
        this.requestId = 0;
        this.pendingRequests = new Map();

        this.ws.onopen = () => {
            // Optionally send the initialize request here:
            this.sendRequest(EVENT_INITIALIZE, {capabilities: {}})
                .then(() => {
                })
                .catch((err) => console.error("Initialize error:", err));
        };

        this.ws.onmessage = (event) => this.handleMessage(event.data);
        this.ws.onerror = (e) => console.error("LSP WebSocket error:", e);
        this.ws.onclose = (e) => console.log("LSP WebSocket closed:", e);
    }

    sendNotification(method: string, params: object): void {
        const notification = {jsonrpc: "2.0", method, params,};

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

    sendRequest(method: string, params: object): Promise<LSPCompletionResponse> {
        const id = ++this.requestId;
        const request = {jsonrpc: "2.0", id, method, params,};
        return new Promise((resolve, reject) => {
            this.pendingRequests.set(id, {resolve, reject});

            if (this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify(request));
                return
            }

            this.ws.addEventListener("open", () => {
                this.ws.send(JSON.stringify(request));
            }, {once: true});
        });
    }

    async didChange(version: number, text: string): Promise<void> {
        this.sendNotification(EVENT_DID_CHANGE, {
            textDocument: {uri: URI, version}, // Update version as needed.
            contentChanges: [{text}],
        });
    }

    // TODO: Implement a method to handle the response from the server
    async getCompletions() {
        try {
            return await this.sendRequest(EVENT_COMPLETION, {
                textDocument: {uri: URI},
                // position: {line: pos.row, character: pos.column},
                context: {triggerKind: 2}, // Triggered by typing
            });
        } catch (e) {
            console.error("Completion request error:", e);
            return [];
        }
    }

    async initialize(): Promise<void> {
        try {
            await this.sendRequest(EVENT_INITIALIZE, {
                rootUri: URI_BASE,
                workspaceFolders: [{uri: URI_BASE, name: WORKSPACE}],
                capabilities: {},
            })
            this.sendNotification(EVENT_INITIALIZED, {});
            this.sendNotification(EVENT_DID_OPEN, {
                textDocument: {
                    uri: URI,
                    languageId: "go",
                    version: 1,
                    text: "" // TODO: Add the initial text content here
                },
            });
        } catch (error) {
            console.error("LSP Initialize error:", error)
        }
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
                // console.log("LSP notification:", message);
            }
        } catch (error) {
            console.error("Error parsing LSP message:", error);
        }
    }

}
