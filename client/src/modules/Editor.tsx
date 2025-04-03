import {useCallback, useRef, useState, useEffect, ReactNode} from "react";
import {useThemeMode} from "flowbite-react";
import AceEditor, {IMarker} from "react-ace";
import {Ace} from "ace-builds";
import {Resizable, ResizeDirection} from "re-resizable";
import Mousetrap from "mousetrap";

import {
    AUTO_RUN_KEY,
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
    LANGUAGE_KEY,
    EVENT_STDOUT,
    EVENT_ERROR,
    EVENT_STDERR,
    EVENT_CLEAR,
    EVENT_DONE,
    SNIPPET_REGEX,
    SANDBOX_VERSION_KEY,
    IS_VERTICAL_LAYOUT_KEY,
    EDITOR_SIZE_MIN,
    EDITOR_SIZE_MAX, TITLE, ACTIVE_SANDBOX_KEY,
} from "../constants.ts";
import {ClickBoard, Divider, Wrapper} from "./Common.tsx";
import StatusBar from "./StatusBar.tsx";
import ProgressBar from "./ProgressBar.tsx";
import Terminal from "./Terminal.tsx"
import Actions from "./Actions.tsx";
import SnippetSelector from "./SnippetSelector.tsx";
import VersionSelector from "./VersionSelector.tsx";
import SandboxSelector from "./SandboxSelector.tsx";
import Info from "./Info.tsx";
import {fetchSnippet, formatCode, getSnippet, shareSnippet} from "../api/api.ts";

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
    getEditorSize,
    getFontSize,
    getLintOn,
    generateMarkers,
    getShowInvisible,
    getUrl,
    getLanguage,
    getSandboxVersion,
    getIsVerticalLayout,
    isMobileDevice, normalizeText, getActiveSandbox, isMac
} from "../utils.ts";
import Settings from "./Settings.tsx";
import {KeyBindings, languages, mySandboxes, onCursorChangeI, resultI} from "../types";
import About from "./About.tsx";
import {SSE} from "sse.js";
import {Link} from "react-router-dom";
import LSP from "../lsp/client.ts";

