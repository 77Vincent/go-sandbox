import {KeyBindingsType, languages, mySandboxes, SeeingType, selectableDrawers} from "./types";

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

export const DRAWER_DOCUMENT_SYMBOLS: selectableDrawers = "documentSymbols"
export const DRAWER_STATS: selectableDrawers = "stats"
export const DRAWER_LIBRARY: selectableDrawers = "library"

export const SANDBOX_NAMES_KEY = "sandboxNames";
export const SANDBOX_ID_KEY = "activeSandbox";
export const IS_VERTICAL_LAYOUT_KEY = "isVerticalLayout";
export const GO_VERSION_KEY = "sandboxVersion";
export const KEY_BINDINGS_KEY = "keyBindings";
export const LANGUAGE_KEY = "languageKey";
export const IS_LINT_ON_KEY = "isLintOn";
export const IS_AUTOCOMPLETION_ON_KEY = "isAutoCompletionOn";
export const EDITOR_SIZE_KEY = "editorSize";
export const DRAWER_SIZE_KEY = "drawerSize";
export const OPENED_DRAWER_KEY = "openedDrawer";
export const FONT_SIZE_KEY = "fontSize";
export const CURSOR_HEAD_KEY = "cursorHead";
export const SHOW_TERMINAL_KEY = "showTerminal";

export const NO_OPENED_DRAWER: selectableDrawers = ""; // no drawer opened
export const DEFAULT_MAIN_FILE_PATH = "/main.go"
export const DEFAULT_INDENTATION_SIZE = 4;
export const DEFAULT_CURSOR_HEAD = 0;
export const DEFAULT_IS_VERTICAL_LAYOUT = "false";
export const DEFAULT_GO_VERSION = "1";
export const DEFAULT_KEY_BINDINGS: KeyBindingsType = "";
export const DEFAULT_LINT_ON = "true";
export const DEFAULT_AUTOCOMPLETION_ON = "true";
export const DEFAULT_SHOW_TERMINAL = "true";

export const RESIZABLE_HANDLER_WIDTH = 5;

export const DEFAULT_EDITOR_SIZE = 50;
export const EDITOR_SIZE_MAX = 90
export const EDITOR_SIZE_MIN = 10

export const DEFAULT_DRAWER_SIZE = 300;
export const DRAWER_SIZE_MAX = 360
export const DRAWER_SIZE_MIN = 240

export const AVAILABLE_FONT_SIZES = [10, 11, 12, 13, 14, 15, 16]

export const DEFAULT_LANGUAGE: languages = "en";
export const DEFAULT_FONT_SIZE = 12;
export const DEFAULT_SANDBOX_ID = "my-sandbox-1";
export const SANDBOX_TEMP: mySandboxes = "my-sandbox-temp";

export const MOBILE_WIDTH = 768;

export const KEEP_ALIVE_INTERVAL = 30000;
export const DEBOUNCE_TIME_SHORT = 25;
export const DEBOUNCE_TIME = 75;
export const DEBOUNCE_TIME_LONG = 150;

// styles
export const SELECTED_COLOR_CLASS = "font-semibold bg-gray-100 dark:bg-gray-600"
export const INACTIVE_TEXT_CLASS = "text-gray-400 dark:text-gray-600"

export const SNIPPET_REGEX = /\/snippets\/([a-zA-Z0-9-_]+)/g; // url base64 encoded
export const SOURCE_REGEX = /\/sources\/([a-zA-Z0-9-_]+)/g; // url base64 encoded
export const STATS_INFO_PREFIX = "STATS_INFO:"

export const HTTP_INTERNAL_ERROR = 500
export const HTTP_NOT_FOUND = 404

export const GO_VERSION_MAP: Record<string, string> = {
    "1": "Go 1.24",
    "2": "Go 1.23",
    "4": "Dev branch",
}

export const keyDownEvent = "keydown"
export const keyUpEvent = "keyup"
export const blurEvent = "blur"
export const focusEvent = "focus"

export const arrowUpEvent = "ArrowUp"
export const arrowDownEvent = "ArrowDown"
export const enterEvent = "Enter"

export const HELLO_WORLD = `package main

import "fmt"

func main() {
	fmt.Println("Hello, Go Sandbox!")
}`

