import {useCallback, useRef, useState, useEffect, ReactNode, useContext} from "react";
import {Resizable, ResizeDirection} from "re-resizable";
import debounce from 'debounce';

import {
    EDITOR_SIZE_KEY,
    IS_LINT_ON_KEY,
    DEBOUNCE_TIME,
    KEY_BINDINGS_KEY,
    STATS_INFO_PREFIX,
    EVENT_STDOUT,
    EVENT_ERROR,
    EVENT_STDERR,
    EVENT_CLEAR,
    EVENT_DONE,
    IS_VERTICAL_LAYOUT_KEY,
    EDITOR_SIZE_MIN,
    EDITOR_SIZE_MAX,
    TITLE,
    IS_AUTOCOMPLETION_ON_KEY,
    DRAWER_SIZE_KEY,
    RESIZABLE_HANDLER_WIDTH,
    DRAWER_SIZE_MIN, DRAWER_SIZE_MAX, NO_OPENED_DRAWER,
} from "../constants.ts";
import Editor from "./Editor.tsx";
import {Divider, Wrapper} from "./Common.tsx";
import ProgressBar from "./ProgressBar.tsx";
import Terminal from "./Terminal.tsx"
import Actions from "./Actions.tsx";
import VersionSelector from "./VersionSelector.tsx";
import SandboxSelector from "./SandboxSelector.tsx";
import Features from "./Features.tsx";
import Drawer from "./Drawer.tsx";
import Info from "./Info.tsx";
import {fetchSnippet, fetchSourceCode, formatCode, getSnippet, shareSnippet} from "../api/api.ts";

import {
    getKeyBindings,
    getEditorSize,
    getLintOn,
    getUrl,
    getIsVerticalLayout,
    getAutoCompletionOn, getDrawerSize, AppCtx, isUserCode
} from "../utils.ts";
import Settings from "./Settings.tsx";
import {
    KeyBindingsType,
    LSPDocumentSymbol,
    patchI,
    resultI,
} from "../types";
import About from "./About.tsx";
import Manual from "./Manual.tsx";
import {SSE} from "sse.js";
import {Link} from "react-router-dom";