function ShareSuccessMessage(props: {
    url: string,
}): ReactNode {
    const {url} = props
    return (
        <div>
            <p>The link to share:</p>
            <Link target={"_blank"} to={url} className={"text-cyan-500 underline"}>{url}</Link>
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

const resizeHandlerHoverClasses = "z-10 hover:bg-cyan-500 transition-colors";

export default function Component(props: {
    setToastError: (message: ReactNode) => void
    setToastInfo: (message: ReactNode) => void
}) {
    const {setToastError, setToastInfo} = props
    const {mode} = useThemeMode();

    const [docVersion, setDocVersion] = useState<number>(1);
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [showAbout, setShowAbout] = useState<boolean>(false);
    const [isMobile] = useState<boolean>(isMobileDevice());
    const [activeSandbox, setActiveSandbox] = useState<mySandboxes>(getActiveSandbox());

    // error state
    const [errorRows, setErrorRows] = useState<IMarker[]>([]);

    // settings
    const [fontSize, setFontSize] = useState<number>(getFontSize());
    const [editorSize, setEditorSize] = useState<number>(getEditorSize())
    const [isLayoutVertical, setIsLayoutVertical] = useState<boolean>(getIsVerticalLayout())
    const [lan, setLan] = useState<languages>(getLanguage())
    const [sandboxVersion, setSandboxVersion] = useState<string>(getSandboxVersion())

    // editor status
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [code, setCode] = useState<string>(getCodeContent(activeSandbox));

    // result
    const [result, setResult] = useState<resultI[]>([]);
    const [error, setError] = useState<string>("")
    const [info, setInfo] = useState<string>("")

    // reference the latest state
    const statusBarRef = useRef<HTMLDivElement | null>(null);
    const lspClientRef = useRef<LSP | null>(null);
    const codeRef = useRef(code);
    const sandboxVersionRef = useRef(sandboxVersion);
    const activeSandboxRef = useRef(activeSandbox);
    const isRunningRef = useRef(isRunning);
    const docVersionRef = useRef(docVersion);

    function storeCode(code: string) {
        setCode(code);
        localStorage.setItem(activeSandboxRef.current, code);
        codeRef.current = code;
        docVersionRef.current += 1;
    }

    // cursor status
    const [row, setRow] = useState<number>(getCursorRow());
    const [column, setColumn] = useState<number>(getCursorColumn());

    // mode status
    const [keyBindings, setKeyBindings] = useState<KeyBindings>(getKeyBindings())
    const [isAutoRun, setIsAutoRun] = useState<boolean>(getAutoRun())
    const [isLintOn, setIsLintOn] = useState<boolean>(getLintOn())
    const [isShowInvisible, setIsShowInvisible] = useState<boolean>(getShowInvisible())

    // fetch the snippet if the url contains the snippet id, do only once
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

        const metaKey = isMac() ? "command" : "ctrl";
        // global key bindings
        Mousetrap.bind('esc', function () {
            editor.focus();
            return false
        });

        // for settings
        Mousetrap.bind(`${metaKey}+,`, function () {
            setShowSettings(true);
            return false
        });
        editor.commands.addCommand({
            name: "settingsShortcut",
            bindKey: {win: "Ctrl-,", mac: "Command-,"},
            exec: function () {
                setShowSettings(true);
            }
        })

        // for run
        Mousetrap.bind(`${metaKey}+return`, function () {
            debouncedRun()
        });
        editor.commands.addCommand({
            name: "runShortcut",
            bindKey: {win: "Ctrl-Enter,", mac: "Command-Enter"},
            exec: function () {
                debouncedRun()
            }
        })

        // for format
        Mousetrap.bind(`${metaKey}+option+l`, function () {
            debouncedFormat()
            return false
        });
        editor.commands.addCommand({
            name: "formatShortcut",
            bindKey: {win: "Ctrl-Alt-L,", mac: "Command-Alt-L"},
            exec: function () {
                debouncedFormat()
            }
        })

        // for share
        Mousetrap.bind(`${metaKey}+shift+e`, function () {
            debouncedShare()
            return false
        });
        editor.commands.addCommand({
            name: "shareShortcut",
            bindKey: {win: "Ctrl-Shift-E,", mac: "Command-Shift-E"},
            exec: function () {
                debouncedShare()
            }
        });

        editor.commands.addCommand({
            name: "dotAutocomplete",
            bindKey: { win: ".", mac: "." },
            exec: function(editor) {
                // Insert the dot normally.
                editor.insert(".");
                // Optionally, delay slightly to ensure the dot is inserted.
                setTimeout(() => {
                    // Trigger the autocomplete popup.
                    editor.execCommand("startAutocomplete");
                }, 0);
            }
        });

        (async () => {
            try {
                const client = new LSP("ws://localhost:3000/ws", editor);
                await client.initialize();
                lspClientRef.current = client;

                editor.completers = [{
                    id: "lsp",
                    getCompletions: async (_editor: Ace.Editor, _session: Ace.EditSession, _pos: Ace.Point, _prefix: string, callback) => {
                        const completions = await client.getCompletions();
                        try {
                            callback(null, completions);
                        } catch (error) {
                            console.error("Completion request error:", error);
                            callback(error, []);
                        }
                    },
                }]
            } catch (e) {
                setToastError((e as Error).message)
            }
        })()

        // read to run
        setIsRunning(false);
    };

    // IMPORTANT: update the ref when the state changes
    useEffect(() => {
        docVersionRef.current = docVersion
        codeRef.current = code
        isRunningRef.current = isRunning
        sandboxVersionRef.current = sandboxVersion
        activeSandboxRef.current = activeSandbox
    }, [code, docVersion, isRunning, sandboxVersion, activeSandbox]);

    function onChange(newCode: string = "") {
        const processedPrevCode = normalizeText(codeRef.current);
        const processedNewCode = normalizeText(newCode);

        // update ref immediately
        const newVersion = docVersion + 1

        storeCode(newCode);
        setDocVersion(newVersion);

        // only act if the there is diff
        if (processedPrevCode !== processedNewCode) {
            // only run if auto run is on
            if (isAutoRun) {
                debouncedAutoRun();
            }

            if (isLintOn) {
                lspClientRef?.current?.didChange(newVersion, newCode);
            }
        }
    }

    function shouldAbort(): boolean {
        // do not continue if the code is empty or running
        return isRunningRef.current || !codeRef.current
    }

    const debouncedShare = useRef(debounce(useCallback(async () => {
        try {
            const id = await shareSnippet(codeRef.current);
            const url = `${location.origin}/snippets/${id}`
            await navigator.clipboard.writeText(url);
            setToastInfo(<ShareSuccessMessage url={url}/>)
        } catch (e) {
            setToastError((e as Error).message)
        }
    }, [setToastInfo, setToastError]), RUN_DEBOUNCE_TIME)).current;

    const debouncedFormat = useRef(debounce(useCallback(async () => {
        if (shouldAbort()) {
            return
        }

        try {
            setIsRunning(true)

            const {stdout, error, message} = await formatCode(codeRef.current);

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
    }, [setToastError]), RUN_DEBOUNCE_TIME)).current;

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
            } = await formatCode(codeRef.current);

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
                payload: JSON.stringify({code: codeRef.current, version: sandboxVersionRef.current})
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

    const debouncedGetSnippet = useRef(debounce(useCallback(async (id: string) => {
        try {
            setIsRunning(true)
            const code = await getSnippet(id);
            storeCode(code);
            debouncedRun()
            setIsRunning(false)
        } catch (e) {
            setToastError((e as Error).message)
            setIsRunning(false)
        }
    }, [debouncedRun, setToastError]), RUN_DEBOUNCE_TIME)).current;

    // manage debounced cursor position update
    const debouncedOnCursorChange = debounce(function onCursorChange(value: onCursorChangeI) {
        const {cursor: {row, column}} = value;

        if (statusBarRef.current) {
            statusBarRef.current.textContent = `${row + 1}:${column + 1}`;
        }

        localStorage.setItem(CURSOR_ROW_KEY, String(row));
        localStorage.setItem(CURSOR_COLUMN_KEY, String(column));

        setRow(row);
        setColumn(column);
    }, CURSOR_UPDATE_DEBOUNCE_TIME);


    function onLint() {
        localStorage.setItem(LINT_ON_KEY, JSON.stringify(!isLintOn));
        setIsLintOn(!isLintOn);
    }

    function onKeyBindingsChange(value: KeyBindings) {
        localStorage.setItem(KEY_BINDINGS_KEY, value);
        setKeyBindings(value)
    }

    function onSandboxVersionChange(version: string) {
        localStorage.setItem(SANDBOX_VERSION_KEY, version);
        setSandboxVersion(version)
        debouncedRun()
    }

    function onIsVerticalLayoutChange() {
        const value = !isLayoutVertical
        localStorage.setItem(IS_VERTICAL_LAYOUT_KEY, JSON.stringify(value));
        setIsLayoutVertical(value)
    }

    function onActiveSandboxChange(id: mySandboxes) {
        localStorage.setItem(ACTIVE_SANDBOX_KEY, id);
        setActiveSandbox(id)
        setCode(getCodeContent(id))
        debouncedRun()
    }

    function onLanguageChange(value: languages) {
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

    function onResizeStop(_event: MouseEvent | TouchEvent, _dir: ResizeDirection, refToElement: HTMLElement) {
        // calculate the size
        let size
        if (isLayoutVertical) {
            size = (refToElement.clientHeight / (window.innerHeight - 45)) * 100
        } else {
            size = (refToElement.clientWidth / window.innerWidth) * 100
        }

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
            <Settings
                show={showSettings}
                setShow={setShowSettings}
                lan={lan}
                fontSize={fontSize}
                onFontL={onFontL}
                onFontM={onFontM}
                onFontS={onFontS}
                isVerticalLayout={isLayoutVertical}
                setIsVerticalLayout={onIsVerticalLayoutChange}
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

            <div
                className="flex items-center justify-between border-b border-b-gray-300 px-2 py-1.5 shadow-sm dark:border-b-gray-600 dark:text-white max-md:py-0.5">
                <Link to={""} className={"flex items-center gap-2 transition-opacity duration-300 hover:opacity-70"}>
                    <img src={"/logo.svg"} alt={"logo"} className={"mr-1 h-4 max-md:hidden"}/>

                    <div
                        className="text-xl font-light text-gray-600 dark:text-gray-300 max-md:text-sm">{TITLE}</div>
                </Link>

                <div className="flex items-center justify-end gap-2.5 max-md:gap-1">
                    <Actions isMobile={isMobile} isRunning={isRunning} debouncedFormat={debouncedFormat}
                             debouncedRun={debouncedRun}
                             debouncedShare={debouncedShare} hasCode={codeRef.current.length > 0} lan={lan}/>

                    {
                        isMobile ? null : <>
                            <Divider/>
                            <SandboxSelector lan={lan} onSelect={onActiveSandboxChange} isRunning={isRunning}
                                             active={activeSandbox}/>
                            <SnippetSelector isRunning={isRunning} onSelect={debouncedGetSnippet}/>
                            <VersionSelector version={sandboxVersion} isRunning={isRunning}
                                             onSelect={onSandboxVersionChange}/>
                        </>
                    }

                    <div className={"flex items-center"}>
                        <Info lan={lan} isMobile={isMobile} setShowAbout={setShowAbout}
                              setShowSettings={setShowSettings}/>
                    </div>
                </div>
            </div>

            <div className={`flex h-0 flex-1 ${isLayoutVertical ? "flex-col" : "flex-row"}`}>
                <Resizable
                    handleClasses={{
                        right: !isLayoutVertical ? resizeHandlerHoverClasses : "",
                        bottom: isLayoutVertical ? resizeHandlerHoverClasses : "",
                    }}
                    minWidth={isLayoutVertical ? "100%" : `${EDITOR_SIZE_MIN}%`}
                    maxWidth={isLayoutVertical ? "100%" : `${EDITOR_SIZE_MAX}%`}
                    minHeight={isLayoutVertical ? `${EDITOR_SIZE_MIN}%` : "100%"}
                    maxHeight={isLayoutVertical ? `${EDITOR_SIZE_MAX}%` : "100%"}
                    enable={{
                        right: !isLayoutVertical,
                        bottom: isLayoutVertical,
                    }}
                    defaultSize={{
                        width: isLayoutVertical ? "100%" : `${editorSize}%`,
                        height: isLayoutVertical ? `${editorSize}%` : "100%",
                    }}
                    grid={[10, 1]}
                    onResizeStop={onResizeStop}
                >
                    <Wrapper
                        className={`flex flex-col border-gray-400 dark:border-gray-600 ${isLayoutVertical ? "border-b" : "border-r"}`}>
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
                                mergeUndoDeltas: true,
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

                        <StatusBar statusBarRef={statusBarRef} errors={errorRows.length}/>
                    </Wrapper>
                </Resizable>

                <Terminal
                    lan={lan}
                    hint={isAutoRun ? TRANSLATE.hintAuto[lan] : TRANSLATE.hintManual[lan]}
                    running={isRunning}
                    fontSize={fontSize}
                    result={result}
                    info={info}
                    error={error}
                />
            </div>

            <ProgressBar show={isRunning} className={"absolute top-10 z-10"}/>
        </div>);
}
