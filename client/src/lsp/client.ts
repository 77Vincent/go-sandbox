import {Ace} from "ace-builds";
import {LSPCompletionItem, LSPCompletionResponse} from "../types";

const WORKSPACE = "workspace";
const URI_BASE = `file:///${WORKSPACE}`
const URI = `${URI_BASE}/main.go`

function isFunc(kind: number | undefined): boolean {
    if (kind === undefined) {
        return false;
    }
    return kind === 2 || kind === 3
}

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
            caption: v.label, // The text to display in the completion list.
            value: v.label, // The text to insert when the completion is selected.
            snippet: isFunc(v.kind) ? v.insertText || v.label : undefined,
            meta: v.detail || 'LSP', // The type of completion (e.g., function, variable).
            docText: v.documentation?.value || undefined,
            score: v.sortText ? parseInt(v.sortText) : 0,
        })
    })

    return completions;
}

export default class LSPClient {
    editor: Ace.Editor;
    ws: WebSocket;
    requestId: number;
    pendingRequests: Map<number, { resolve: (result: any) => void; reject: (error: any) => void }>;

    constructor(url: string, editor: Ace.Editor) {
        this.editor = editor;
        this.ws = new WebSocket(url);
        this.requestId = 0;
        this.pendingRequests = new Map();

        this.ws.onopen = () => {
            // Optionally send the initialize request here:
            this.sendRequest("initialize", {capabilities: {}})
                .then(() => {
                })
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

    async didChange(version: number, text: string): Promise<void> {
        this.sendNotification("textDocument/didChange", {
            textDocument: {uri: URI, version}, // Update version as needed.
            contentChanges: [{text}],
        });
    }

    async getCompletions(): Promise<Ace.Completion[]> {
        try {
            const pos = this.editor.getCursorPosition();
            const response = await this.sendRequest("textDocument/completion", {
                textDocument: {uri: URI},
                position: {line: pos.row, character: pos.column},
            });
            console.log("Completion response:", response.result.items);
            return getCompletions(response);
        } catch (e) {
            console.error("Completion request error:", e);
            return [];
        }
    }

    async initialize(): Promise<void> {
        try {
            await this.sendRequest("initialize", {
                rootUri: URI_BASE,
                workspaceFolders: [{uri: URI_BASE, name: WORKSPACE}],
                capabilities: {},
            })
            this.sendNotification("initialized", {});
            this.sendNotification("textDocument/didOpen", {
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
                console.log("LSP notification:", message);
            }
        } catch (error) {
            console.error("Error parsing LSP message:", error);
        }
    }

}
