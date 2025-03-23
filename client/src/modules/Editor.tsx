import {useCallback, useRef, useState, ChangeEvent, useEffect, ReactNode} from "react";
import {Button, DarkThemeToggle, Dropdown, Tooltip, useThemeMode} from "flowbite-react";
import AceEditor, {IMarker} from "react-ace";
import {Ace} from "ace-builds";
import {Resizable, ResizeDirection} from "re-resizable";
import {HiOutlineQuestionMarkCircle as AboutIcon} from "react-icons/hi"

import {
    AUTO_RUN_KEY,
    CODE_CONTENT_KEY,
    CURSOR_COLUMN_KEY,
    CURSOR_ROW_KEY,
    CURSOR_UPDATE_DEBOUNCE_TIME,
    EDITOR_SIZE_KEY,
    FONT_SIZE_KEY,
    FONT_SIZE_L,
    FONT_SIZE_S,
    LINT_ON_KEY,
    RUN_DEBOUNCE_TIME,
    KEY_BINDINGS_KEY,
    FONT_SIZE_M,
    AUTO_RUN_DEBOUNCE_TIME,
    TRANSLATE,
    STATS_INFO_PREFIX,
    SHOW_INVISIBLE_KEY,
    LANGUAGE_KEY, EVENT_STDOUT, EVENT_ERROR, EVENT_STDERR, EVENT_CLEAR, EVENT_DONE, SNIPPET_REGEX
} from "../constants.ts";
import {ClickBoard, Divider, Wrapper} from "./Common.tsx";
import StatusBar from "./StatusBar.tsx";
import ProgressBar from "./ProgressBar.tsx";
import Terminal from "./Terminal.tsx"
import Templates from "./Templates.tsx";
import {fetchSnippet, formatCode, getTemplate, shareSnippet} from "../api/api.ts";

import "ace-builds/src-noconflict/mode-golang";
import "ace-builds/src-noconflict/theme-dawn";
import "ace-builds/src-noconflict/theme-nord_dark";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/keybinding-vim"
import "ace-builds/src-noconflict/keybinding-emacs"
import "ace-builds/src-noconflict/ext-statusbar";
import "ace-builds/src-noconflict/ext-searchbox";
import {debounce} from "react-ace/lib/editorOptions";
import {
    getAutoRun,
    getCodeContent,
    getCursorColumn,
    getCursorRow,
    getKeyBindings,
    getEditorSize, getFontSize,
    getLintOn, generateMarkers, getShowInvisible, getUrl, getLanguage
} from "../utils.ts";
import Settings from "./Settings.tsx";
import {KeyBindings, languages, resultI} from "../types";
import About from "./About.tsx";
import {SSE} from "sse.js";
import {Link} from "react-router-dom";

function ShareSuccessMessage(props: {
    url: string,
}): ReactNode {
    const {url} = props
    return (
        <div>
            <p>The link has been copied to clipboard, share it with others:</p>
            <Link to={url} className={"text-cyan-500 underline"}>{url}</Link>
        </div>
    )
}

function FetchErrorMessage(props: {
    error: string
}): ReactNode {
    const {error} = props

    return (
        <div>
            <p>{error}</p>
            <p>Loading local cache instead</p>
        </div>
    )
}

