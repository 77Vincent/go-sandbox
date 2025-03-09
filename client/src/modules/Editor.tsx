import {useCallback, useRef, useState, ChangeEvent} from "react";
import {Button, DarkThemeToggle, Tooltip, useThemeMode} from "flowbite-react";
import AceEditor, {IMarker} from "react-ace";
import {Ace} from "ace-builds";
import {Resizable, ResizeDirection, NumberSize} from "re-resizable";

import {
    AUTO_RUN_KEY, CODE_CONTENT_KEY, CURSOR_COLUMN_KEY, CURSOR_ROW_KEY, CURSOR_UPDATE_DEBOUNCE_TIME,
    EDITOR_SIZE_KEY, FONT_SIZE_KEY, FONT_SIZE_L, FONT_SIZE_S, LINT_ON_KEY, RUN_DEBOUNCE_TIME,
    KEY_BINDINGS_KEY, FONT_SIZE_M, RUNNING_INFO, AUTO_RUN_DEBOUNCE_TIME
} from "../constants.ts";
import {Divider, MyToast, Wrapper} from "./Common.tsx";
import {executeCode, formatCode} from "../api/api.ts";

import "ace-builds/src-noconflict/mode-golang";
import "ace-builds/src-noconflict/theme-dawn";
import "ace-builds/src-noconflict/theme-one_dark";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/keybinding-vim"
import "ace-builds/src-noconflict/keybinding-emacs"
import "ace-builds/src-noconflict/ext-statusbar";
import {debounce} from "react-ace/lib/editorOptions";
import {
    getAutoRun,
    getCodeContent,
    getCursorColumn,
    getCursorRow,
    getKeyBindings,
    getEditorSize, getFontSize,
    getLintOn, mapFontSize, generateMarkers
} from "../utils.ts";
import Settings from "./Settings.tsx";
import {KeyBindings} from "../types";
import {Link} from "react-router";

