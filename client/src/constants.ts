import {KeyBindings, languages} from "./types";

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


export const ERROR_PARSING_REGEX = /tmp\/.*\.go:(\d+)/g;
export const BUILD_ERROR_PARSING_REGEX = /^(\d+):(\d+):/g;
export const STATS_INFO_PREFIX = "STATS_INFO:"

export const HTTP_INTERNAL_ERROR = 500

export const LANGUAGES: { value: languages, label: string }[] = [
    {value: "en", label: "English"},
    {value: "zh", label: "中文"},
    {value: "ja", label: "日本語"},
    {value: "ko", label: "한국어"},
]

export const TRANSLATE = {
    run: {
        en: "Run",
        zh: "运行",
        ja: "実行",
        ko: "실행",
    },
    format: {
        en: "Format",
        zh: "格式化",
        ja: "フォーマット",
        ko: "서식",
    },
    share: {
        en: "Share",
        zh: "分享",
        ja: "共有",
        ko: "공유",
    },
    about: {
        en: "About",
        zh: "关于",
        ja: "情報",
        ko: "정보",
    },
    hintAuto: {
        en: "Type something to run automatically",
        zh: "输入内容以自动运行",
        ja: "自動実行するには何かを入力してください",
        ko: "자동으로 실행하려면 무언가를 입력하십시오",
    },
    hintManual: {
        en: "Press 'Run' to execute",
        zh: "按运行键以执行",
        ja: "実行するには実行を押してください",
        ko: "실행하려면 실행을 누르십시오",
    },
    language: {
        en: "Language",
        zh: "语言",
        ja: "言語",
        ko: "언어",
    },
    fontSize: {
        en: "Font Size",
        zh: "字体大小",
        ja: "フォントサイズ",
        ko: "글꼴 크기",
    },
    keyBindings: {
        en: "Key Bindings",
        zh: "键位设置",
        ja: "キーバインディング",
        ko: "키 바인딩",
    },
    lint: {
        en: "Lint",
        zh: "代码检查",
        ja: "リント",
        ko: "린트",
    },
    autoRun: {
        en: "Auto Run",
        zh: "自动运行",
        ja: "オートラン",
        ko: "자동 실행",
    },
    showInvisible: {
        en: "Show Invisible Characters",
        zh: "显示不可见字符",
        ja: "不可視文字を表示",
        ko: "보이지 않는 문자 표시",
    },
    buyMeACoffee: {
        en: "Buy me a coffee",
        zh: "请我喝杯咖啡吧",
        ja: "コーヒーをおごって",
        ko: "커피 사주세요",
    },
    aboutInfo: {
        en: "This is an online Go playground. It is a web-based tool to write, compile, and run Go code. It is powered by the Go playground and the Monaco editor.",
        zh: "这是一个在线 Go playground。这是一个用于编写、编译和运行 Go 代码的基于 Web 的工具。它由 Go playground 和 Monaco 编辑器驱动。",
        ja: "これはオンライン Go playground です。これは Go コードを書いて、コンパイルして、実行するための Web ベースのツールです。Go playground と Monaco エディターで動作します。",
        ko: "이것은 온라인 Go playground입니다. 이것은 Go 코드를 작성, 컴파일 및 실행하는 웹 기반 도구입니다. Go playground 및 Monaco 편집기로 구동됩니다.",
    }
}
