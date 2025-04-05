import {
    AUTO_RUN_KEY,
    BUILD_ERROR_PARSING_REGEX,
    DEFAULT_AUTO_RUN,
    DEFAULT_EDITOR_SIZE,
    DEFAULT_KEY_BINDINGS,
    DEFAULT_LANGUAGE,
    DEFAULT_LINT_ON,
    DEFAULT_SHOW_INVISIBLE,
    EDITOR_SIZE_KEY,
    ERROR_PARSING_REGEX,
    FONT_SIZE_KEY,
    FONT_SIZE_M,
    KEY_BINDINGS_KEY,
    LANGUAGE_KEY,
    LINT_ON_KEY,
    SANDBOX_VERSION_KEY,
    SHOW_INVISIBLE_KEY,
    DEFAULT_SANDBOX_VERSION,
    IS_VERTICAL_LAYOUT_KEY,
    DEFAULT_IS_VERTICAL_LAYOUT,
    MOBILE_WIDTH,
    HELLO_WORLD,
    ACTIVE_SANDBOX_KEY,
    DEFAULT_ACTIVE_SANDBOX,
    MY_SANDBOXES,
    SANDBOX_NAMES_KEY,
    CURSOR_HEAD_KEY,
    DEFAULT_CURSOR_HEAD
} from "./constants.ts";
import {KeyBindingsType, languages, mySandboxes} from "./types";

export function getFontSize(): number {
    return Number(localStorage.getItem(FONT_SIZE_KEY)) || FONT_SIZE_M
}

export function getActiveSandbox(): mySandboxes {
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

export function getSandboxVersion(): string {
    return localStorage.getItem(SANDBOX_VERSION_KEY) || DEFAULT_SANDBOX_VERSION
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

export function getAutoRun(): boolean {
    return JSON.parse(localStorage.getItem(AUTO_RUN_KEY) || DEFAULT_AUTO_RUN)
}

export function getLintOn(): boolean {
    return JSON.parse(localStorage.getItem(LINT_ON_KEY) || DEFAULT_LINT_ON)
}

export function getShowInvisible(): boolean {
    return JSON.parse(localStorage.getItem(SHOW_INVISIBLE_KEY) || DEFAULT_SHOW_INVISIBLE)
}

export function parseExecutionError(error: string): number[] {
    const rows: number[] = []

    let matches = error.match(ERROR_PARSING_REGEX);
    rows.push(...(matches || []).map((match) => {
        const arr = match.split(":");
        return Number(arr[1])
    }))

    matches = error.match(BUILD_ERROR_PARSING_REGEX);
    rows.push(...(matches || []).map((match) => {
        const arr = match.split(":");
        return Number(arr[0])
    }))

    return rows
}

export function mapFontSize(size: number): "xs" | "sm" | "md" {
    if (size < 14) return "xs";
    if (size >= 16) return "md";
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

export function normalizeText(text: string = "") {
    return text
        .split(/\r?\n/)          // split text into lines
        .map(line => line.trim()) // remove leading/trailing whitespace on each line
        .filter(line => line !== '') // discard empty lines
        .join('\n');             // join them together (or you could join with "" if you don't want newlines)
}

export function isMac(): boolean {
    const platform = navigator.userAgentData?.platform;
    return platform?.toLowerCase().includes('mac') || navigator.platform.includes("Mac")
}
