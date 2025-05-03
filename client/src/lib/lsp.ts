import {
    LSPCompletionItem,
    LSPCompletionResult,
    LSPDefinition,
    LSPDiagnostic, LSPHover, LSPReferenceResult,
    LSPResponse,
    pendingRequests
} from "../types";
import {Diagnostic} from "@codemirror/lint";
import {EditorView} from "@codemirror/view";
import {URI_BASE, WORKSPACE} from "../constants.ts";
import {getCursorPos, getFileUri, posToHead} from "../utils.ts";
import {MutableRefObject} from "react";
import {SessionI} from "../modules/Sessions.tsx";
import {fetchSourceCode} from "../api/api.ts";

const DIAGNOSTICS_METHOD = "textDocument/publishDiagnostics";
const SEVERITY_MAP: Record<number, string> = {
    1: "error",
    2: "warning",
    3: "info",
    4: "hint",
}

const SKIP_ERROR_NO_IDENTIFIER = "no identifier found"

// LSP events
const EVENT_INITIALIZE = "initialize"
const EVENT_INITIALIZED = "initialized"
const EVENT_IMPLEMENTATION = "textDocument/implementation"
const EVENT_DEFINITION = "textDocument/definition"
const EVENT_REFERENCES = "textDocument/references"
const EVENT_COMPLETION = "textDocument/completion"
const EVENT_HOVER = "textDocument/hover"
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
    goVersion: string;
    file: MutableRefObject<string>;
    sessions: MutableRefObject<SessionI[]>;
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
        file: MutableRefObject<string>,
        sessions: MutableRefObject<SessionI[]>,
        handleDiagnostic: (diagnostic: Diagnostic[]) => void,
        handleError: (error: string) => void,
    ) {
        this.file = file;
        this.sessions = sessions;
        this.handleDiagnostic = handleDiagnostic;
        this.handleError = handleError;
        this.goVersion = initialSandboxVersion;
        this.ws = new WebSocket(backendUrl);
        this.requestId = 0;
        this.pendingRequests = new Map();
        this.view = view;

        this.start()
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

    async getUsages(): Promise<LSPReferenceResult[]> {
        try {
            const {row, col} = getCursorPos(this.view);
            const line = row - 1; // 0-based index
            const character = col - 1; // 0-based index
            const res = await this.sendRequest<LSPDefinition[]>(EVENT_REFERENCES, {
                textDocument: {uri: this.file.current},
                position: {line, character},
                context: {includeDeclaration: false}
            });
            return res.result || [];
        } catch (e) {
            throw new Error(`Error getting usages from LSP server: ${e}`);
        }
    }

    async loadDefinition() {
        // start getting the definition
        const {row: currentRow, col: currentCol} = getCursorPos(this.view);
        const definitions = await this.getDefinition(currentRow - 1, currentCol - 1, this.file.current);

        // quit if no definition
        if (!definitions.length) {
            return
        }

        const path = decodeURIComponent(definitions[0].uri);
        this.file.current = path; // update file immediately

        const {is_main, error, content} = await fetchSourceCode(path, this.goVersion)
        const {range: {start: {line, character}}} = definitions[0];
        const row = line + 1; // 1-based index
        const col = character + 1; // 1-based index

        if (error) {
            this.handleError(error);
            return;
        }
        if (is_main) {
            this.view.dispatch({
                selection: {
                    anchor: posToHead(this.view, row, col), // 1-based index
                },
                scrollIntoView: true,
            })
        }
        if (content) {
            // update the doc first
            this.view.dispatch({
                changes: {
                    from: 0,
                    to: this.view.state.doc.length,
                    insert: content
                },
            });
            // then move the cursor
            this.view.dispatch({
                selection: {
                    anchor: posToHead(this.view, row, col), // 1-based index
                },
                scrollIntoView: true,
            })

            // update the sessions
            const data = {id: path, cursor: posToHead(this.view, row, col), data: content}
            const index = this.sessions.current.findIndex((s) => s.id === path)
            if (index == -1) {
                this.sessions.current.push(data) // not in the list
            } else {
                this.sessions.current[index] = data // update the item in the list
            }
            this.view.focus()
        }
    }

    sendRequest<T = LSPCompletionItem[] | LSPReferenceResult[] | LSPDefinition[] | LSPHover>(method: string, params: object): Promise<LSPResponse<T>> {
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
            textDocument: {uri: getFileUri(this.goVersion), version}, // version should be incremented
            contentChanges: [{text}],
        });
    }

    async hover(line: number, character: number): Promise<LSPHover | null> {
        try {
            const res = await this.sendRequest<LSPHover>(EVENT_HOVER, {
                textDocument: {uri: getFileUri(this.goVersion)},
                position: {line, character},
            });
            return res.result || null;
        } catch (e) {
            throw new Error(`Error getting hover from LSP server: ${e}`);
        }
    }

    async getImplementations(uri: string): Promise<LSPDefinition[]> {
        try {
            const {row, col} = getCursorPos(this.view);
            const line = row - 1; // 0-based index
            const character = col - 1; // 0-based index
            const res = await this.sendRequest<LSPDefinition[]>(EVENT_IMPLEMENTATION, {
                textDocument: { uri },
                position: { line, character }
            });
            return res.result || [];
        } catch (e) {
            throw new Error(`Error getting implementation from LSP server: ${e}`);
        }
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
                textDocument: {uri: getFileUri(this.goVersion)},
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
                    uri: getFileUri(this.goVersion),
                    languageId: "go",
                    version,
                    text,
                },
            });
        } catch (error) {
            console.error("LSP Initialize error:", error)
        }
    }

    start() {
        this.ws = new WebSocket(this.ws.url);
        this.ws.onopen = async () => {
            await this.initialize(1, this.view.state.doc.toString());
        };
        this.ws.onmessage = (event) => this.handleMessage(event.data);
        this.ws.onerror = (e) => console.error("LSP WebSocket error:", e);
        this.ws.onclose = (e) => console.log("LSP WebSocket closed:", e);
    }

    reset() {
        this.requestId = 0;
        this.pendingRequests.clear();
    }

    async reconnect() {
        if (this.ws.readyState !== WebSocket.CLOSED) {
            return;
        }
        this.reset();
        this.ws.close();
        this.start();
    }

    keepAlive() {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({jsonrpc: "2.0", method: "keepAlive", params: {}}));
        }
    }

    handleMessage(data: string) {
        try {
            const message = JSON.parse(data);
            const {id, method, params, error} = message;
            if (error) {
                // skip these errors since they are trivial
                // this is for getting usages
                if (error.message === SKIP_ERROR_NO_IDENTIFIER) {
                    return;
                }
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
            this.handleError(error as string);
        }
    }
}
