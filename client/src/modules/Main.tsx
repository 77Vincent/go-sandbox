import {useCallback, useRef, useState, useEffect, ReactNode, useContext} from "react";
import {Resizable, ResizeDirection} from "re-resizable";
import debounce from 'debounce';

import {
    EDITOR_SIZE_KEY,
    FONT_SIZE_KEY,
    FONT_SIZE_L,
    FONT_SIZE_S,
    IS_LINT_ON_KEY,
    DEBOUNCE_TIME,
    KEY_BINDINGS_KEY,
    FONT_SIZE_M,
    STATS_INFO_PREFIX,
    EVENT_STDOUT,
    EVENT_ERROR,
    EVENT_STDERR,
    EVENT_CLEAR,
    EVENT_DONE,
    SNIPPET_REGEX,
    IS_VERTICAL_LAYOUT_KEY,
    EDITOR_SIZE_MIN,
    EDITOR_SIZE_MAX,
    TITLE,
    ACTIVE_SANDBOX_KEY,
    IS_AUTOCOMPLETION_ON_KEY,
    DRAWER_SIZE_KEY,
    RESIZABLE_HANDLER_WIDTH,
    DRAWER_SIZE_MIN, DRAWER_SIZE_MAX, NO_OPENED_DRAWER, OPENED_DRAWER_KEY,
} from "../constants.ts";
import Editor from "./Editor.tsx";
import {Divider, Wrapper} from "./Common.tsx";
import ProgressBar from "./ProgressBar.tsx";
import Terminal from "./Terminal.tsx"
import Actions from "./Actions.tsx";
import SnippetSelector from "./SnippetSelector.tsx";
import VersionSelector from "./VersionSelector.tsx";
import SandboxSelector from "./SandboxSelector.tsx";
import Features from "./Features.tsx";
import Drawer from "./Drawer.tsx";
import Info from "./Info.tsx";
import {fetchSnippet, formatCode, getSnippet, shareSnippet} from "../api/api.ts";

