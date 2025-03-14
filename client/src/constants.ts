import {KeyBindings, languages} from "./types";

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
}