function ShareSuccessMessage(props: {
    url: string,
}): ReactNode {
    const {url} = props
    return (
        <div>
            <p className={"dark:text-gray-300"}>The link to share:</p>
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

const resizeHandlerHoverClasses = "w-1 z-10 hover:bg-cyan-500 transition-colors";

// default values
const initialIsLintOn = getLintOn()
const initialIsAutoCompletionOn = getAutoCompletionOn()
const initialIsVerticalLayout = getIsVerticalLayout();
const initialEditorSize = getEditorSize()
const initialDrawerSize = getDrawerSize()
const initialKeyBindings = getKeyBindings()

export default function Component() {
    const {
        isMobile, sourceId, snippetId,
        goVersion, sandboxId,
        isRunning, setIsRunning,
        openedDrawer,
        setToastError, setToastInfo,
        value, file,
    } = useContext(AppCtx)

    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [showAbout, setShowAbout] = useState<boolean>(false);
    const [showManual, setShowManual] = useState<boolean>(false);

    // settings
    const [editorSize, setEditorSize] = useState<number>(initialEditorSize);
    const [drawerSize, setDrawerSize] = useState<number>(initialDrawerSize);
    const [isLayoutVertical, setIsLayoutVertical] = useState<boolean>(initialIsVerticalLayout)

    // editor status
    const [patch, setPatch] = useState<patchI>({value: "", keepCursor: false});

    // result
    const [result, setResult] = useState<resultI[]>([]);
    const [error, setError] = useState<string>("")
    const [info, setInfo] = useState<string>("")

    // document symbols
    const [documentSymbols, setDocumentSymbols] = useState<LSPDocumentSymbol[]>([])
    const [selectedSymbol, setSelectedSymbol] = useState<LSPDocumentSymbol | null>(null)

    // reference the latest state
    const valueRef = useRef(value);
    const fileRef = useRef(file);
    const isRunningRef = useRef(isRunning);

    // mode status
    const [keyBindings, setKeyBindings] = useState<KeyBindingsType>(initialKeyBindings);
    const [isLintOn, setIsLintOn] = useState<boolean>(initialIsLintOn)
    const [isAutoCompletionOn, setIsAutoCompletionOn] = useState<boolean>(initialIsAutoCompletionOn)

    // IMPORTANT: update the ref when the state changes
    useEffect(() => {
        isRunningRef.current = isRunning
        valueRef.current = value
        fileRef.current = file
    }, [isRunning, value, file]);

    function onChange(newCode: string = "") {
        valueRef.current = newCode
    }

    function shouldAbort(): boolean {
        // do not continue if the code is empty or running
        return isRunningRef.current || !valueRef.current || !isUserCode(fileRef.current)
    }

    const debouncedShare = debounce(useCallback(async () => {
        let url = ""
        if (isUserCode(fileRef.current)) {
            try {
                const id = await shareSnippet(valueRef.current);
                url = `${location.origin}/snippets/${id}`
            } catch (e) {
                setToastError((e as Error).message)
            }
        } else {
            url = `${location.origin}/sources/${encodeURIComponent(fileRef.current)}`
        }

        // this is a hack for Safari!
        setTimeout(() => {
            navigator.clipboard.writeText(url);
        }, 0);
        setToastInfo(<ShareSuccessMessage url={url}/>)
    }, [setToastInfo, setToastError]), DEBOUNCE_TIME);

    const debouncedFormat = debounce(useCallback(async () => {
        if (shouldAbort()) {
            return
        }

        try {
            setIsRunning(true)

            const {stdout, error, message} = await formatCode(valueRef.current);

            if (stdout) {
                // must call together
                valueRef.current = stdout // important: update immediately
                setPatch({value: stdout, keepCursor: true})
            }
            if (error) {
                setResult([{type: EVENT_STDERR, content: error}])
            }
            if (message) {
                setError(message)
            }

            setIsRunning(false)
        } catch (e) {
            setToastError((e as Error).message)
            setIsRunning(false)
        }
    }, [setIsRunning, setToastError]), DEBOUNCE_TIME);

    const debouncedRun = debounce(useCallback(async () => {
        if (shouldAbort()) {
            return
        }

        try {
            setIsRunning(true)

            const {
                stdout: formatted,
                error: formatError,
                message: formatMessage
            } = await formatCode(valueRef.current);

            setInfo("")
            setResult([])

            // format failed
            if (formatError) {
                setError(formatMessage)
                setResult([{type: EVENT_STDERR, content: formatError}])

                // TODO: annotation or marker
                setIsRunning(false)
                return
            }

            // clean up
            setError("")
            setResult([])
            // TODO: annotation or marker
            // must call together
            setPatch({value: formatted, keepCursor: true})
            valueRef.current = formatted // important: update immediately

            const source = new SSE(getUrl("/execute"), {
                headers: {'Content-Type': 'application/json'},
                payload: JSON.stringify({code: valueRef.current, version: goVersion})
            });

            source.addEventListener(EVENT_STDOUT, ({data}: MessageEvent) => {
                setResult(prev => prev.concat({type: EVENT_STDOUT, content: data}))
            });

            source.addEventListener(EVENT_ERROR, ({data}: MessageEvent) => {
                setError(data)
                setIsRunning(false)
            });

            source.addEventListener(EVENT_STDERR, ({data}: MessageEvent) => {
                // special case -- stat info wrapped in the stderr
                if (data.startsWith(STATS_INFO_PREFIX)) {
                    const [time, mem] = data.replace(STATS_INFO_PREFIX, "").split(";")
                    setInfo(`Time: ${time} | Memory: ${mem}kb`)
                    return
                }

                // TODO: generate annotation or marker
                // TODO: annotation or marker

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
            // TODO: annotation or marker
            setResult([{type: EVENT_STDERR, content: err.message}])
            setIsRunning(false)
        }
    }, []), DEBOUNCE_TIME);

    const debouncedGetSnippet = debounce(useCallback(async (id: string) => {
        try {
            const data = await getSnippet(id);
            valueRef.current = data
            setPatch({value: data});
            debouncedRun()
        } catch (e) {
            setToastError((e as Error).message)
            setIsRunning(false)
        }
    }, [debouncedRun, setIsRunning, setToastError]), DEBOUNCE_TIME);

    // fetch the snippet if the url contains the snippet id, do only once
    useEffect(() => {
        (async () => {
            if (isRunningRef.current) {
                return
            }

            if (snippetId) {
                try {
                    const data = await fetchSnippet(snippetId)
                    if (data) {
                        setPatch({value: data})
                        debouncedRun() // run immediately after fetching
                    }
                } catch (e) {
                    setToastError(<FetchErrorMessage error={(e as Error).message}/>)
                }
            }

            if (sourceId) {
                try {
                    const data = await fetchSourceCode(decodeURIComponent(sourceId), goVersion)
                    if (data) {
                        setPatch({value: data.content})
                    }
                } catch (e) {
                    setToastError(<FetchErrorMessage error={(e as Error).message}/>)
                }
            }
        })()
    }, []); // should not add any dependencies to avoid infinite loop

    function onLint() {
        localStorage.setItem(IS_LINT_ON_KEY, JSON.stringify(!isLintOn));
        setIsLintOn(!isLintOn);
    }

    function onAutoCompletion() {
        localStorage.setItem(IS_AUTOCOMPLETION_ON_KEY, JSON.stringify(!isAutoCompletionOn));
        setIsAutoCompletionOn(!isAutoCompletionOn);
    }

    function onKeyBindingsChange(value: KeyBindingsType) {
        localStorage.setItem(KEY_BINDINGS_KEY, value);
        setKeyBindings(value)
    }

    function onIsVerticalLayoutChange() {
        const value = !isLayoutVertical
        localStorage.setItem(IS_VERTICAL_LAYOUT_KEY, JSON.stringify(value));
        setIsLayoutVertical(value)
    }

    function onResizeStop(_event: MouseEvent | TouchEvent, _dir: ResizeDirection, refToElement: HTMLElement) {
        // calculate the size
        let size
        if (isLayoutVertical) {
            size = (refToElement.clientHeight / (window.innerHeight - 45)) * 100
        } else {
            size = (refToElement.clientWidth / (window.innerWidth - drawerSize)) * 100
        }

        localStorage.setItem(EDITOR_SIZE_KEY, JSON.stringify(size))
        setEditorSize(size)
    }

    function onDrawerResizeStop(_event: MouseEvent | TouchEvent, _dir: ResizeDirection, refToElement: HTMLElement) {
        // calculate the size
        const size = refToElement.clientWidth
        localStorage.setItem(DRAWER_SIZE_KEY, JSON.stringify(size))
        setDrawerSize(size)
    }

    return (
        <div className="relative flex h-screen flex-col dark:bg-neutral-900">
            <About show={showAbout} setShow={setShowAbout}/>
            <Manual show={showManual} setShow={setShowManual}/>

            <Settings
                show={showSettings}
                setShow={setShowSettings}
                isVerticalLayout={isLayoutVertical}
                setIsVerticalLayout={onIsVerticalLayoutChange}
                onKeyBindingsChange={onKeyBindingsChange}
                keyBindings={keyBindings}
                isLintOn={isLintOn}
                onLint={onLint}
                isAutoCompletionOn={isAutoCompletionOn}
                onAutoCompletion={onAutoCompletion}
            />

            <div
                className="flex items-center justify-between border-b border-b-gray-400 px-4 py-1.5 shadow-sm dark:border-b-gray-600 dark:text-white max-md:px-2 max-md:py-1.5">
                <div className="z-20 flex items-center gap-5 max-lg:gap-3.5 max-md:gap-2.5">
                    <Link to={""}
                          className={"flex items-center gap-4 text-gray-600 transition-colors duration-100 hover:text-cyan-600 dark:text-gray-300 dark:hover:text-cyan-400"}>
                        <img src={"/favicon-512x512.png"} alt={"logo"} className={"h-5 max-md:hidden"}/>

                        <div className="text-xl font-light max-md:text-sm">{TITLE}</div>
                    </Link>
                    {
                        isMobile ? null : <>
                            <Divider/>
                            <Features/>
                        </>
                    }
                </div>

                <div className="flex items-center justify-end gap-5 max-lg:gap-3.5 max-md:gap-2.5">
                    <Actions format={debouncedFormat}
                             run={debouncedRun}
                             share={debouncedShare} hasCode={valueRef.current.length > 0}/>

                    {
                        isMobile ? null : <>
                            <Divider/>
                            <SandboxSelector/>
                            <Divider/>
                            <VersionSelector/>
                        </>
                    }

                    <Info setShowAbout={setShowAbout}
                          setShowSettings={setShowSettings} setShowManual={setShowManual}/>
                </div>
            </div>

            <div className={"flex h-0 flex-1"}>
                <Resizable
                    className={`${openedDrawer === NO_OPENED_DRAWER ? "hidden" : ""}`}
                    handleStyles={{
                        right: {width: `${RESIZABLE_HANDLER_WIDTH}px`},
                    }}
                    handleClasses={{
                        right: resizeHandlerHoverClasses,
                    }}
                    minWidth={`${DRAWER_SIZE_MIN}px`}
                    maxWidth={`${DRAWER_SIZE_MAX}px`}
                    enable={{right: true}}
                    defaultSize={{width: `${drawerSize}px`, height: "100%"}}
                    onResizeStop={onDrawerResizeStop}
                >
                    <Drawer documentSymbols={documentSymbols}
                            setSelectedSymbol={setSelectedSymbol}
                            setSelectedSnippet={debouncedGetSnippet}
                            lines={valueRef.current.split("\n").length}
                    />
                </Resizable>

                <div className={`flex w-full overflow-auto ${isLayoutVertical ? "flex-col" : "flex-row"}`}>
                    <Resizable
                        handleStyles={{
                            right: {
                                width: `${RESIZABLE_HANDLER_WIDTH}px`,
                            },
                            bottom: {
                                height: `${RESIZABLE_HANDLER_WIDTH}px`,
                            },
                        }}
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
                            <Editor
                                setDocumentSymbols={setDocumentSymbols}
                                selectedSymbol={selectedSymbol}
                                sandboxId={sandboxId}
                                isVertical={isLayoutVertical}
                                isLintOn={isLintOn}
                                isAutoCompletionOn={isAutoCompletionOn}
                                patch={patch}
                                keyBindings={keyBindings}
                                onChange={onChange}
                                setShowSettings={setShowSettings}
                                setShowManual={setShowManual}
                                debouncedRun={debouncedRun}
                                debouncedFormat={debouncedFormat}
                                debouncedShare={debouncedShare}
                            />
                        </Wrapper>
                    </Resizable>

                    <Terminal
                        running={isRunning}
                        result={result}
                        info={info}
                        error={error}
                    />
                </div>
            </div>

            <ProgressBar show={isRunning} className={"absolute top-10 z-10 max-md:top-6"}/>
        </div>);
}
