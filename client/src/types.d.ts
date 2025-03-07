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
