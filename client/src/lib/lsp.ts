import {
    LSPCompletionItem,
    LSPCompletionResult,
    LSPDefinition,
    LSPDiagnostic,
    LSPResponse,
    pendingRequests
} from "../types";
import {Diagnostic} from "@codemirror/lint";
import {EditorView} from "@codemirror/view";
import {URI_BASE, WORKSPACE} from "../constants.ts";
import {getFileUri} from "../utils.ts";

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
const EVENT_DEFINITION = "textDocument/definition"
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

export class LSPClient {
    sandboxVersion: string;
    ws: WebSocket;
    requestId: number;
    pendingRequests: pendingRequests;
    view: EditorView;
    handleDiagnostic: (diagnostic: Diagnostic[]) => void;
    handleError: (error: string) => void;

    constructor(
        backendUrl: string,
        initialSandboxVersion: string,
        view: EditorView,
        handleDiagnostic: (diagnostic: Diagnostic[]) => void,
        handleError: (error: string) => void,
    ) {
        this.handleDiagnostic = handleDiagnostic;
        this.handleError = handleError;
        this.sandboxVersion = initialSandboxVersion;
        this.ws = new WebSocket(backendUrl);
        this.requestId = 0;
        this.pendingRequests = new Map();
        this.view = view;

        this.ws.onopen = async () => {
            await this.initialize(1, this.view.state.doc.toString());
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

    sendRequest<T = LSPCompletionItem[] | LSPDefinition[]>(method: string, params: object): Promise<LSPResponse<T>> {
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
            textDocument: {uri: getFileUri(this.sandboxVersion), version}, // version should be incremented
            contentChanges: [{text}],
        });
    }

    async getDefinition(line: number, character: number, uri: string): Promise<LSPDefinition[]> {
        try {
            const res = await this.sendRequest<LSPDefinition[]>(EVENT_DEFINITION, {
                textDocument: {uri},
                position: {line, character},
            });
            return res.result || [];
        } catch (e) {
            throw new Error(`Error getting definition from LSP server: ${e}`);
        }
    }

    async getCompletions(line: number, character: number): Promise<LSPCompletionItem[]> {
        try {
            const res = await this.sendRequest<LSPCompletionResult>(EVENT_COMPLETION, {
                textDocument: {uri: getFileUri(this.sandboxVersion)},
                position: {line, character},
            });
            return res.result?.items || [];
        } catch (e) {
            throw new Error(`Error getting completions from LSP server: ${e}`);
        }
    }

    async initialize(version: number, text: string): Promise<void> {
        try {
            await this.sendRequest(EVENT_INITIALIZE, {
                rootUri: URI_BASE,
                workspaceFolders: [{uri: URI_BASE, name: WORKSPACE}],
                capabilities: {},
            })
            this.sendNotification(EVENT_INITIALIZED, {});
            this.sendNotification(EVENT_DID_OPEN, {
                textDocument: {
                    uri: getFileUri(this.sandboxVersion),
                    languageId: "go",
                    version,
                    text,
                },
            });
        } catch (error) {
            console.error("LSP Initialize error:", error)
        }
    }

    handleMessage(data: string) {
        try {
            const message = JSON.parse(data);
            const {id, method, params, error} = message;
            if (error) {
                this.handleError(error.message);
                // do not return here, we still need to process
            }

            // handle pending requests
            if (id && this.pendingRequests.has(id)) {
                const {resolve} = this.pendingRequests.get(id)!;
                resolve(message);
                this.pendingRequests.delete(id);
                return
            }

            // Handle notifications or unsolicited messages
            if (method === DIAGNOSTICS_METHOD) {
                this.handleDiagnostic(params.diagnostics.map((diagnostic: LSPDiagnostic) => {
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
