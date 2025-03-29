declare module "monaco-vim" {
    // Tweak these signatures to be more specific if desired
    export function initVimMode(editor: any, statusBar: HTMLElement): void;
}

interface NavigatorUAData {
    platform: string;
    // Add any other properties you need
    // brands?: Array<{ brand: string; version: string }>;
    // mobile?: boolean;
}

declare global {
    interface Window {
        ace: any;
    }
    interface Navigator {
        userAgentData?: NavigatorUAData;
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

export type mySandboxes = "my-sandbox-1" | "my-sandbox-2" | "my-sandbox-3" | "my-sandbox-4" | "my-sandbox-5"

export type languages = "en" | "zh_CN" | "zh_TW" | "ja"

export type resultType = "stdout" | "stderr"

export type toastType = "info" | "error"

export interface resultI {
    type: resultType;
    content: string;
}