export default function Component() {
    const {mode, toggleMode} = useThemeMode();
    const statusBarRef = useRef<HTMLDivElement | null>(null);

    const [toastMessage, setToastMessage] = useState<string>("");

    // error state
    const [errorRows, setErrorRows] = useState<IMarker[]>([]);

    // settings
    const [fontSize, setFontSize] = useState<number>(getFontSize());
    const [editorSize, setEditorSize] = useState<number>(getEditorSize())

    // editor status
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [code, setCode] = useState<string>(getCodeContent());
    const [result, setResult] = useState<string>("");
    const [message, setMessage] = useState<string>("")

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
    const [keyBindings, setKeyBindings] = useState<KeyBindings>(getKeyBindings())
    const [isAutoRun, setIsAutoRun] = useState<boolean>(getAutoRun())
    const [isLintOn, setIsLintOn] = useState<boolean>(getLintOn())

    const onEditorLoad = (editor: Ace.Editor) => {
        // not ready to run
        setIsRunning(true);

        if (statusBarRef.current) {
            const StatusBar = window.ace.require("ace/ext/statusbar").StatusBar;
            new StatusBar(editor, statusBarRef.current);
        }
        editor.focus();
        editor.moveCursorTo(row, column);

        // read to run
        setIsRunning(false);

        // register keydown event
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key.toLowerCase() === "enter" && event.metaKey) {
                event.preventDefault();
                debouncedRun()
            }
            if (event.key.toLowerCase() === "escape") {
                editor.focus();
            }
        }

        window.addEventListener('keydown', handleKeyDown);
    };

    function onChange(code: string = "") {
        storeCode(code);

        if (isAutoRun) {
            debouncedAutoRun();
        }
    }

    // managed debounced format
    const formatCallback = useCallback(async () => {
        try {
            setIsRunning(true)
            setResult(RUNNING_INFO)

            const {stdout, error, message} = await formatCode(latestCodeRef.current);

            // always set message
            setMessage(message)

            if (stdout) {
                storeCode(stdout)
            }
            setResult(error) // also clear the running info!
            setErrorRows(generateMarkers(error))

            setIsRunning(false)
        } catch (e) {
            setToastMessage((e as Error).message)
        }
    }, []);
    const debouncedFormat = useRef(debounce(formatCallback, RUN_DEBOUNCE_TIME)).current;

    // manage debounced run
    const runCallback = useCallback(async () => {
        try {
            setIsRunning(true)
            setResult(RUNNING_INFO)

            const {error: formatError, message: formatMessage} = await formatCode(latestCodeRef.current);
            // format failed
            if (formatError) {
                setMessage(formatMessage)
                setResult(formatError)
                setErrorRows(generateMarkers(formatError))
                setIsRunning(false)
                return
            }

            // actual run
            const {stdout, stderr, error, message} = await executeCode(latestCodeRef.current);
            // always set message
            setMessage(message)

            // execute failed
            if (error) {
                setResult(`${error}\n${stderr}`)
                setErrorRows(generateMarkers(stderr))
                setIsRunning(false)
                return
            }

            setResult(stdout);
            setErrorRows([]) // clear error markers
            setIsRunning(false)
        } catch (e) {
            const err = e as Error
            setErrorRows(generateMarkers(err.message))

            // show raw error message
            setResult(err.message)
        }
    }, []);
    const debouncedRun = useRef(debounce(runCallback, RUN_DEBOUNCE_TIME)).current;
    const debouncedAutoRun = useRef(debounce(runCallback, AUTO_RUN_DEBOUNCE_TIME)).current;

    // manage debounced cursor position update
    const debouncedOnCursorChange = debounce(onCursorChange, CURSOR_UPDATE_DEBOUNCE_TIME);

    function onCursorChange(value: any) {
        const row = value.cursor.row;
        const col = value.cursor.column;

        if (statusBarRef.current) {
            statusBarRef.current.textContent = `${row + 1}:${col + 1}`;
        }

        localStorage.setItem(CURSOR_ROW_KEY, row);
        localStorage.setItem(CURSOR_COLUMN_KEY, col);

        setRow(row);
        setColumn(col);
    }

    function onLint() {
        localStorage.setItem(LINT_ON_KEY, JSON.stringify(!isLintOn));
        setIsLintOn(!isLintOn);
    }

    function onKeyBindingsChange(event: ChangeEvent<HTMLSelectElement>) {
        event.stopPropagation();
        const value = event.target.value as KeyBindings
        localStorage.setItem(KEY_BINDINGS_KEY, value);
        setKeyBindings(value)
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

    function onFontL() {
        if (fontSize !== FONT_SIZE_L) {
            setFontSize(FONT_SIZE_L)
            localStorage.setItem(FONT_SIZE_KEY, JSON.stringify(FONT_SIZE_L))
        }
    }

    function onFontM() {
        if (fontSize !== FONT_SIZE_M) {
            setFontSize(FONT_SIZE_M)
            localStorage.setItem(FONT_SIZE_KEY, JSON.stringify(FONT_SIZE_M))
        }
    }

    function onFontS() {
        if (fontSize !== FONT_SIZE_S) {
            setFontSize(FONT_SIZE_S)
            localStorage.setItem(FONT_SIZE_KEY, JSON.stringify(FONT_SIZE_S))
        }
    }

    return (
        <div className="relative h-screen flex flex-col dark:bg-gray-800 bg-stone-100">
            <MyToast show={!!toastMessage} setShowToast={setToastMessage}>{toastMessage}</MyToast>

            <div className="flex justify-between items-center py-2 px-3  dark:text-white">
                <Link to={"/"}>
                    <h1 className="text-2xl font-bold">
                        Golang Sandbox
                    </h1>
                </Link>

                <div className="flex gap-2 justify-end items-center">
                    <Tooltip content={"cmd/win + enter"}>
                        <Button onClick={debouncedRun} disabled={isAutoRun || isRunning} className={"shadow"}
                                size={"xs"}
                                gradientDuoTone={"purpleToBlue"}>
                            Run
                        </Button>
                    </Tooltip>

                    <Button onClick={debouncedFormat} disabled={isRunning} className={"shadow"} size={"xs"}
                            gradientMonochrome={"info"}>
                        Format
                    </Button>

                    <Button className={"shadow"} size={"xs"} gradientDuoTone={"greenToBlue"}>Export</Button>

                    <Divider/>

                    <Settings
                        fontSize={fontSize}
                        onFontL={onFontL}
                        onFontM={onFontM}
                        onFontS={onFontS}
                        themeMode={mode}
                        onKeyBindingsChange={onKeyBindingsChange}
                        keyBindings={keyBindings}
                        isLintOn={isLintOn}
                        onLint={onLint}
                        isAutoRun={isAutoRun}
                        onAutoRun={onAutoRun}
                    />

                    <Tooltip content={"Dark mode"}>
                        <DarkThemeToggle onClick={onDarkThemeToggle}/>
                    </Tooltip>
                </div>
            </div>

            <div className={"px-3 pb-3 gap-0.5 flex flex-1"}>
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
                            keyboardHandler={keyBindings}
                            editorProps={{$blockScrolling: true}}
                            setOptions={{
                                enableBasicAutocompletion: true,
                                enableLiveAutocompletion: isLintOn,
                                enableSnippets: true,
                            }}
                            onChange={onChange}
                            onLoad={onEditorLoad}
                            markers={errorRows}
                        />

                        <div ref={statusBarRef}
                             className={"px-3 border-t border-t-stone-400 dark:border-t-stone-500 text-gray-800 bg-stone-200 dark:text-white dark:bg-stone-700"}/>
                    </Wrapper>
                </Resizable>

                <Wrapper className={`py-2 px-2 bg-stone-200 text-${mapFontSize(fontSize)}`}>
                    {
                        message &&
                        <div className={"text-orange-600 border-b border-neutral-300 pb-1 mb-1"}> {message} </div>
                    }
                    <pre>
                        {result}
                    </pre>
                </Wrapper>
            </div>
        </div>
    );
}
