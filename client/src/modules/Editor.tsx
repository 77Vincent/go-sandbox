import {useCallback, useEffect, useRef, useState} from "react";
import {Button, DarkThemeToggle, Dropdown, Tooltip, useThemeMode} from "flowbite-react";
import AceEditor from "react-ace";
import {Ace} from "ace-builds";
import {Resizable, ResizeDirection, NumberSize} from "re-resizable";
import {VscSettings as SettingsIcon} from "react-icons/vsc";
import {MdTextDecrease as TextDecreaseIcon, MdTextIncrease as TextIncreaseIcon} from "react-icons/md";

import {
    AUTO_RUN_KEY, CODE_CONTENT_KEY, CURSOR_COLUMN_KEY, CURSOR_ROW_KEY, CURSOR_UPDATE_DEBOUNCE_TIME, DEFAULT_FONT_SIZE,
    EDITOR_SIZE_KEY, FONT_SIZE_KEY, FONT_SIZE_L, FONT_SIZE_S, LINT_ON_KEY, RUN_DEBOUNCE_TIME,
    VIM_MODE_KEY
} from "../constants.ts";
import {Divider, MyToast, Wrapper, ToggleSwitch} from "./Common.tsx";
import {executeCode, formatCode} from "../api/api.ts";

import "ace-builds/src-noconflict/mode-golang";
import "ace-builds/src-noconflict/theme-dawn";
import "ace-builds/src-noconflict/theme-one_dark";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/keybinding-vim"
import "ace-builds/src-noconflict/ext-statusbar";
import {debounce} from "react-ace/lib/editorOptions";
import {
    getActiveColor,
    getAutoRun,
    getCodeContent,
    getCursorColumn,
    getCursorRow,
    getEditorMode,
    getEditorSize, getFontSize,
    getLintOn
} from "../utils.ts";


