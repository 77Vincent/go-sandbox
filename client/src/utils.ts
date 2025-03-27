import {
    AUTO_RUN_KEY,
    BUILD_ERROR_PARSING_REGEX,
    CODE_CONTENT_KEY,
    CURSOR_COLUMN_KEY,
    CURSOR_ROW_KEY,
    DEFAULT_AUTO_RUN,
    DEFAULT_CURSOR_POSITION,
    DEFAULT_EDITOR_SIZE,
    DEFAULT_KEY_BINDINGS, DEFAULT_LANGUAGE,
    DEFAULT_LINT_ON,
    DEFAULT_SHOW_INVISIBLE,
    EDITOR_SIZE_KEY,
    ERROR_PARSING_REGEX,
    FONT_SIZE_KEY,
    FONT_SIZE_M,
    KEY_BINDINGS_KEY, LANGUAGE_KEY,
    LINT_ON_KEY, SANDBOX_VERSION_KEY,
    SHOW_INVISIBLE_KEY, DEFAULT_SANDBOX_VERSION, IS_VERTICAL_LAYOUT_KEY, DEFAULT_IS_VERTICAL_LAYOUT, MOBILE_WIDTH
} from "./constants.ts";
import {KeyBindings, languages} from "./types";
import {IMarker} from "react-ace";

export function getFontSize(): number {
    return Number(localStorage.getItem(FONT_SIZE_KEY)) || FONT_SIZE_M
}

export function getLanguage(): languages {
    return localStorage.getItem(LANGUAGE_KEY) as languages || DEFAULT_LANGUAGE
}

export function getCursorRow(): number {
    return Number(localStorage.getItem(CURSOR_ROW_KEY)) || DEFAULT_CURSOR_POSITION
}

export function getCursorColumn(): number {
    return Number(localStorage.getItem(CURSOR_COLUMN_KEY)) || DEFAULT_CURSOR_POSITION
}

export function getCodeContent(): string {
    return localStorage.getItem(CODE_CONTENT_KEY) || ""
}

export function getKeyBindings(): KeyBindings {
    return localStorage.getItem(KEY_BINDINGS_KEY) as KeyBindings || DEFAULT_KEY_BINDINGS
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

export function generateMarkers(error: string): IMarker[] {
    const errs = parseExecutionError(error)
    const markers: IMarker[] = []
    for (const row of errs) {
        markers.push({
            startRow: row - 1,
            endRow: row - 1,
            startCol: 0,
            endCol: 1,
            className: "error-marker",
            type: "fullLine"
        })
    }
    return markers
}

const apiUrl = import.meta.env.VITE_API_URL || "";
const isDev = import.meta.env.MODE === "development";

export function getUrl(path: string): string {
    if (isDev) {
        return `/api${path}`;
    }
    return `${apiUrl}${path}`;
}
