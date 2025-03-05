import {
    AUTO_RUN_KEY,
    CODE_CONTENT_KEY,
    CURSOR_COLUMN_KEY,
    CURSOR_ROW_KEY, DEFAULT_AUTO_RUN,
    DEFAULT_CODE_CONTENT,
    DEFAULT_CURSOR_POSITION, DEFAULT_LINT_ON, DEFAULT_SIZE, DEFAULT_VIM_MODE, EDITOR_SIZE_KEY, LINT_ON_KEY, VIM_MODE_KEY
} from "./constants.ts";

export function getCursorRow(): number {
    return Number(localStorage.getItem(CURSOR_ROW_KEY)) || DEFAULT_CURSOR_POSITION
}

export function getCursorColumn(): number {
    return Number(localStorage.getItem(CURSOR_COLUMN_KEY)) || DEFAULT_CURSOR_POSITION
}

export function getCodeContent(): string {
    return localStorage.getItem(CODE_CONTENT_KEY) || DEFAULT_CODE_CONTENT
}

export function getEditorMode(): boolean {
    return JSON.parse(localStorage.getItem(VIM_MODE_KEY) || DEFAULT_VIM_MODE)
}

export function getEditorSize(): number {
    return Number(localStorage.getItem(EDITOR_SIZE_KEY)) || DEFAULT_SIZE
}

export function getAutoRun(): boolean {
    return JSON.parse(localStorage.getItem(AUTO_RUN_KEY) || DEFAULT_AUTO_RUN)
}

export function getLintOn(): boolean {
    return JSON.parse(localStorage.getItem(LINT_ON_KEY) || DEFAULT_LINT_ON)
}
