import {
    ACTIVE_SANDBOX_KEY,
    CURSOR_HEAD_KEY,
    DEFAULT_ACTIVE_SANDBOX,
    DEFAULT_AUTOCOMPLETION_ON,
    DEFAULT_CURSOR_HEAD,
    DEFAULT_EDITOR_SIZE,
    DEFAULT_GO_VERSION,
    DEFAULT_IS_VERTICAL_LAYOUT,
    DEFAULT_KEY_BINDINGS,
    DEFAULT_LANGUAGE,
    DEFAULT_LINT_ON,
    DEFAULT_MAIN_FILE_PATH,
    EDITOR_SIZE_KEY,
    FONT_SIZE_KEY,
    FONT_SIZE_M,
    GO_VERSION_KEY,
    HELLO_WORLD,
    IS_AUTOCOMPLETION_ON_KEY,
    IS_LINT_ON_KEY,
    IS_VERTICAL_LAYOUT_KEY,
    KEY_BINDINGS_KEY,
    LANGUAGE_KEY,
    MOBILE_WIDTH,
    MY_SANDBOXES,
    SANDBOX_NAMES_KEY,
    URI_BASE,
} from "./constants.ts";
import {KeyBindingsType, languages, mySandboxes} from "./types";
import {EditorView, ViewUpdate} from "@codemirror/view";

export function getFontSize(): number {
    return Number(localStorage.getItem(FONT_SIZE_KEY)) || FONT_SIZE_M
}

export function getSandboxId(): mySandboxes {
    return localStorage.getItem(ACTIVE_SANDBOX_KEY) as mySandboxes || DEFAULT_ACTIVE_SANDBOX
}

export function getLanguage(): languages {
    return localStorage.getItem(LANGUAGE_KEY) as languages || DEFAULT_LANGUAGE
}

export function getCursorHead(): number {
    return Number(localStorage.getItem(CURSOR_HEAD_KEY)) || DEFAULT_CURSOR_HEAD
}

export function getCodeContent(sandbox: mySandboxes): string {
    return localStorage.getItem(sandbox) || HELLO_WORLD
}

export function getKeyBindings(): KeyBindingsType {
    return localStorage.getItem(KEY_BINDINGS_KEY) as KeyBindingsType || DEFAULT_KEY_BINDINGS
}

export function getEditorSize(): number {
    return Number(localStorage.getItem(EDITOR_SIZE_KEY)) || DEFAULT_EDITOR_SIZE
}

export function getGoVersion(): string {
    return localStorage.getItem(GO_VERSION_KEY) || DEFAULT_GO_VERSION
}

export function isMobileDevice(): boolean {
    return window.innerWidth < MOBILE_WIDTH
}

export function getIsVerticalLayout(): boolean {
    // is mobile
    if (isMobileDevice()) {
        return true
    }

    return JSON.parse(localStorage.getItem(IS_VERTICAL_LAYOUT_KEY) || DEFAULT_IS_VERTICAL_LAYOUT)
}

export function getSandboxesNames(): Record<mySandboxes, string> {
    return JSON.parse(localStorage.getItem(SANDBOX_NAMES_KEY) || "{}") as Record<mySandboxes, string>
}

export function getSandboxes(): mySandboxes[] {
    const sandboxes: mySandboxes[] = []
    Object.keys(MY_SANDBOXES).forEach((key) => {
        if (localStorage.getItem(key) !== null) {
            sandboxes.push(key as mySandboxes)
        }
    })

    // if no sandboxes are found, create a default one
    if (sandboxes.length === 0) {
        const i = DEFAULT_ACTIVE_SANDBOX
        sandboxes.push(i)
        localStorage.setItem(ACTIVE_SANDBOX_KEY, i)
        localStorage.setItem(i, HELLO_WORLD)
    }

    return sandboxes
}

export function getLintOn(): boolean {
    return JSON.parse(localStorage.getItem(IS_LINT_ON_KEY) || DEFAULT_LINT_ON)
}

export function getAutoCompletionOn(): boolean {
    return JSON.parse(localStorage.getItem(IS_AUTOCOMPLETION_ON_KEY) || DEFAULT_AUTOCOMPLETION_ON)
}

export function mapFontSize(size: number): "xs" | "sm" | "md" {
    if (size < 12) return "xs";
    if (size >= 15) return "md";
    return "sm";
}

const apiUrl = import.meta.env.VITE_API_URL || "";
const isDev = import.meta.env.MODE === "development";

export function getUrl(path: string): string {
    if (isDev) {
        return `/api${path}`;
    }
    return `${apiUrl}${path}`;
}

export function getWsUrl(path: string): string {
    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
    const host = window.location.host;

    if (isDev) {
        return `${wsProtocol}://${host}/api${path}`;
    }
    return `${apiUrl.replace("https", "wss")}${path}`;
}

export function isMac(): boolean {
    const platform = navigator.userAgent;
    return platform?.toLowerCase().includes('mac') || navigator.platform.includes("Mac")
}

export function isUserCode(filePath: string): boolean {
    return filePath.includes(DEFAULT_MAIN_FILE_PATH)
}

export function getFileUri(sandboxVersion: string): string {
    return `${URI_BASE}/go${sandboxVersion}${DEFAULT_MAIN_FILE_PATH}`
}

export function displayFileUri(file: string): string {
    return file.includes(DEFAULT_MAIN_FILE_PATH) ? file.substring(21) : file.substring(24)
}

export function getCursorPos(v: ViewUpdate | EditorView) {
    // return 1-based index
    const pos = v.state.selection.main.head;
    const line = v.state.doc.lineAt(pos);
    return {row: line.number, col: pos - line.from + 1}
}

export function posToHead(v: ViewUpdate | EditorView, row: number, col: number) {
    const line = v.state.doc.line(row);
    return line.from + col - 1;
}
