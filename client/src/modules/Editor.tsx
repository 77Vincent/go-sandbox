import {useCallback, useEffect, useRef, useState} from "react";
import {Button, DarkThemeToggle, Tooltip, useThemeMode} from "flowbite-react";
import AceEditor from "react-ace";
import {Ace} from "ace-builds";
import {Resizable, ResizeDirection, NumberSize} from "re-resizable";
import {VscSettings as SettingsIcon} from "react-icons/vsc";

import {
    AUTO_RUN_KEY, CODE_CONTENT_KEY, CURSOR_COLUMN_KEY, CURSOR_ROW_KEY, CURSOR_UPDATE_DEBOUNCE_TIME,
    DEFAULT_AUTO_RUN,
    DEFAULT_CODE,
    DEFAULT_CURSOR_POSITION, DEFAULT_LINT_ON, DEFAULT_SIZE, DEFAULT_VIM_MODE,
    EDITOR_SIZE_KEY, LINT_ON_KEY, RUN_DEBOUNCE_TIME,
    VIM_MODE_KEY
} from "../constants.ts";
import {Divider, MyToast, Wrapper, ToggleSwitch} from "./Common.tsx";
import {executeCode, formatCode} from "../api/api.ts";
import {FormatButton} from "./Buttons.tsx";

import "ace-builds/src-noconflict/mode-golang";
import "ace-builds/src-noconflict/theme-dawn";
import "ace-builds/src-noconflict/theme-one_dark";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/keybinding-vim"
import "ace-builds/src-noconflict/ext-statusbar";
import {debounce} from "react-ace/lib/editorOptions";


export default function Component() {

    useEffect(() => {

    }, []);

    const {mode, toggleMode} = useThemeMode();
    const statusBarRef = useRef(null);


    // editor status
    const [error, setError] = useState<string>("");
    const [result, setResult] = useState<string>("");
    const [code, setCode] = useState<string>(localStorage.getItem(CODE_CONTENT_KEY) || DEFAULT_CODE);
    const [editorSize, setEditorSize] = useState<number>(Number(localStorage.getItem(EDITOR_SIZE_KEY)) || DEFAULT_SIZE)

    // manage code
    const latestCodeRef = useRef(code);
    function storeCode(code: string) {
        setCode(code);
        localStorage.setItem(CODE_CONTENT_KEY, code);
        latestCodeRef.current = code;
    }

    // cursor status
    const [row, setRow] = useState<number>(Number(localStorage.getItem(CURSOR_ROW_KEY)) || DEFAULT_CURSOR_POSITION);
    const [column, setColumn] = useState<number>(Number(localStorage.getItem(CURSOR_COLUMN_KEY)) || DEFAULT_CURSOR_POSITION);

    // mode status
    const [isVimMode, setIsVimMode] = useState<boolean>(JSON.parse(localStorage.getItem(VIM_MODE_KEY) || DEFAULT_VIM_MODE))
    const [isAutoRun, setIsAutoRun] = useState<boolean>(JSON.parse(localStorage.getItem(AUTO_RUN_KEY) || DEFAULT_AUTO_RUN))
    const [isLintOn, setIsLintOn] = useState<boolean>(JSON.parse(localStorage.getItem(LINT_ON_KEY) || DEFAULT_LINT_ON))

    const onEditorLoad = (editor: Ace.Editor) => {
        if (statusBarRef.current) {
            const StatusBar = window.ace.require("ace/ext/statusbar").StatusBar;
            new StatusBar(editor, statusBarRef.current);
        }
        editor.focus();
        editor.moveCursorTo(row, column);
    };

    async function format() {
        try {
            const {output} = await formatCode(code)
            storeCode(output)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    function onChange(code: string = "") {
        storeCode(code);

        if (isAutoRun) {
            debouncedRun();
        }
    }

    // manage debounced run
    const runCallback = useCallback(async () => {
        try {
            // try format code as a validation
            const {output: formatted} = await formatCode(latestCodeRef.current);
            storeCode(formatted)

            // actual run
            const { output } = await executeCode(latestCodeRef.current);
            setResult(output);
        } catch (e) {
            setResult((e as Error).message)
        }
    }, []);
    const debouncedRun = useRef(debounce(runCallback, RUN_DEBOUNCE_TIME)).current;

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

    return (
        <div className="relative h-screen flex flex-col dark:bg-gray-800 bg-stone-100">
            <MyToast>{error}</MyToast>

            <div className="flex justify-between items-center py-2 px-3  dark:text-white">
                <h1 className="text-2xl font-bold">Golang Sandbox</h1>

                <div className="flex gap-2 justify-end items-center">
                    <Button onClick={debouncedRun} disabled={isAutoRun} className={"shadow"} size={"xs"} gradientDuoTone={"purpleToBlue"}>
                        Run
                    </Button>

                    <FormatButton disabled={isAutoRun} format={format}/>

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

                    <Tooltip content={"Settings"}>
                        <SettingsIcon className={"text-lg cursor-pointer hover:opacity-50"}/>
                    </Tooltip>

                    <Tooltip content={"Dark mode"}>
                        <DarkThemeToggle className={"hover:opacity-50"} onClick={onDarkThemeToggle}/>
                    </Tooltip>
                </div>
            </div>

            <div className={"px-3 pb-3 py-1 gap-2 flex flex-1"}>
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
                            onChange={onChange}
                            onCursorChange={debouncedOnCursorChange}
                            fontSize={14}
                            name="UNIQUE_ID_OF_DIV"
                            keyboardHandler={isVimMode ? "vim" : ""}
                            editorProps={{$blockScrolling: true}}
                            setOptions={{
                                enableBasicAutocompletion: true,
                                enableLiveAutocompletion: isLintOn,
                                enableSnippets: true
                            }}
                            onLoad={onEditorLoad}
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
