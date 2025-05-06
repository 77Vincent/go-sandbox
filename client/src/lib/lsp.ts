import {
    LSPCompletionItem,
    LSPCompletionResult,
    LSPDefinition,
    LSPDiagnostic,
    LSPDocumentSymbol,
    LSPHover,
    LSPReferenceResult,
    LSPResponse,
    pendingRequests,
    statsInfo
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
const SKIP_NO_METADATA_FOUND = "no package metadata for file"

// LSP events
const EVENT_INITIALIZE = "initialize"
const EVENT_INITIALIZED = "initialized"

const EVENT_IMPLEMENTATION = "textDocument/implementation"
const EVENT_DEFINITION = "textDocument/definition"
const EVENT_REFERENCES = "textDocument/references"
const EVENT_COMPLETION = "textDocument/completion"
const EVENT_DOCUMENT_SYMBOL = "textDocument/documentSymbol"

const EVENT_HOVER = "textDocument/hover"
const EVENT_DID_OPEN = "textDocument/didOpen"
const EVENT_DID_CHANGE = "textDocument/didChange"

export const SYMBOL_KIND_MAP: Record<number, string> = {
    1: "File",
    2: "Module",
    3: "Namespace",
    4: "Package",
    5: "Class",
    6: "Method",
    7: "Property",
    8: "Field",
    9: "Constructor",
    10: "Enum",
    11: "Interface",
    12: "Function",
    13: "Variable",
    14: "Constant",
    15: "String",
    16: "Number",
    17: "Boolean",
    18: "Array",
    19: "Object",
    20: "Key",
    21: "Null",
    22: "EnumMember",
    23: "Struct",
    24: "Event",
    25: "Operator",
    26: "TypeParameter"
};
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
    setReady: (ready: boolean) => void;
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
        setReady: (ready: boolean) => void
    ) {
        this.ws = new WebSocket(backendUrl);

        this.file = file;
        this.sessions = sessions;
        this.goVersion = initialSandboxVersion;
        this.requestId = 0;
        this.pendingRequests = new Map();
        this.view = view;

        this.handleDiagnostic = handleDiagnostic;
        this.handleError = handleError;
        this.setReady = setReady;

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

        const {is_main, error, content} = await fetchSourceCode(path, this.goVersion)
        const {range: {start: {line, character}}} = definitions[0];
        const row = line + 1; // 1-based index
        const col = character + 1; // 1-based index

        if (error) {
            this.handleError(error);
            return;
        }
        if (is_main) {
            this.file.current = path; // update file immediately
            this.view.dispatch({
                selection: {
                    anchor: posToHead(this.view, row, col), // 1-based index
                },
                effects: EditorView.scrollIntoView(posToHead(this.view, row, col), {
                    y: "center",
                }),
            })
        }
        if (content) {
            this.file.current = path; // update file immediately
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
                textDocument: {uri},
                position: {line, character}
            });
            return res.result || [];
        } catch (e) {
            throw new Error(`Error getting implementation from LSP server: ${e}`);
        }
    }

    async getDocumentSymbol(): Promise<LSPDocumentSymbol[]> {
        try {
            const res = await this.sendRequest<LSPDocumentSymbol[]>(EVENT_DOCUMENT_SYMBOL, {
                textDocument: {uri: getFileUri(this.goVersion)},
            });
            return res.result || [];
        } catch (e) {
            throw new Error(`Error getting document symbol from LSP server: ${e}`);
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
            this.setReady(true);
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
                if (error.message.includes(SKIP_NO_METADATA_FOUND)) {
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

export function countSymbols(arr: LSPDocumentSymbol[]): statsInfo {
    const output: statsInfo = {
        file: 0,
        module: 0,
        namespace: 0,
        package: 0,
        class: 0,
        method: 0,
        property: 0,
        field: 0,
        constructor: 0,
        enum: 0,
        interface: 0,
        function: 0,
        variable: 0,
        constant: 0,
        string: 0,
        number: 0,
        boolean: 0,
        array: 0,
        object: 0,
        key: 0,
        null: 0,
        enumMember: 0,
        struct: 0,
        event: 0,
        operator: 0,
        typeParameter: 0
    }
    for (let i = 0; i < arr.length; i++) {
        const {kind} = arr[i];
        switch (kind) {
            case 1: // file
                output.file++;
                break;
            case 2: // module
                output.module++;
                break;
            case 3: // namespace
                output.namespace++;
                break;
            case 4: // package
                output.package++;
                break;
            case 5: // class
                output.class++;
                break;
            case 6: // method
                output.method++;
                break;
            case 7: // property
                output.property++;
                break;
            case 8: // field
                output.field++;
                break;
            case 9: // constructor
                output.constructor++;
                break;
            case 10: // enum
                output.enum++;
                break;
            case 11: // interface
                output.interface++;
                break;
            case 12: // function
                output.function++;
                break;
            case 13: // variable
                output.variable++;
                break;
            case 14: // constant
                output.constant++;
                break;
            case 15: // string
                output.string++;
                break;
            case 16: // number
                output.number++;
                break;
            case 17: // boolean
                output.boolean++;
                break;
            case 18: // array
                output.array++;
                break;
            case 19: // object
                output.object++;
                break;
            case 20: // key
                output.key++;
                break;
            case 21: // null
                output.null++;
                break;
            case 22: // enumMember
                output.enumMember++;
                break;
            case 23: // struct
                output.struct++;
                break;
            case 24: // event
                output.event++;
                break;
            case 25: // operator
                output.operator++;
                break;
            case 26: // typeParameter
                output.typeParameter++;
                break;
        }
    }
    return output;
}
