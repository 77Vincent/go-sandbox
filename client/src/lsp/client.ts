import {Ace} from "ace-builds";
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

export function getCompletions(response: LSPCompletionResponse): Ace.Completion[] {
    // Check if the response contains an error.
    if (response.error) {
        console.error("LSP completion response error:", response.error.message);
        return [];
    }

    // Get the items from the response.
    let items: LSPCompletionItem[] = [];
    if (Array.isArray(response.result)) {
        items = response.result;
    } else if (response.result && Array.isArray(response.result.items)) {
        items = response.result.items;
    }

    // Map LSP completion items to Ace's format.
    const completions: Ace.Completion[] = []
    items.forEach(v => {
        completions.push({
            completerId: "lsp",
            caption: v.label, // The text to display in the completion list.
            value: v.insertText || v.label, // The text to insert when the completion is selected.
            snippet: v.insertText || v.label, // The text to insert when the completion is selected.
            meta: v.detail || 'LSP', // The type of completion (e.g., function, variable).
            docText: v.documentation?.value,
            score: v.sortText ? parseInt(v.sortText) + 100 : 0,
        })
    })

    return completions;
}

export default class LSPClient {
    editor: Ace.Editor;
    ws: WebSocket;
    requestId: number;
    pendingRequests: pendingRequests;

    constructor(url: string, editor: Ace.Editor) {
        this.editor = editor;
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

    async getCompletions(): Promise<Ace.Completion[]> {
        try {
            const pos = this.editor.getCursorPosition();
            const response = await this.sendRequest(EVENT_COMPLETION, {
                textDocument: {uri: URI},
                position: {line: pos.row, character: pos.column},
            });
            return getCompletions(response);
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
                    text: this.editor.getValue(),
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
