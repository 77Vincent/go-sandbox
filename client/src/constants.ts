import {KeyBindings, languages} from "./types";

export const EVENT_STDOUT = "stdout";
export const EVENT_STDERR = "stderr";
export const EVENT_ERROR = "error";
export const EVENT_CLEAR = "clear";
export const EVENT_DONE = "done";

export const KEY_BINDINGS_KEY = "keyBindings";
export const LANGUAGE_KEY = "languageKey";
export const AUTO_RUN_KEY = "isAutoRum";
export const LINT_ON_KEY = "isLintOn";
export const SHOW_INVISIBLE_KEY = "isShowInvisible";
export const EDITOR_SIZE_KEY = "editorSize";
export const FONT_SIZE_KEY = "fontSize";
export const CODE_CONTENT_KEY = "codeContent";
export const CURSOR_ROW_KEY = "cursorPositionRow";
export const CURSOR_COLUMN_KEY = "cursorPositionColumn";

export const DEFAULT_KEY_BINDINGS: KeyBindings = "";
export const DEFAULT_AUTO_RUN = "true";
export const DEFAULT_LINT_ON = "false";
export const DEFAULT_SHOW_INVISIBLE = "false";
export const DEFAULT_EDITOR_SIZE = 60;
export const DEFAULT_LANGUAGE = "en";
export const FONT_SIZE_L = 16;
export const FONT_SIZE_M = 14;
export const FONT_SIZE_S = 12;

export const DEFAULT_CURSOR_POSITION = 0;

export const CURSOR_UPDATE_DEBOUNCE_TIME = 100;
export const RUN_DEBOUNCE_TIME = 100;
export const AUTO_RUN_DEBOUNCE_TIME = 1000;

export const DEFAULT_CODE_CONTENT = `package main

import "fmt"

func main() {
    fmt.Println("Hello, Go Sandbox!")
}`

export const SNIPPET_REGEX = /\/snippet\/([a-zA-Z0-9]+)/g;
export const ERROR_PARSING_REGEX = /tmp\/.*\.go:(\d+)/g;
export const BUILD_ERROR_PARSING_REGEX = /^(\d+):(\d+):/g;
export const STATS_INFO_PREFIX = "STATS_INFO:"

export const HTTP_INTERNAL_ERROR = 500
export const HTTP_NOT_FOUND = 404

export const LANGUAGES: { value: languages, label: string }[] = [
    {value: "en", label: "English"},
    {value: "zh_CN", label: "简体中文"},
    {value: "zh_TW", label: "繁體中文"},
    {value: "ja", label: "日本語"},
]

export const TRANSLATE: Record<string, Record<languages, string>> = {
    run: {
        en: "Run",
        zh_CN: "运行",
        zh_TW: "執行",
        ja: "実行",
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
    about: {
        en: "About",
        zh_CN: "关于",
        zh_TW: "關於",
        ja: "情報",
    },
    hintAuto: {
        en: "Type something to run automatically",
        zh_CN: "输入内容以自动运行",
        zh_TW: "輸入內容以自動運行",
        ja: "自動実行するには何かを入力してください",
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
        zh_CN: "代码提示",
        zh_TW: "代碼提示",
        ja: "リント",
    },
    autoRun: {
        en: "Auto Run",
        zh_CN: "自动运行",
        zh_TW: "自動運行",
        ja: "オートラン",
    },
    showInvisible: {
        en: "Show Invisible Characters",
        zh_CN: "显示不可见字符",
        zh_TW: "顯示不可見字符",
        ja: "不可視文字を表示",
    },
    buyMeACoffee: {
        en: "Buy me a coffee",
        zh_CN: "请我喝杯咖啡吧",
        zh_TW: "請我喝杯咖啡吧",
        ja: "コーヒーをおごって",
    },
    aboutInfo: {
        en: "This is an online Go playground. It is a web-based tool to write, compile, and run Go code. It is powered by the Go playground and the Monaco editor.",
        zh_CN: "这是一个在线 Go playground。这是一个用于编写、编译和运行 Go 代码的基于 Web 的工具。它由 Go playground 和 Monaco 编辑器驱动。",
        zh_TW: "這是一個在線 Go playground。這是一個用於編寫、編譯和運行 Go 代碼的基於 Web 的工具。它由 Go playground 和 Monaco 編輯器驅動。",
        ja: "これはオンライン Go playground です。これは Go コードを書いて、コンパイルして、実行するための Web ベースのツールです。Go playground と Monaco エディターで動作します。",
    }
}
