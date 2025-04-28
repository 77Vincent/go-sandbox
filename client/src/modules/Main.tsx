import {useCallback, useRef, useState, useEffect, ReactNode} from "react";
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
    TRANSLATE,
    STATS_INFO_PREFIX,
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
    EDITOR_SIZE_MAX, TITLE, ACTIVE_SANDBOX_KEY, IS_AUTOCOMPLETION_ON_KEY,
} from "../constants.ts";
import Editor from "./Editor.tsx";
import {Divider, Wrapper} from "./Common.tsx";
import ProgressBar from "./ProgressBar.tsx";
import Terminal from "./Terminal.tsx"
import Actions from "./Actions.tsx";
import SnippetSelector from "./SnippetSelector.tsx";
import VersionSelector from "./VersionSelector.tsx";
import SandboxSelector from "./SandboxSelector.tsx";
import Info from "./Info.tsx";
import {fetchSnippet, formatCode, getSnippet, shareSnippet} from "../api/api.ts";

import {
    getCodeContent,
    getKeyBindings,
    getEditorSize,
    getFontSize,
    getLintOn,
    getUrl,
    getLanguage,
    getSandboxVersion,
    getIsVerticalLayout,
    isMobileDevice, getActiveSandbox, getAutoCompletionOn
} from "../utils.ts";
import Settings from "./Settings.tsx";
import {KeyBindingsType, languages, mySandboxes, patchI, resultI} from "../types";
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
const initialValue = getCodeContent(getActiveSandbox());
const initialIsLintOn = getLintOn()
const initialIsAutoCompletionOn = getAutoCompletionOn()
const initialSandboxVersion = getSandboxVersion()
const initialActiveSandbox = getActiveSandbox();
const initialIsVerticalLayout = getIsVerticalLayout();
const initialLanguage = getLanguage()
const initialFontSize = getFontSize()
const initialEditorSize = getEditorSize()
const initialKeyBindings = getKeyBindings()

