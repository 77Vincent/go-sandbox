import {KeyBindingsType, languages, mySandboxes, SeeingType} from "./types";

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

export const LANGUAGES: { value: languages, label: string }[] = [
    {value: "en", label: "English"},
    {value: "zh_CN", label: "简体中文"},
    {value: "zh_TW", label: "繁體中文"},
    {value: "ja", label: "日本語"},
]
export const HELLO_WORLD = `package main

import "fmt"

func main() {
	fmt.Println("Hello, Go Sandbox!")
}`

export const TRANSLATE: Record<string, Record<languages, string>> = {
    nextPlace: {
        en: "Next Place",
        zh_CN: "下一个位置",
        zh_TW: "下一個位置",
        ja: "次の場所",
    },
    prevPlace: {
        en: "Previous Place",
        zh_CN: "上一个位置",
        zh_TW: "上一個位置",
        ja: "前の場所",
    },
    seeUsages: {
        en: "See usages",
        zh_CN: "查看引用",
        zh_TW: "查看引用",
        ja: "参照を表示",
    },
    seeDefinition: {
        en: "Goto definition",
        zh_CN: "查看定义",
        zh_TW: "查看定義",
        ja: "定義を表示",
    },
    suggestCompletion: {
        en: "See completions",
        zh_CN: "查看补全",
        zh_TW: "查看補全",
        ja: "補完を表示",
    },
    foldAll: {
        en: "Fold All",
        zh_CN: "折叠全部",
        zh_TW: "折疊全部",
        ja: "すべて折りたたむ",
    },
    foldCode: {
        en: "Fold Code",
        zh_CN: "折叠代码",
        zh_TW: "折疊代碼",
        ja: "コードを折りたたむ",
    },
    unfoldAll: {
        en: "Unfold All",
        zh_CN: "展开全部",
        zh_TW: "展開全部",
        ja: "すべて展開する",
    },
    unfoldCode: {
        en: "Unfold Code",
        zh_CN: "展开代码",
        zh_TW: "展開代碼",
        ja: "コードを展開する",
    },
    nextDiagnostic: {
        en: "Next Diagnostic",
        zh_CN: "下一个提示",
        zh_TW: "下一個提示",
        ja: "次の診断",
    },
    openLintPanel: {
        en: "Open Lint Panel",
        zh_CN: "打开提示面板",
        zh_TW: "打開提示面板",
        ja: "リントパネルを開く",
    },
    search: {
        en: "Search",
        zh_CN: "搜索",
        zh_TW: "搜尋",
        ja: "検索",
    },
    theme: {
        en: "Theme",
        zh_CN: "主题",
        zh_TW: "主題",
        ja: "テーマ",
    },
    layout: {
        en: "Layout",
        zh_CN: "布局",
        zh_TW: "佈局",
        ja: "レイアウト",
    },
    run: {
        en: "Run",
        zh_CN: "运行",
        zh_TW: "執行",
        ja: "実行",
    },
    running: {
        en: "Running...",
        zh_CN: "运行中...",
        zh_TW: "執行中...",
        ja: "実行中...",
    },
    format: {
        en: "Format",
        zh_CN: "格式化",
        zh_TW: "格式化",
        ja: "フォーマット",
    },
    share: {
        en: "Share",
        zh_CN: "分享",
        zh_TW: "分享",
        ja: "共有",
    },
    new: {
        en: "New",
        zh_CN: "新建",
        zh_TW: "新建",
        ja: "新規作成",
    },
    settings: {
        en: "Settings",
        zh_CN: "设置",
        zh_TW: "設置",
        ja: "設定",
    },
    hintManual: {
        en: "Press 'Run' to execute",
        zh_CN: "按运行键以执行",
        zh_TW: "按執行鍵以執行",
        ja: "実行するには実行を押してください",
    },
    language: {
        en: "Language",
        zh_CN: "语言",
        zh_TW: "語言",
        ja: "言語",
    },
    fontSize: {
        en: "Font Size",
        zh_CN: "字体大小",
        zh_TW: "字體大小",
        ja: "フォントサイズ",
    },
    keyBindings: {
        en: "Key Bindings",
        zh_CN: "键位设置",
        zh_TW: "鍵位設置",
        ja: "キーバインディング",
    },
    lint: {
        en: "Lint",
        zh_CN: "提示",
        zh_TW: "提示",
        ja: "リント",
    },
    autoCompletion: {
        en: "Auto Completion",
        zh_CN: "自动补全",
        zh_TW: "自動補全",
        ja: "自動補完",
    },
    bugReport: {
        en: "Bug Report",
        zh_CN: "报告 Bug",
        zh_TW: "報告 Bug",
        ja: "バグ報告",
    },
    rename: {
        en: "Rename",
        zh_CN: "重命名",
        zh_TW: "重命名",
        ja: "名前を変更",
    },
    remove: {
        en: "Remove",
        zh_CN: "删除",
        zh_TW: "刪除",
        ja: "削除",
    },
    reload: {
        en: "Reload",
        zh_CN: "刷新",
        zh_TW: "刷新",
        ja: "リロード",
    },
    manual: {
        en: "Manual",
        zh_CN: "手册",
        zh_TW: "手冊",
        ja: "マニュアル",
    },
}

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
