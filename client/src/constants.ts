export const VIM_MODE_KEY = "isVimMode";
export const AUTO_RUN_KEY = "isAutoRum";
export const LINT_ON_KEY = "isLintOn";
export const EDITOR_SIZE_KEY = "editorSize";
export const CODE_CONTENT_KEY = "codeContent";
export const CURSOR_ROW_KEY = "cursorPositionRow";
export const CURSOR_COLUMN_KEY = "cursorPositionColumn";

export const DEFAULT_VIM_MODE = "false";
export const DEFAULT_AUTO_RUN = "true";
export const DEFAULT_LINT_ON = "false";
export const DEFAULT_SIZE = 60;
export const DEFAULT_CURSOR_POSITION = 0;

export const CURSOR_UPDATE_DEBOUNCE_TIME = 200;
export const RUN_DEBOUNCE_TIME = 750;

export const DEFAULT_CODE_CONTENT = `package main
import "fmt"

func main() {
    fmt.Println("Hello, playground")
}`
