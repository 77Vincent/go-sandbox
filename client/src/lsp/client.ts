import {LSPCompletionItem, LSPCompletionResponse, LSPDiagnostic, pendingRequests} from "../types";
import {Diagnostic} from "@codemirror/lint";
import {EditorView} from "@codemirror/view";

const WORKSPACE = "workspace";
const URI_BASE = `file:///${WORKSPACE}`
const URI = `${URI_BASE}/main.go`
const DIAGNOSTICS_METHOD = "textDocument/publishDiagnostics";
const SEVERITY_MAP: Record<number, string> = {
    1: "error",
    2: "warning",
    3: "info",
    4: "hint",
}

// LSP events
const EVENT_INITIALIZE = "initialize"
const EVENT_INITIALIZED = "initialized"
const EVENT_COMPLETION = "textDocument/completion"
const EVENT_DID_OPEN = "textDocument/didOpen"
const EVENT_DID_CHANGE = "textDocument/didChange"
export const LSP_KIND_LABELS: Record<number, string> = {
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
    view: EditorView;
    setDiagnostic: (diagnostic: Diagnostic[]) => void;

    constructor(url: string, view: EditorView, setDiagnostic: (diagnostic: Diagnostic[]) => void) {
        this.ws = new WebSocket(url);
        this.requestId = 0;
        this.pendingRequests = new Map();
        this.setDiagnostic = setDiagnostic;
        this.view = view;

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
            textDocument: {uri: URI, version}, // version should be incremented
            contentChanges: [{text}],
        });
    }

    async getCompletions(line: number, character: number): Promise<LSPCompletionItem[]> {
        try {
            const res = await this.sendRequest(EVENT_COMPLETION, {
                textDocument: {uri: URI},
                position: {line, character},
            });
            return res.result?.items || [];
        } catch (e) {
            throw new Error(`Error getting completions from LSP server: ${e}`);
        }
    }

    async initialize(value: string): Promise<void> {
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
                    text: value,
                },
            });
        } catch (error) {
            console.error("LSP Initialize error:", error)
        }
    }

    handleMessage(data: string) {
        try {
            const message = JSON.parse(data);
            const {id, method, params} = message;

            // handle pending requests
            if (id && this.pendingRequests.has(id)) {
                const {resolve} = this.pendingRequests.get(id)!;
                resolve(message);
                this.pendingRequests.delete(id);
                return
            }

            // Handle notifications or unsolicited messages
            if (method === DIAGNOSTICS_METHOD) {
                this.setDiagnostic(params.diagnostics.map((diagnostic: LSPDiagnostic) => {
                        const {range, severity, message, source} = diagnostic;
                        return {
                            from: this.view.state.doc.line(range.start.line + 1).from + range.start.character,
                            to: this.view.state.doc.line(range.end.line + 1).from + range.end.character,
                            severity: SEVERITY_MAP[severity],
                            message,
                            source,
                        }
                    }
                ))
            }
        } catch (error) {
            console.error("Error parsing LSP message:", error);
        }
    }

}
