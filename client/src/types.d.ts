declare global {
}

export type KeyBindingsType = "" | "vim" | "emacs";

export {};

export interface ExecuteResultI {
    error: string;
    message: string
    stdout: string;
    stderr: string;
}

export interface SSEEvent {
    event: string;
    data: string;
}

export interface patchI {
    value: string;
    keepCursor?: boolean;
}

export type mySandboxes =
    "my-sandbox-temp"
    | "my-sandbox-1"
    | "my-sandbox-2"
    | "my-sandbox-3"
    | "my-sandbox-4"
    | "my-sandbox-5"
    | "my-sandbox-6"
    | "my-sandbox-7"
    | "my-sandbox-8"
    | "my-sandbox-9"
    | "my-sandbox-10"

export type languages =
    "en"
    | "zh_CN"
    | "zh_TW"
    | "ja"
    | "ko"
    | "fr"
    | "de"
    | "es"
    | "it"
    | "ru"
    | "hi"
    | "pt_BR"
    | "pt_PT"
    | "vi"
    | "th"
    | "tr"
    | "id"
    | "uk"
    | "pl"
    | "nl"
    | "he"
    | "ar"

export type resultType = "stdout" | "stderr"

export type toastType = "info" | "error"

export type selectableDrawers = "documentSymbols" | "stats" | ""

export interface resultI {
    type: resultType;
    content: string;
}

export interface fetchSourceRes {
    content: string;
    error: string;
    is_main: boolean;
}

export type SeeingType = "usages" | "implementations"

export interface LSPResponse<T> {
    jsonrpc: string;
    id: number;
    result?: T;
    error?: { code: number; message: string; data?: unknown };
}

export interface PendingRequestI {
    resolve: (result: LSPResponse) => void;
    reject: (error: LSPResponse) => void;
}

export type pendingRequests = Map<number, PendingRequestI>;

export interface LSPDefinition {
    uri: string;
    range: LSPRange;
}

export interface LSPDocumentSymbol {
    name: string;
    kind: number;
    location: {
        uri: string;
        range: LSPRange;
    }
}

export interface AppContextI {
    // language
    lan: languages;
    setLan: (lan: languages) => void;
    // file
    file: string;
    setFile: (file: string) => void;
    // go version
    goVersion: string;
    setGoVersion: (goVersion: string) => void;
    // sandbox id
    sandboxId: mySandboxes;
    setSandboxId: (sandboxId: mySandboxes) => void;
    // toast
    toastInfo: ReactNode;
    setToastInfo: (toastInfo: ReactNode) => void;
    toastError: ReactNode;
    setToastError: (toastError: ReactNode) => void;
}

export interface LSPCompletionItem {
    label: string;
    additionalTextEdits?: Array<{
        range: LSPRange;
        newText: string;
    }>
    insertText?: string;
    insertTextFormat?: number;
    detail?: string;
    kind?: number;
    filterText?: string;
    preselect?: boolean; // Whether this item is preselected
    sortText?: string;
    documentation?: {
        kind: string;
        value: string;
    };
    textEdit?: {
        range: LSPRange;
        newText: string;
    }
}

export interface LSPHover {
    contents: {
        kind: string;
        value: string;
    } | Array<{
        kind: string;
        value: string;
    }>;
    range?: LSPRange;
}

export interface LSPReferenceResult {
    range: LSPRange;
    uri: string;
}

export interface LSPCompletionResult {
    items: LSPCompletionItem[];
    isIncomplete?: boolean;
}

export interface LSPDiagnostic {
    range: LSPRange;
    severity: number;
    message: string;
    source?: string;
}

interface LSPRange {
    start: { line: number; character: number };
    end: { line: number; character: number };
}

export interface statsInfo {
    file: number,
    module: number,
    namespace: number,
    package: number,
    class: number,
    method: number,
    property: number,
    field: number,
    constructor: number,
    enum: number,
    interface: number,
    function: number,
    variable: number,
    constant: number,
    string: number,
    number: number,
    boolean: number,
    array: number,
    object: number,
    key: number,
    null: number,
    enumMember: number,
    struct: number,
    event: number,
    operator: number,
    typeParameter: number,
}