export default function Component(props: {
    setToastError: (message: ReactNode) => void
    setToastInfo: (message: ReactNode) => void
}) {
    const {setToastError, setToastInfo} = props

    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [showAbout, setShowAbout] = useState<boolean>(false);
    const [showManual, setShowManual] = useState<boolean>(false);
    const [isMobile] = useState<boolean>(isMobileDevice());
    const [activeSandbox, setActiveSandbox] = useState<mySandboxes>(initialActiveSandbox);
    const [cleanHistoryTrigger, setCleanHistoryTrigger] = useState<boolean>(false);

    // settings
    const [fontSize, setFontSize] = useState<number>(initialFontSize);
    const [editorSize, setEditorSize] = useState<number>(initialEditorSize);
    const [isLayoutVertical, setIsLayoutVertical] = useState<boolean>(initialIsVerticalLayout)
    const [lan, setLan] = useState<languages>(initialLanguage)
    const [sandboxVersion] = useState<string>(initialSandboxVersion)

    // editor status
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [code, setCode] = useState<string>(initialValue);
    const [patch, setPatch] = useState<patchI>({value: "", keepCursor: false});

    // result
    const [result, setResult] = useState<resultI[]>([]);
    const [error, setError] = useState<string>("")
    const [info, setInfo] = useState<string>("")

    // reference the latest state
    const codeRef = useRef(code);
    const isRunningRef = useRef(isRunning);

    // mode status
    const [keyBindings, setKeyBindings] = useState<KeyBindingsType>(initialKeyBindings);
    const [isLintOn, setIsLintOn] = useState<boolean>(initialIsLintOn)
    const [isAutoCompletionOn, setIsAutoCompletionOn] = useState<boolean>(initialIsAutoCompletionOn)

    // IMPORTANT: update the ref when the state changes
    useEffect(() => {
        codeRef.current = code
        isRunningRef.current = isRunning
    }, [code, isRunning]);

    function onChange(newCode: string = "") {
        setCode(newCode);
    }

    function shouldAbort(): boolean {
        // do not continue if the code is empty or running
        return isRunningRef.current || !codeRef.current
    }

    const debouncedShare = debounce(useCallback(async () => {
        try {
            const id = await shareSnippet(codeRef.current);
            const url = `${location.origin}/snippets/${id}`
            await navigator.clipboard.writeText(url);
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

            const {stdout, error, message} = await formatCode(codeRef.current);

            if (stdout) {
                // must call together
                setCode(stdout)
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
            } = await formatCode(codeRef.current);

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
            setCode(formatted)
            setPatch({value: formatted, keepCursor: true})
            codeRef.current = formatted // important: update immediately

            const source = new SSE(getUrl("/execute"), {
                headers: {'Content-Type': 'application/json'},
                payload: JSON.stringify({code: codeRef.current, version: sandboxVersion})
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
    }, [sandboxVersion]), DEBOUNCE_TIME);

    const debouncedGetSnippet = debounce(useCallback(async (id: string) => {
        try {
            const data = await getSnippet(id);
            setCode(data);
            setPatch({value: data});
            setCleanHistoryTrigger(!cleanHistoryTrigger)
            debouncedRun()
        } catch (e) {
            setToastError((e as Error).message)
            setIsRunning(false)
        }
    }, [cleanHistoryTrigger, debouncedRun, setToastError]), DEBOUNCE_TIME);

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
                        // must call together
                        setCode(data)
                        setPatch({value: data})
                        setActiveSandbox(id as mySandboxes) // force assertion
                        debouncedRun() // run immediately after fetching
                    }
                } catch (e) {
                    setToastError(<FetchErrorMessage error={(e as Error).message}/>)
                }
            }
        })()
    }, [debouncedRun, setToastError]);

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

    function onSandboxVersionChange(version: string) {
        localStorage.setItem(SANDBOX_VERSION_KEY, version);
        location.reload()
    }

    function onIsVerticalLayoutChange() {
        const value = !isLayoutVertical
        localStorage.setItem(IS_VERTICAL_LAYOUT_KEY, JSON.stringify(value));
        setIsLayoutVertical(value)
    }

    function onActiveSandboxChange(id: mySandboxes) {
        localStorage.setItem(ACTIVE_SANDBOX_KEY, id);
        setActiveSandbox(id)
        const data = getCodeContent(id)
        setCode(data)
        setPatch({value: data})
        setCleanHistoryTrigger(!cleanHistoryTrigger)
        debouncedRun()
    }

    function onLanguageChange(value: languages) {
        localStorage.setItem(LANGUAGE_KEY, value);
        setLan(value)
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
            <Manual lan={lan} show={showManual} setShow={setShowManual}/>

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
                isAutoCompletionOn={isAutoCompletionOn}
                onAutoCompletion={onAutoCompletion}
            />

            <div
                className="flex items-center justify-between border-b border-b-gray-300 px-2 py-1.5 shadow-sm dark:border-b-gray-600 dark:text-white max-md:py-0.5">
                <Link to={""} className={"flex items-center gap-2 transition-opacity duration-300 hover:opacity-70"}>
                    <img src={"/favicon.png"} alt={"logo"} className={"mr-1 h-5 max-md:hidden"}/>

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
                              setShowSettings={setShowSettings} setShowManual={setShowManual}/>
                    </div>
                </div>
            </div>

            <div className={`flex h-0 flex-1 ${isLayoutVertical ? "flex-col" : "flex-row"}`}>
                <Resizable
                    handleStyles={{
                        right: {
                            width: "5px",
                        },
                        bottom: {
                            height: "5px",
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
                            lan={lan}
                            cleanHistoryTrigger={cleanHistoryTrigger}
                            sandboxId={activeSandbox}
                            goVersion={sandboxVersion}
                            setToastError={setToastError}
                            isLintOn={isLintOn}
                            isAutoCompletionOn={isAutoCompletionOn}
                            value={code}
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
                    lan={lan}
                    hint={TRANSLATE.hintManual[lan]}
                    running={isRunning}
                    fontSize={fontSize}
                    result={result}
                    info={info}
                    error={error}
                />
            </div>

            <ProgressBar show={isRunning} className={"absolute top-10 z-10 max-md:top-6"}/>
        </div>);
}
