import {KeyBindingsType, mySandboxes, SeeingType} from "./types";

export const TITLE = "Go Sandbox";
export const LANGUAGE_GO = "go";

export const EVENT_STDOUT = "stdout";
export const EVENT_STDERR = "stderr";
export const EVENT_ERROR = "error";
export const EVENT_CLEAR = "clear";
export const EVENT_DONE = "done";

export const VIM = "vim"
export const EMACS = "emacs"
export const NONE = ""

export const SANDBOX_NAMES_KEY = "sandboxNames";
export const ACTIVE_SANDBOX_KEY = "activeSandbox";
export const IS_VERTICAL_LAYOUT_KEY = "isVerticalLayout";
export const GO_VERSION_KEY = "sandboxVersion";
export const KEY_BINDINGS_KEY = "keyBindings";
export const LANGUAGE_KEY = "languageKey";
export const IS_LINT_ON_KEY = "isLintOn";
export const IS_AUTOCOMPLETION_ON_KEY = "isAutoCompletionOn";
export const EDITOR_SIZE_KEY = "editorSize";
export const FONT_SIZE_KEY = "fontSize";
export const CURSOR_HEAD_KEY = "cursorHead";

export const DEFAULT_MAIN_FILE_PATH = "/main.go"
export const DEFAULT_INDENTATION_SIZE = 4;
export const DEFAULT_CURSOR_HEAD = 0;
export const DEFAULT_IS_VERTICAL_LAYOUT = "false";
export const DEFAULT_GO_VERSION = "1";
export const DEFAULT_KEY_BINDINGS: KeyBindingsType = "";
export const DEFAULT_LINT_ON = "true";
export const DEFAULT_AUTOCOMPLETION_ON = "true";
export const DEFAULT_EDITOR_SIZE = 50;
export const EDITOR_SIZE_MAX = 90
export const EDITOR_SIZE_MIN = 10
export const DEFAULT_LANGUAGE = "en";
export const FONT_SIZE_L = 15;
export const FONT_SIZE_M = 13;
export const FONT_SIZE_S = 11;
export const DEFAULT_ACTIVE_SANDBOX = "my-sandbox-1";

export const MOBILE_WIDTH = 768;

export const KEEP_ALIVE_INTERVAL = 30000;
export const DEBOUNCE_TIME = 75;
export const ACTIVE_COLOR = "cyan"
export const SELECTED_COLOR_CLASS = "font-semibold bg-gray-100 dark:bg-gray-600"
export const ICON_BUTTON_CLASS = "cursor-pointer hover:text-cyan-500 text-gray-600 dark:hover:text-cyan-400 dark:text-gray-300"
export const INACTIVE_TEXT_CLASS = "text-gray-300 dark:text-gray-600"

export const SNIPPET_REGEX = /\/snippets\/([a-zA-Z0-9-_]+)/g; // url base64 encoded
export const STATS_INFO_PREFIX = "STATS_INFO:"

export const HTTP_INTERNAL_ERROR = 500
export const HTTP_NOT_FOUND = 404

export const GO_VERSION_MAP: Record<string, string> = {
    "1": "Go 1.24",
    "2": "Go 1.23",
    "4": "Go dev branch",
}

export const HELLO_WORLD = `package main

import "fmt"

func main() {
	fmt.Println("Hello, Go Sandbox!")
}`

export const SNIPPETS: Record<string, Record<string, string>> = {
    Basic: {
        helloWorld: "Hello World",
        sleep: "Sleep",
        defer: "Defer",
        switchCase: "Switch-case",
        goroutine: "Goroutine",
        channel: "Channel",
        assertion: "Assertion",
        fileIO: "File I/O",
        contextCancel: "Context",
        json: "JSON",
        mutex: "Mutex",
        ticker: "Ticker",
    },
    Advanced: {
        spinner: "Spinner",
        progressBar: "Progress bar",
        httpServer: "HTTP server",
        gameOfLife: "Game of Life",
        concurrentPrime: "Concurrent prime",
        diningPhilosophers: "Dining philosophers",
        fibonacci: "Fibonacci",
        quickSort: "Quick sort",
        mergeSort: "Merge sort",
        binarySearch: "Binary search",
        sudoku: "Sudoku",
        maze: "Maze",
        bfs: "BFS",
        dfs: "DFS",
        lru: "LRU",
        lcs: "LCS",
    },
    "Design Patterns": {
        singleton: "Singleton",
        factory: "Factory",
        strategy: "Strategy",
        template: "Template",
        prototype: "Prototype",
        adaptor: "Adaptor",
        decorator: "Decorator",
        facade: "Facade",
        observer: "Observer",
        bridge: "Bridge",
        composite: "Composite",
        proxy: "Proxy",
    },
}

export const keyBindingsMap: Record<KeyBindingsType, string> = {
    vim: "Vim",
    emacs: "Emacs",
    "": "None",
}

export const MY_SANDBOXES: Record<mySandboxes, string> = {
    "my-sandbox-1": "Sandbox 1",
    "my-sandbox-2": "Sandbox 2",
    "my-sandbox-3": "Sandbox 3",
    "my-sandbox-4": "Sandbox 4",
    "my-sandbox-5": "Sandbox 5",
    "my-sandbox-6": "Sandbox 6",
    "my-sandbox-7": "Sandbox 7",
    "my-sandbox-8": "Sandbox 8",
    "my-sandbox-9": "Sandbox 9",
    "my-sandbox-10": "Sandbox 10",
}
export const BUTTON_INACTIVE = "cursor-not-allowed text-gray-300 dark:text-gray-700";

export const WORKSPACE = "workspace";
export const URI_BASE = `file:///${WORKSPACE}`

export const SEEING_USAGES: SeeingType = "usages"
export const SEEING_IMPLEMENTATIONS: SeeingType = "implementations"