import {
    getCodeContent,
    getKeyBindings,
    getEditorSize,
    getFontSize,
    getLintOn,
    getUrl,
    getIsVerticalLayout,
    isMobileDevice, getSandboxId, getAutoCompletionOn, getDrawerSize, getOpenedDrawer, AppCtx
} from "../utils.ts";
import Settings from "./Settings.tsx";
import {
    KeyBindingsType,
    LSPDocumentSymbol,
    mySandboxes,
    patchI,
    resultI,
    selectableDrawers
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
const initialValue = getCodeContent(getSandboxId());
const initialIsLintOn = getLintOn()
const initialIsAutoCompletionOn = getAutoCompletionOn()
const initialIsVerticalLayout = getIsVerticalLayout();
const initialFontSize = getFontSize()
const initialEditorSize = getEditorSize()
const initialDrawerSize = getDrawerSize()
const initialOpenedDrawer = getOpenedDrawer();
const initialKeyBindings = getKeyBindings()

export default function Component(props: {
    sandboxId: mySandboxes
}) {
    const {sandboxId} = props
    const {goVersion, setToastError, setToastInfo} = useContext(AppCtx)

    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [showAbout, setShowAbout] = useState<boolean>(false);
    const [showManual, setShowManual] = useState<boolean>(false);
    const [isMobile] = useState<boolean>(isMobileDevice());

    // settings
    const [fontSize, setFontSize] = useState<number>(initialFontSize);
    const [editorSize, setEditorSize] = useState<number>(initialEditorSize);
    const [drawerSize, setDrawerSize] = useState<number>(initialDrawerSize);
    const [isLayoutVertical, setIsLayoutVertical] = useState<boolean>(initialIsVerticalLayout)

    // editor status
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [patch, setPatch] = useState<patchI>({value: "", keepCursor: false});

    // result
    const [result, setResult] = useState<resultI[]>([]);
    const [error, setError] = useState<string>("")
    const [info, setInfo] = useState<string>("")

    // drawer related
    const [openedDrawer, setOpenedDrawer] = useState<selectableDrawers>(initialOpenedDrawer);

    // document symbols
    const [documentSymbols, setDocumentSymbols] = useState<LSPDocumentSymbol[]>([])
    const [selectedSymbol, setSelectedSymbol] = useState<LSPDocumentSymbol | null>(null)

    // reference the latest state
    const value = useRef(initialValue);
    const isRunningRef = useRef(isRunning);

    // mode status
    const [keyBindings, setKeyBindings] = useState<KeyBindingsType>(initialKeyBindings);
    const [isLintOn, setIsLintOn] = useState<boolean>(initialIsLintOn)
    const [isAutoCompletionOn, setIsAutoCompletionOn] = useState<boolean>(initialIsAutoCompletionOn)

    // IMPORTANT: update the ref when the state changes
    useEffect(() => {
        isRunningRef.current = isRunning
    }, [isRunning]);

    function onChange(newCode: string = "") {
        value.current = newCode
    }

    function shouldAbort(): boolean {
        // do not continue if the code is empty or running
        return isRunningRef.current || !value.current
    }

    const debouncedShare = debounce(useCallback(async () => {
        try {
            const id = await shareSnippet(getCodeContent(sandboxId)); // so won't share the non-user code
            const url = `${location.origin}/snippets/${id}`
            // this is a hack for Safari!
            setTimeout(() => {
                navigator.clipboard.writeText(url);
            }, 0);
            setToastInfo(<ShareSuccessMessage url={url}/>)
        } catch (e) {
            setToastError((e as Error).message)
        }
    }, [setToastInfo, setToastError]), DEBOUNCE_TIME);

    const debouncedFormat = debounce(useCallback(async () => {
        if (shouldAbort()) {
            return
        }

        try {
            setIsRunning(true)

            const {stdout, error, message} = await formatCode(value.current);

            if (stdout) {
                // must call together
                value.current = stdout // important: update immediately
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
    }, [setToastError]), DEBOUNCE_TIME);

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
            } = await formatCode(value.current);

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
            value.current = formatted // important: update immediately

            const source = new SSE(getUrl("/execute"), {
                headers: {'Content-Type': 'application/json'},
                payload: JSON.stringify({code: value.current, version: goVersion})
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
            value.current = data
            setPatch({value: data});
            debouncedRun()
        } catch (e) {
            setToastError((e as Error).message)
            setIsRunning(false)
        }
    }, [debouncedRun, setToastError]), DEBOUNCE_TIME);

    // fetch the snippet if the url contains the snippet id, do only once
    useEffect(() => {
        (async () => {
            if (isRunningRef.current) {
                return
            }

            const matches = location.pathname.match(SNIPPET_REGEX)
            if (matches) {
                const raw = matches[0]
                const id = raw.split("/")[2]
                try {
                    const data = await fetchSnippet(id)
                    if (data) {
                        setPatch({value: data})
                        debouncedRun() // run immediately after fetching
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

    function onSandboxIdChange(id: mySandboxes) {
        localStorage.setItem(ACTIVE_SANDBOX_KEY, id);
        window.location.href = window.location.origin // remove all paths and query string
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

    function onOpenedDrawer(id: selectableDrawers) {
        setOpenedDrawer(id)
        localStorage.setItem(OPENED_DRAWER_KEY, id)
    }

    function onDrawerResizeStop(_event: MouseEvent | TouchEvent, _dir: ResizeDirection, refToElement: HTMLElement) {
        // calculate the size
        const size = refToElement.clientWidth
        localStorage.setItem(DRAWER_SIZE_KEY, JSON.stringify(size))
        setDrawerSize(size)
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
            <About show={showAbout} setShow={setShowAbout}/>
            <Manual show={showManual} setShow={setShowManual}/>

            <Settings
                show={showSettings}
                setShow={setShowSettings}
                fontSize={fontSize}
                onFontL={onFontL}
                onFontM={onFontM}
                onFontS={onFontS}
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
                className="flex items-center justify-between border-b border-b-gray-400 px-2 py-1.5 shadow-sm dark:border-b-gray-600 dark:text-white max-md:py-1">
                <div className="flex items-baseline gap-4 max-md:gap-2">
                    <Link to={""}
                          className={"flex items-center gap-2 text-gray-600 transition-colors duration-100 hover:text-cyan-600 dark:text-gray-300 dark:hover:text-cyan-400"}>
                        <img src={"/favicon-512x512.png"} alt={"logo"} className={"mr-1 h-5 max-md:hidden"}/>

                        <div
                            className="text-xl font-light max-md:text-sm">{TITLE}</div>
                    </Link>

                    <Divider/>
                    <Features openedDrawer={openedDrawer} setOpenedDrawer={onOpenedDrawer}/>
                </div>

                <div className="flex items-center justify-end gap-2.5 max-md:gap-1">
                    <Actions isMobile={isMobile} isRunning={isRunning} format={debouncedFormat}
                             run={debouncedRun}
                             share={debouncedShare} hasCode={value.current.length > 0}/>

                    {
                        isMobile ? null : <>
                            <Divider/>
                            <SandboxSelector onSelect={onSandboxIdChange} isRunning={isRunning}
                                             active={sandboxId}/>

                            <Divider/>

                            <SnippetSelector isRunning={isRunning} onSelect={debouncedGetSnippet}/>

                            <Divider/>

                            <VersionSelector/>
                        </>
                    }

                    <div className={"flex items-center"}>
                        <Info isMobile={isMobile} setShowAbout={setShowAbout}
                              setShowSettings={setShowSettings} setShowManual={setShowManual}/>
                    </div>
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
                    <Drawer type={openedDrawer} documentSymbols={documentSymbols}
                            setOpenedDrawer={setOpenedDrawer}
                            setSelectedSymbol={setSelectedSymbol}
                            lines={value.current.split("\n").length}
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
                                openedDrawer={openedDrawer}
                                setDocumentSymbols={setDocumentSymbols}
                                selectedSymbol={selectedSymbol}
                                sandboxId={sandboxId}
                                isVertical={isLayoutVertical}
                                isLintOn={isLintOn}
                                isAutoCompletionOn={isAutoCompletionOn}
                                value={value.current}
                                patch={patch}
                                fontSize={fontSize}
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
                        fontSize={fontSize}
                        result={result}
                        info={info}
                        error={error}
                    />
                </div>
            </div>

            <ProgressBar show={isRunning} className={"absolute top-10 z-10 max-md:top-6"}/>
        </div>);
}
