declare global {}

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

export type mySandboxes = "my-sandbox-1" | "my-sandbox-2" | "my-sandbox-3" | "my-sandbox-4" | "my-sandbox-5" | "my-sandbox-6" | "my-sandbox-7" | "my-sandbox-8" | "my-sandbox-9" | "my-sandbox-10"

export type languages = "en" | "zh_CN" | "zh_TW" | "ja"

export type resultType = "stdout" | "stderr"

export type toastType = "info" | "error"

export interface resultI {
    type: resultType;
    content: string;
}

export interface LSPResponse {
    jsonrpc: string;
    id: number;
    result?: any;
    error?: { code: number; message: string; data?: any };
}

export interface PendingRequestI {
    resolve: (result: LSPResponse) => void;
    reject: (error: LSPResponse) => void;
}

export type pendingRequests = Map<number, PendingRequestI>;

export interface LSPCompletionItem {
    label: string;
    additionalTextEdits?: Array<{
        range: {
            start: { line: number; character: number };
            end: { line: number; character: number };
        };
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
        range: {
            start: { line: number; character: number };
            end: { line: number; character: number };
        };
        newText: string;
    }
}

export interface LSPCompletionResponse {
    jsonrpc: string;
    id: number;
    result?: { items: LSPCompletionItem[]; isIncomplete?: boolean };
    error?: { code: number; message: string; data?: any };
}
