import {KeyBindings} from "./types";

export const KEY_BINDINGS_KEY = "keyBindings";
export const AUTO_RUN_KEY = "isAutoRum";
export const LINT_ON_KEY = "isLintOn";
export const EDITOR_SIZE_KEY = "editorSize";
export const FONT_SIZE_KEY = "fontSize";
export const CODE_CONTENT_KEY = "codeContent";
export const CURSOR_ROW_KEY = "cursorPositionRow";
export const CURSOR_COLUMN_KEY = "cursorPositionColumn";

export const DEFAULT_KEY_BINDINGS: KeyBindings = "";
export const DEFAULT_AUTO_RUN = "true";
export const DEFAULT_LINT_ON = "false";
export const DEFAULT_EDITOR_SIZE = 60;
export const FONT_SIZE_L = 16;
export const FONT_SIZE_M = 14;
export const FONT_SIZE_S = 12;

export const DEFAULT_CURSOR_POSITION = 0;

export const CURSOR_UPDATE_DEBOUNCE_TIME = 100;
export const RUN_DEBOUNCE_TIME = 100;
export const AUTO_RUN_DEBOUNCE_TIME = 1000;

export const ACTIVE_COLOR_LIGHT = "purple";
export const ACTIVE_COLOR_DARK = "lime";

export const DEFAULT_CODE_CONTENT = `package main
import "fmt"

func main() {
    fmt.Println("Hello, playground")
}`


export const ERROR_PARSING_REGEX = /tmp\.go:(\d+)/g;
export const BUILD_ERROR_PARSING_REGEX = /^(\d+):(\d+):/g;

export const HTTP_INTERNAL_ERROR = 500