export const SNIPPETS: Record<string, Record<string, {
    title: string,
    description?: string,
}>> = {
    Basic: {
        helloWorld: {
            title: "Hello World",
            description: "The default hello world program",
        },
        sleep: {
            title: "Sleep",
            description: "Demonstrate the synchronous nature of Go with sleep",
        },
        defer: {
            title: "Defer",
            description: "How defer works in Go",
        },
        switchCase: {
            title: "Switch case",
            description: "A simple switch case program",
        },
        goroutine: {
            title: "Goroutine",
            description: "Concurrent programming with goroutines and wait groups",
        },
        channel: {
            title: "Channel",
            description: "Concurrent programming with channels and select",
        },
        assertion: {
            title: "Assertion",
            description: "Type assertion in Go",
        },
        fileIO: {
            title: "File IO",
            description: "Open, read and write files",
        },
        contextCancel: {
            title: "Context cancel",
            description: "Context timeout and cancel",
        },
        json: {
            title: "JSON",
            description: "JSON marshalling and unmarshalling in Go",
        },
        mutex: {
            title: "Mutex",
            description: "Mutex concurrent programming",
        },
        ticker: {
            title: "Ticker",
            description: "Ticker for periodic tasks",
        },
    },
    Advanced: {
        spinner: {
            title: "Spinner",
            description: "A spinner in Terminal",
        },
        progressBar: {
            title: "Progress bar",
            description: "A progress bar in Terminal",
        },
        httpServer: {
            title: "HTTP server",
            description: "A simple HTTP server",
        },
        gameOfLife: {
            title: "Game of life",
            description: "Konway's game of life",
        },
        concurrentPrime: {
            title: "Concurrent prime",
            description: "Find prime numbers concurrently",
        },
        diningPhilosophers: {
            title: "Dining philosophers",
            description: "The dining philosophers problem simulation",
        },
        fibonacci: {
            title: "Fibonacci",
            description: "Fibonacci sequence with goroutines",
        },
        quickSort: {
            title: "Quick sort",
            description: "Quick sort algorithm",
        },
        mergeSort: {
            title: "Merge sort",
            description: "Merge sort algorithm",
        },
        binarySearch: {
            title: "Binary search",
            description: "Binary search algorithm",
        },
        sudoku: {
            title: "Sudoku",
            description: "Sudoku generator and solver",
        },
        maze: {
            title: "Maze",
            description: "Maze generator and solver",
        },
        bfs: {
            title: "BFS",
            description: "Breadth-first search algorithm",
        },
        dfs: {
            title: "DFS",
            description: "Depth-first search algorithm",
        },
        lru: {
            title: "LRU",
            description: "Least recently used cache implementation",
        },
        lcs: {
            title: "LCS",
            description: "Longest common subsequence algorithm",
        },
    },
    "Design Patterns": {
        singleton: {
            title: "Singleton",
            description: "Useful for creating a single instance of a class",
        },
        factory: {
            title: "Factory",
            description: "Useful for creating objects without specifying the exact class",
        },
        strategy: {
            title: "Strategy",
            description: "Useful for defining a family of algorithms, encapsulating each one, and making them interchangeable",
        },
        template: {
            title: "Template",
            description: "Useful for defining the skeleton of an algorithm in a method, deferring some steps to subclasses",
        },
        prototype: {
            title: "Prototype",
            description: "Useful for creating new objects by copying an existing object",
        },
        adaptor: {
            title: "Adaptor",
            description: "Useful for converting the interface of a class into another interface that clients expect",
        },
        decorator: {
            title: "Decorator",
            description: "Useful for adding new functionality to an object without altering its structure",
        },
        facade: {
            title: "Facade",
            description: "Useful for providing a simplified interface to a complex subsystem",
        },
        observer: {
            title: "Observer",
            description: "Useful for defining a one-to-many dependency between objects so that when one object changes state, all its dependents are notified and updated automatically",
        },
        bridge: {
            title: "Bridge",
            description: "Useful for separating an object’s interface from its implementation so that the two can vary independently",
        },
        composite: {
            title: "Composite",
            description: "Useful for composing objects into tree structures to represent part-whole hierarchies",
        },
        proxy: {
            title: "Proxy",
            description: "Useful for providing a surrogate or placeholder for another object to control access to it",
        },
        command: {
            title: "Command",
            description: "Useful for encapsulating a request as an object, thereby allowing for parameterization of clients with queues, requests, and operations",
        },
        state: {
            title: "State",
            description: "Useful for allowing an object to alter its behavior when its internal state changes",
        },
        iterator: {
            title: "Iterator",
            description: "Useful for providing a way to access the elements of an aggregate object sequentially without exposing its underlying representation",
        },
        visitor: {
            title: "Visitor",
            description: "Useful for representing an operation to be performed on the elements of an object structure, allowing you to define a new operation without changing the classes of the elements on which it operates",
        },
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
    "my-sandbox-temp": "Temporary",
}

export const WORKSPACE = "workspace";
export const URI_BASE = `file:///${WORKSPACE}`

export const SEEING_USAGES: SeeingType = "usages"
export const SEEING_IMPLEMENTATIONS: SeeingType = "implementations"
// map type from LSP to codemirror
export const LSP_TO_CODEMIRROR_TYPE: Record<string, string> = {
    Text: "text",
    Method: "method",
    Function: "function",
    Constructor: "function",
    Field: "property",
    Variable: "variable",
    Class: "class",
    Interface: "interface",
    Module: "namespace",
    Property: "property",
    Unit: "constant",
    Value: "text",
    Enum: "enum",
    Keyword: "keyword",
    Snippet: "function",
    Color: "constant",
    File: "variable",
    Reference: "variable",
    Folder: "namespace",
    EnumMember: "enum",
    Constant: "constant",
    Struct: "class",
    Event: "function",
    Operator: "function",
    TypeParameter: "type",
}

export const EDITOR_MENU_ID = "editor-menu";
