declare module "monaco-vim" {
    // Tweak these signatures to be more specific if desired
    export function initVimMode(editor: any, statusBar: HTMLElement): void;
}

declare global {
    interface Window {
        ace: any;
    }
}

export type KeyBindings = "" | "vim" | "emacs";

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

export type languages = "en" | "zh_CN" | "zh_TW" | "ja"

export type resultType = "stdout" | "stderr"

export interface resultI {
    type: resultType;
    content: string;
}
