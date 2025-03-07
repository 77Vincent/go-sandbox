import {
    AUTO_RUN_KEY,
    CODE_CONTENT_KEY,
    CURSOR_COLUMN_KEY,
    CURSOR_ROW_KEY,
    DEFAULT_AUTO_RUN,
    DEFAULT_CODE_CONTENT,
    DEFAULT_CURSOR_POSITION,
    DEFAULT_LINT_ON,
    DEFAULT_EDITOR_SIZE,
    DEFAULT_KEY_BINDINGS,
    EDITOR_SIZE_KEY,
    LINT_ON_KEY,
    KEY_BINDINGS_KEY,
    DEFAULT_FONT_SIZE,
    FONT_SIZE_KEY,
    ACTIVE_COLOR_DARK,
    ACTIVE_COLOR_LIGHT,
    ERROR_PARSING_REGEX,
    BUILD_ERROR_PARSING_REGEX
} from "./constants.ts";
import {ThemeMode} from "flowbite-react";
import {KeyBindings} from "./types";

export function getActiveColor(mode: ThemeMode = "light"): string {
    return mode === "dark" ? ACTIVE_COLOR_DARK : ACTIVE_COLOR_LIGHT
}

export function getFontSize(): number {
    return Number(localStorage.getItem(FONT_SIZE_KEY)) || DEFAULT_FONT_SIZE
}

export function getCursorRow(): number {
    return Number(localStorage.getItem(CURSOR_ROW_KEY)) || DEFAULT_CURSOR_POSITION
}

export function getCursorColumn(): number {
    return Number(localStorage.getItem(CURSOR_COLUMN_KEY)) || DEFAULT_CURSOR_POSITION
}

export function getCodeContent(): string {
    return localStorage.getItem(CODE_CONTENT_KEY) || DEFAULT_CODE_CONTENT
}

export function getKeyBindings(): KeyBindings {
    return localStorage.getItem(KEY_BINDINGS_KEY) as KeyBindings || DEFAULT_KEY_BINDINGS
}

export function getEditorSize(): number {
    return Number(localStorage.getItem(EDITOR_SIZE_KEY)) || DEFAULT_EDITOR_SIZE
}

export function getAutoRun(): boolean {
    return JSON.parse(localStorage.getItem(AUTO_RUN_KEY) || DEFAULT_AUTO_RUN)
}

export function getLintOn(): boolean {
    return JSON.parse(localStorage.getItem(LINT_ON_KEY) || DEFAULT_LINT_ON)
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

export function mapFontSize(size: number): "sm" | "md" | "lg" {
    if (size < 14) return "sm";
    if (size >= 16) return "lg";
    return "md";
}
