import {
    SANDBOX_ID_KEY,
    CURSOR_HEAD_KEY,
    DEFAULT_SANDBOX_ID,
    DEFAULT_AUTOCOMPLETION_ON,
    DEFAULT_CURSOR_HEAD,
    DEFAULT_DRAWER_SIZE,
    DEFAULT_EDITOR_SIZE,
    DEFAULT_GO_VERSION,
    DEFAULT_IS_VERTICAL_LAYOUT,
    DEFAULT_KEY_BINDINGS,
    DEFAULT_LANGUAGE,
    DEFAULT_LINT_ON,
    DEFAULT_MAIN_FILE_PATH,
    NO_OPENED_DRAWER,
    DRAWER_SIZE_KEY,
    EDITOR_SIZE_KEY,
    FONT_SIZE_KEY,
    HELLO_WORLD,
    IS_AUTOCOMPLETION_ON_KEY,
    IS_LINT_ON_KEY,
    IS_VERTICAL_LAYOUT_KEY,
    KEY_BINDINGS_KEY,
    LANGUAGE_KEY,
    MOBILE_WIDTH,
    MY_SANDBOXES,
    OPENED_DRAWER_KEY,
    SANDBOX_NAMES_KEY,
    URI_BASE,
    SANDBOX_TEMP,
    DEFAULT_FONT_SIZE,
    SOURCE_REGEX,
    SNIPPET_REGEX,
    SHOW_TERMINAL_KEY,
    DEFAULT_SHOW_TERMINAL,
    GO_VERSION_KEY,
} from "./constants.ts";
import {AppContextI, KeyBindingsType, languages, mySandboxes, selectableDrawers} from "./types";
import {EditorView, ViewUpdate} from "@codemirror/view";
import {createContext} from "react";
import {SessionI} from "./modules/Sessions.tsx";

export function getShowTerminal(): boolean {
    return JSON.parse(localStorage.getItem(SHOW_TERMINAL_KEY) || DEFAULT_SHOW_TERMINAL)
}

export function getFontSize(): number {
    return Math.floor(Number(localStorage.getItem(FONT_SIZE_KEY))) || DEFAULT_FONT_SIZE
}

export function getSandboxId(): mySandboxes {
    const path = window.location.pathname

    // when viewing source or snippet, using the temp sandbox
    if (path.match(SOURCE_REGEX) || path.match(SNIPPET_REGEX)) {
        return SANDBOX_TEMP
    }

    return localStorage.getItem(SANDBOX_ID_KEY) as mySandboxes || DEFAULT_SANDBOX_ID
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

export function getDrawerSize(): number {
    return Number(localStorage.getItem(DRAWER_SIZE_KEY)) || DEFAULT_DRAWER_SIZE
}

export function getOpenedDrawer(): selectableDrawers {
    if (isMobileDevice()) {
        return NO_OPENED_DRAWER
    }
    return localStorage.getItem(OPENED_DRAWER_KEY) as selectableDrawers || NO_OPENED_DRAWER
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
        if (key === SANDBOX_TEMP) return // do not display temp sandbox
        if (localStorage.getItem(key) !== null) {
            sandboxes.push(key as mySandboxes)
        }
    })

    // if no sandboxes are found, create a default one
    if (sandboxes.length === 0) {
        const i = DEFAULT_SANDBOX_ID
        sandboxes.push(i)
        localStorage.setItem(SANDBOX_ID_KEY, i)
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
    return `${URI_BASE}/go${DEFAULT_MAIN_FILE_PATH}`
}

export function getDefaultFileUri(): string {
    const path = window.location.pathname
    const matches = path.match(SOURCE_REGEX);
    // return the source file path when viewing external source code
    if (matches) {
        const file = path.split("/").pop() || "";
        return decodeURIComponent(file)

    }
    return getFileUri(getGoVersion())
}

export function displayFileUri(file: string): string {
    return file.includes(DEFAULT_MAIN_FILE_PATH) ? file.substring(24) : file.substring(14)
}

export function getCursorPos(v: ViewUpdate | EditorView) {
    // return 1-based index
    const pos = v.state.selection.main.head;
    const line = v.state.doc.lineAt(pos);
    return {row: line.number, col: pos - line.from + 1}
}

export function viewUpdate(view: EditorView, data: string, cursor?: number) {
    view.dispatch({
        changes: {
            from: 0,
            to: view.state.doc.length,
            insert: data,
        },
    })
    view.dispatch({
        selection: {
            anchor: cursor || 0,
        },
        effects: EditorView.scrollIntoView(cursor || 0, {
            y: "center",
        })
    })
    view.focus()
}

export function posToHead(v: ViewUpdate | EditorView, row: number, col: number) {
    const line = v.state.doc.line(row);
    return line.from + col - 1;
}

export function getSourceId(): string {
    const path = window.location.pathname;
    const matches = path.match(SOURCE_REGEX);
    if (matches) {
        const file = path.split("/").pop();
        return decodeURIComponent(file || "");
    }
    return "";
}

export function getSnippetId(): string {
    let path = window.location.pathname;
    // trim the tailing slash if exists, this happens on production, weird
    path = path.endsWith("/") ? path.slice(0, -1) : path;
    const matches = path.match(SNIPPET_REGEX);
    if (matches) {
        const id = path.split("/").pop();
        return decodeURIComponent(id || "");
    }
    return "";
}

// default empty context value
export const AppCtx = createContext<AppContextI>({
    isMobile: false,
    sourceId: "",
    snippetId: "",
    // settable states
    showTerminal: false,
    updateShowTerminal: () => {
    },
    openedDrawer: NO_OPENED_DRAWER,
    updateOpenedDrawer: () => {
    },
    fontSize: DEFAULT_FONT_SIZE,
    updateFontSize: () => {
    },
    isRunning: false,
    setIsRunning: () => {
    },
    lan: DEFAULT_LANGUAGE,
    updateLan: () => {
    },
    file: "",
    setFile: () => {
    },
    value: "",
    updateValue: () => {
    },
    goVersion: "",
    updateGoVersion: () => {
    },
    sandboxId: DEFAULT_SANDBOX_ID,
    updateSandboxId: () => {
    },
    toastError: null,
    setToastError: () => {
    },
    toastInfo: null,
    setToastInfo: () => {
    },
});

export const removeSession = (sessions: SessionI[], index: number) => {
    if (index !== -1) {
        sessions.splice(index, 1)
    }
}

export const pushSession = (sessions: SessionI[], session: SessionI) => {
    const index = sessions.findIndex((s) => s.id === session.id)
    if (index !== -1) {
        sessions[index] = session
    } else {
        sessions.push(session)
    }
}

// sleep for a given number of milliseconds, a helper function
export const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms))
}