export default function Component(props: {
    setToastError: (message: ReactNode) => void
    setToastInfo: (message: ReactNode) => void
}) {
    const {setToastError, setToastInfo} = props
    const {mode, toggleMode} = useThemeMode();
    const statusBarRef = useRef<HTMLDivElement | null>(null);

    const [showAbout, setShowAbout] = useState<boolean>(false);


    // error state
    const [errorRows, setErrorRows] = useState<IMarker[]>([]);

    // settings
    const [fontSize, setFontSize] = useState<number>(getFontSize());
    const [editorSize, setEditorSize] = useState<number>(getEditorSize())
    const [lan, setLan] = useState<languages>(getLanguage())

    // editor status
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [code, setCode] = useState<string>(getCodeContent());

    // result
    const [result, setResult] = useState<resultI[]>([]);
    const [error, setError] = useState<string>("")
    const [info, setInfo] = useState<string>("")

    // reference the latest state
    const latestCodeRef = useRef(code);
    const isRunningRef = useRef(isRunning);

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
    const [isShowInvisible, setIsShowInvisible] = useState<boolean>(getShowInvisible())

    // fetch the snippet if the url contains the snippet id
    useEffect(() => {
        (async () => {
            const matches = location.pathname.match(SNIPPET_REGEX)
            if (matches) {
                const raw = matches[0]
                const id = raw.split("/")[2]
                try {
                    const data = await fetchSnippet(id)
                    if (data) {
                        setCode(data)
                    }
                } catch (e) {
                    setToastError(<FetchErrorMessage error={(e as Error).message}/>)
                }
            }
        })()
    }, [setToastError]);

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
                return
            }
            // shortcut for editor focus
            if (event.key.toLowerCase() === "escape") {
                editor.focus();
                return;
            }
            // shortcut for format
            if (event.key.toLowerCase() === "b" && event.metaKey) {
                event.preventDefault();
                debouncedFormat()
                return;
            }
            // shortcut for share
            if (event.key.toLowerCase() === "e" && event.metaKey) {
                event.preventDefault();
                return;
            }
        }

        window.addEventListener('keydown', handleKeyDown);
    };

    // IMPORTANT: update the ref when the state changes
    useEffect(() => {
        isRunningRef.current = isRunning
    }, [isRunning]);

    function onChange(code: string = "") {
        storeCode(code);

        // only run if auto run is on
        if (isAutoRun) {
            debouncedAutoRun();
        }
    }

    function shouldAbort(): boolean {
        // do not continue if the code is empty or running
        return isRunningRef.current || !latestCodeRef.current
    }

    const shareCallback = useCallback(async () => {
        try {
            const id = await shareSnippet(latestCodeRef.current);
            const url = `${location.origin}/snippet/${id}`
            await navigator.clipboard.writeText(url);
            setToastInfo(<ShareSuccessMessage url={url}/>)
        } catch (e) {
            setToastError((e as Error).message)
        }
    }, [setToastInfo, setToastError]);
    const debouncedShare = useRef(debounce(shareCallback, RUN_DEBOUNCE_TIME)).current;

    // managed debounced format
    const formatCallback = useCallback(async () => {
        if (shouldAbort()) {
            return
        }

        try {
            setIsRunning(true)

            const {stdout, error, message} = await formatCode(latestCodeRef.current);

            if (stdout) {
                storeCode(stdout)
            }
            if (error) {
                setResult([{type: EVENT_STDERR, content: error}])
                setErrorRows(generateMarkers(error))
            }
            if (message) {
                setError(message)
            }

            setIsRunning(false)
        } catch (e) {
            setToastError((e as Error).message)
            setIsRunning(false)
        }
    }, [setToastError]);
    const debouncedFormat = useRef(debounce(formatCallback, RUN_DEBOUNCE_TIME)).current;

    const getTemplateCallback = useCallback(async (id: string) => {
        if (shouldAbort()) {
            return
        }

        try {
            setIsRunning(true)
            const code = await getTemplate(id);
            setCode(code)
            setIsRunning(false)
        } catch (e) {
            setToastError((e as Error).message)
            setIsRunning(false)
        }
    }, [setToastError]);
    const debouncedGetTemplate = useRef(debounce(getTemplateCallback, RUN_DEBOUNCE_TIME)).current;

    // manage debounced run
    const runCallback = useCallback(async () => {
        if (shouldAbort()) {
            return
        }

        try {
            setIsRunning(true)

            const {
                stdout: formatted,
                error: formatError,
                message: formatMessage
            } = await formatCode(latestCodeRef.current);

            setInfo("")
            setResult([])

            // format failed
            if (formatError) {
                setError(formatMessage)
                setResult([{type: EVENT_STDERR, content: formatError}])

                setErrorRows(generateMarkers(formatError))
                setIsRunning(false)
                return
            }

            // clean up
            setError("")
            setResult([])
            setErrorRows([]);
            storeCode(formatted)

            const markers: IMarker[] = []

            const source = new SSE(getUrl("/execute"), {
                headers: {'Content-Type': 'application/json'},
                payload: JSON.stringify({code: latestCodeRef.current})
            });

            source.addEventListener(EVENT_STDOUT, ({data}: MessageEvent) => {
                setResult(prev => prev.concat({type: EVENT_STDOUT, content: data}))
            });

            source.addEventListener(EVENT_ERROR, ({data}: MessageEvent) => {
                setError(data)
                setIsRunning(false)
            });

            source.addEventListener(EVENT_STDERR, ({data}: MessageEvent) => {
                // special case -- stats info wrapped in the stderr
                if (data.startsWith(STATS_INFO_PREFIX)) {
                    const [time, mem] = data.replace(STATS_INFO_PREFIX, "").split(";")
                    setInfo(`Time: ${time} | Memory: ${mem}kb`)
                    return
                }

                markers.push(...generateMarkers(data))
                if (markers.length > 0) {
                    setErrorRows(markers)
                }

                setResult(prev => prev.concat({type: EVENT_STDERR, content: data}))
            });

            // clear the screen
            source.addEventListener(EVENT_CLEAR, () => {
                setResult([])
            });

            source.addEventListener(EVENT_DONE, () => {
                setIsRunning(false)
            });
        } catch (e) {
            const err = e as Error
            setErrorRows(generateMarkers(err.message))
            setResult([{type: EVENT_STDERR, content: err.message}])
            setIsRunning(false)
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

    function onLanguageChange(event: ChangeEvent<HTMLSelectElement>) {
        event.stopPropagation();
        const value = event.target.value as languages
        localStorage.setItem(LANGUAGE_KEY, value);
        setLan(value)
    }

    function onAutoRun() {
        localStorage.setItem(AUTO_RUN_KEY, JSON.stringify(!isAutoRun));
        setIsAutoRun(!isAutoRun);
    }

    function onShowInvisible() {
        localStorage.setItem(SHOW_INVISIBLE_KEY, JSON.stringify(!isShowInvisible));
        setIsShowInvisible(!isShowInvisible);
    }

    function onDarkThemeToggle() {
        toggleMode();
    }

    function onResizeStop(_event: MouseEvent | TouchEvent, _dir: ResizeDirection, refToElement: HTMLElement) {
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
        <div className="relative flex h-screen flex-col dark:bg-neutral-900">
            <About lan={lan} show={showAbout} setShow={setShowAbout}/>

            <div
                className="flex items-center justify-between border-b border-b-gray-300 py-1 pl-2 pr-1 shadow-sm dark:border-b-gray-600  dark:text-white">
                <Link to={""} className={"flex items-center gap-2 transition-opacity duration-300 hover:opacity-70"}>
                    <img src={"/logo.svg"} alt={"logo"} className={"h-5"}/>

                    <div className="text-2xl italic text-gray-700 dark:text-cyan-500">Go Sandbox</div>
                </Link>

                <div className="flex items-center justify-end gap-2">
                    <Tooltip content={"cmd/win + enter"}>
                        <Button onClick={debouncedRun} disabled={isRunning || !latestCodeRef.current}
                                className={"shadow"}
                                size={"xs"}
                                color={mode === "dark" ? "light" : "cyan"}
                        >
                            {TRANSLATE.run[lan]}
                        </Button>
                    </Tooltip>

                    <Tooltip content={"cmd/win + b"}>
                        <Button onClick={debouncedFormat} disabled={isRunning || !latestCodeRef.current}
                                className={"shadow"}
                                size={"xs"}
                                color={mode === "dark" ? "light" : "cyan"}
                        >
                            {TRANSLATE.format[lan]}
                        </Button>
                    </Tooltip>

                    <Tooltip content={"cmd/win + e"}>
                        <Button onClick={debouncedShare} disabled={!latestCodeRef.current}
                                className={"shadow"}
                                size={"xs"}
                                gradientDuoTone={"greenToBlue"}
                        >
                            {TRANSLATE.share[lan]}
                        </Button>
                    </Tooltip>

                    <Divider/>

                    <Templates isRunning={isRunning} onTemplateSelect={debouncedGetTemplate}/>

                    <Dropdown color={"light"} size={"xs"} label={"Go 1.24"}>
                        <Dropdown.Item>
                            Go 1.24
                        </Dropdown.Item>
                        <Dropdown.Item>
                            Go 1.23
                        </Dropdown.Item>
                    </Dropdown>

                    <div className={"flex items-center"}>
                        <Divider/>

                        <Settings
                            disabled={isRunning}
                            lan={lan}
                            fontSize={fontSize}
                            onFontL={onFontL}
                            onFontM={onFontM}
                            onFontS={onFontS}
                            onKeyBindingsChange={onKeyBindingsChange}
                            onLanguageChange={onLanguageChange}
                            keyBindings={keyBindings}
                            isLintOn={isLintOn}
                            onLint={onLint}
                            isAutoRun={isAutoRun}
                            onAutoRun={onAutoRun}
                            isShowInvisible={isShowInvisible}
                            onShowInvisible={onShowInvisible}
                        />

                        <Tooltip content={"About"}>
                            <AboutIcon
                                onClick={() => setShowAbout(true)}
                                className={"mx-1.5 cursor-pointer text-2xl text-gray-600 hover:opacity-50 dark:text-gray-300"}/>
                        </Tooltip>

                        <DarkThemeToggle onClick={onDarkThemeToggle}/>
                    </div>
                </div>
            </div>

            <div className={"flex h-0 flex-1"}>
                <Resizable
                    handleClasses={{
                        right: "hover:bg-cyan-200 transition-colors duration-300",
                    }}
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
                    <Wrapper className={"flex flex-col border-r border-r-gray-400 dark:border-r-gray-600"}>
                        <ClickBoard content={code}/>

                        <AceEditor
                            className={"flex-1"}
                            mode="golang"
                            width={"100%"}
                            theme={mode === "dark" ? "nord_dark" : "dawn"}
                            defaultValue={code}
                            value={code}
                            onCursorChange={debouncedOnCursorChange}
                            fontSize={fontSize}
                            name="UNIQUE_ID_OF_DIV"
                            keyboardHandler={keyBindings}
                            editorProps={{$blockScrolling: true}}
                            setOptions={{
                                printMargin: false,
                                enableBasicAutocompletion: true,
                                enableLiveAutocompletion: isLintOn,
                                showInvisibles: isShowInvisible,
                                enableSnippets: true,
                            }}
                            onChange={onChange}
                            onLoad={onEditorLoad}
                            markers={errorRows}
                        />

                        <StatusBar statusBarRef={statusBarRef}/>
                    </Wrapper>
                </Resizable>

                <Terminal
                    hint={isAutoRun ? TRANSLATE.hintAuto[lan] : TRANSLATE.hintManual[lan]}
                    running={isRunning}
                    fontSize={fontSize}
                    result={result}
                    info={info}
                    error={error}
                />
            </div>

            <ProgressBar show={isRunning} className={"absolute top-11"}/>
        </div>
    );
}