export default function Component() {
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    function handleKeyDown(event: KeyboardEvent) {
        if (event.key.toLowerCase() === "enter" && event.metaKey) {
            event.preventDefault();
            debouncedRun()
        }
    }

    const {mode, toggleMode} = useThemeMode();
    const statusBarRef = useRef(null);

    // error state
    const [error, setError] = useState<string>("");

    // settings
    const [fontSize, setFontSize] = useState<number>(getFontSize());
    const [editorSize, setEditorSize] = useState<number>(getEditorSize())

    // editor status
    const [code, setCode] = useState<string>(getCodeContent());
    const [result, setResult] = useState<string>("");

    // manage code
    const latestCodeRef = useRef(code);

    function storeCode(code: string) {
        setCode(code);
        localStorage.setItem(CODE_CONTENT_KEY, code);
        latestCodeRef.current = code;
    }

    // cursor status
    const [row, setRow] = useState<number>(getCursorRow());
    const [column, setColumn] = useState<number>(getCursorColumn());

    // mode status
    const [isVimMode, setIsVimMode] = useState<boolean>(getEditorMode())
    const [isAutoRun, setIsAutoRun] = useState<boolean>(getAutoRun())
    const [isLintOn, setIsLintOn] = useState<boolean>(getLintOn())

    const onEditorLoad = (editor: Ace.Editor) => {
        if (statusBarRef.current) {
            const StatusBar = window.ace.require("ace/ext/statusbar").StatusBar;
            new StatusBar(editor, statusBarRef.current);
        }
        editor.focus();
        editor.moveCursorTo(row, column);
    };

    function onChange(code: string = "") {
        storeCode(code);

        if (isAutoRun) {
            debouncedRun();
        }
    }

    // managed debounced format
    const formatCallback = useCallback(async () => {
        try {
            const {output} = await formatCode(latestCodeRef.current);
            storeCode(output)
        } catch (e) {
            setError((e as Error).message)
        }
    }, []);
    const debouncedFormat = useRef(debounce(formatCallback, RUN_DEBOUNCE_TIME)).current;

    // manage debounced run
    const runCallback = useCallback(async () => {
        try {
            // try format code as a validation
            const {output: formatted} = await formatCode(latestCodeRef.current);
            storeCode(formatted)

            // actual run
            const {output} = await executeCode(latestCodeRef.current);
            setResult(output);
        } catch (e) {
            setResult((e as Error).message)
        }
    }, []);
    const debouncedRun = useRef(debounce(runCallback, RUN_DEBOUNCE_TIME)).current;

    // manage debounced cursor position update
    const debouncedOnCursorChange = debounce(onCursorChange, CURSOR_UPDATE_DEBOUNCE_TIME);

    function onCursorChange(value: any) {
        const row = value.cursor.row;
        const column = value.cursor.column;

        localStorage.setItem(CURSOR_ROW_KEY, row);
        localStorage.setItem(CURSOR_COLUMN_KEY, column);

        setRow(row);
        setColumn(column);
    }

    function onLint() {
        localStorage.setItem(LINT_ON_KEY, JSON.stringify(!isLintOn));
        setIsLintOn(!isLintOn);
    }

    function onVimMode() {
        localStorage.setItem(VIM_MODE_KEY, JSON.stringify(!isVimMode));
        setIsVimMode(!isVimMode);
    }

    function onAutoRun() {
        localStorage.setItem(AUTO_RUN_KEY, JSON.stringify(!isAutoRun));
        setIsAutoRun(!isAutoRun);
    }

    function onDarkThemeToggle() {
        toggleMode();
    }

    function onResizeStop(_event: MouseEvent | TouchEvent, _dir: ResizeDirection, refToElement: HTMLElement, _deltas: NumberSize) {
        const size = (refToElement.clientWidth / window.innerWidth) * 100
        localStorage.setItem(EDITOR_SIZE_KEY, JSON.stringify(size))
        setEditorSize(size)
    }

    function onFontSizeUp() {
        let size = 0
        if (fontSize === FONT_SIZE_L) {
            size = DEFAULT_FONT_SIZE
        } else {
            size = FONT_SIZE_L
        }
        setFontSize(size)
        localStorage.setItem(FONT_SIZE_KEY, JSON.stringify(size))
    }

    function onFontSizeDown() {
        let size = 0
        if (fontSize === FONT_SIZE_S) {
            size = DEFAULT_FONT_SIZE
        } else {
            size = FONT_SIZE_S
        }
        setFontSize(size)
        localStorage.setItem(FONT_SIZE_KEY, JSON.stringify(size))
    }

    return (
        <div className="relative h-screen flex flex-col dark:bg-gray-800 bg-stone-100">
            <MyToast>{error}</MyToast>

            <div className="flex justify-between items-center py-2 px-3  dark:text-white">
                <h1 className="text-2xl font-bold">Golang Sandbox</h1>

                <div className="flex gap-2 justify-end items-center">
                    <Button onClick={debouncedRun} disabled={isAutoRun} className={"shadow"} size={"xs"}
                            gradientDuoTone={"purpleToBlue"}>
                        Run
                    </Button>

                    <Button onClick={debouncedFormat} disabled={isAutoRun} className={"shadow"} size={"xs"}
                            gradientMonochrome={"info"}>
                        Format
                    </Button>

                    <Button className={"shadow"} size={"xs"} gradientDuoTone={"greenToBlue"}>Export</Button>

                    <Divider/>

                    <Tooltip content={"Turn on/off lint"}>
                        <ToggleSwitch label={"Lint"} checked={isLintOn} onChange={onLint}/>
                    </Tooltip>

                    <Tooltip content={"VIM mode"}>
                        <ToggleSwitch label={"VIM"} checked={isVimMode} onChange={onVimMode}/>
                    </Tooltip>

                    <Tooltip content={"Auto Run & Format"}>
                        <ToggleSwitch label={"Auto"} checked={isAutoRun} onChange={onAutoRun}/>
                    </Tooltip>

                    <Divider/>

                    <Dropdown size={"xs"} dismissOnClick={false} color={"auto"} arrowIcon={false} label={
                        <SettingsIcon color={"gray"} className={"text-base cursor-pointer hover:opacity-50"}/>
                    }>
                        <Dropdown.Header>
                            Settings
                        </Dropdown.Header>
                        <Dropdown.Item className={"flex justify-between items-center gap-2"}>
                            <TextDecreaseIcon color={fontSize === FONT_SIZE_S ? getActiveColor(mode) : ""}
                                              onClick={onFontSizeDown} className={"hover:opacity-50 text-md"}/>
                            <TextIncreaseIcon color={fontSize === FONT_SIZE_L ? getActiveColor(mode) : ""}
                                              onClick={onFontSizeUp} className={"hover:opacity-50 text-lg"}/>
                        </Dropdown.Item>
                    </Dropdown>

                    <Tooltip content={"Dark mode"}>
                        <DarkThemeToggle onClick={onDarkThemeToggle}/>
                    </Tooltip>
                </div>
            </div>

            <div className={"px-3 pb-3 py-1 gap-0.5 flex flex-1"}>
                <Resizable
                    minWidth={"20%"}
                    maxWidth={"80%"}
                    enable={{
                        right: true
                    }}
                    defaultSize={{
                        width: `${editorSize}%`,
                        height: "100%"
                    }}
                    grid={[10, 1]}
                    onResizeStop={onResizeStop}
                >
                    <Wrapper className={"h-full flex flex-col"}>
                        <AceEditor
                            className={"rounded-t-lg flex-1"}
                            mode="golang"
                            width={"100%"}
                            theme={mode === "dark" ? "one_dark" : "dawn"}
                            defaultValue={code}
                            value={code}
                            onCursorChange={debouncedOnCursorChange}
                            fontSize={fontSize}
                            name="UNIQUE_ID_OF_DIV"
                            keyboardHandler={isVimMode ? "vim" : ""}
                            editorProps={{$blockScrolling: true}}
                            setOptions={{
                                enableBasicAutocompletion: true,
                                enableLiveAutocompletion: isLintOn,
                                enableSnippets: true
                            }}
                            onChange={onChange}
                            onLoad={onEditorLoad}
                            markers={[{
                                startRow: 6,
                                startCol: 0,
                                endRow: 6,
                                endCol: 1,
                                className: 'error-marker',
                                type: 'fullLine',
                            },]}
                        />

                        <div ref={statusBarRef}
                             className={"px-3 border-t border-t-stone-400 dark:border-t-stone-500 text-gray-800 bg-stone-200 dark:text-white dark:bg-stone-700"}/>
                    </Wrapper>
                </Resizable>

                <Wrapper className={"py-2 px-2 bg-stone-200"}>
                    <div className={"font-mono"}>
                        {result}
                    </div>
                </Wrapper>
            </div>
        </div>
    );
}
