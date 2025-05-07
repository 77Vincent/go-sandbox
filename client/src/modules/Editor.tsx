// react-contexify
import {useContextMenu} from 'react-contexify';
import 'react-contexify/ReactContexify.css';

import "highlight.js/styles/github-dark.css"; // load once
// react
import {MouseEvent, ReactNode, useCallback, useEffect, useRef, useState} from "react";
import {ThemeMode, useThemeMode} from "flowbite-react";

// codemirror imports
import {indentationMarkers} from '@replit/codemirror-indentation-markers';
import {Diagnostic, linter, lintGutter, lintKeymap, openLintPanel} from "@codemirror/lint";
import {
    acceptCompletion,
    autocompletion,
    closeBrackets,
    closeBracketsKeymap,
    Completion,
    CompletionContext,
    completionKeymap,
    CompletionResult,
    completionStatus
} from "@codemirror/autocomplete";
import {ChangeSpec, Compartment, EditorSelection, EditorState, RangeSetBuilder} from "@codemirror/state"
import {
    crosshairCursor,
    Decoration,
    drawSelection,
    dropCursor,
    EditorView,
    highlightActiveLine,
    highlightActiveLineGutter,
    highlightSpecialChars,
    keymap,
    lineNumbers,
    rectangularSelection,
    ViewUpdate
} from "@codemirror/view"
import {
    bracketMatching,
    foldCode,
    foldGutter,
    foldKeymap,
    indentOnInput,
    indentUnit,
    unfoldCode,
} from "@codemirror/language"
import {defaultKeymap, history, historyKeymap, indentLess, indentMore} from "@codemirror/commands"
import {highlightSelectionMatches, searchKeymap} from "@codemirror/search"

// theme import
import {vsCodeDark as themeDark} from '@fsegurai/codemirror-theme-vscode-dark'
import {vsCodeLight as themeLight} from '@fsegurai/codemirror-theme-vscode-light'

import {go} from "@codemirror/lang-go";
import {vim} from "@replit/codemirror-vim";
import {emacs} from "@replit/codemirror-emacs";

// other imports
import Mousetrap from "mousetrap";
import debounce from "debounce";

// local imports
import {
    KeyBindingsType,
    languages,
    LSPCompletionItem,
    LSPDocumentSymbol,
    LSPReferenceResult,
    mySandboxes,
    patchI,
    SeeingType,
    selectableDrawers
} from "../types";
import {
    blurEvent,
    CURSOR_HEAD_KEY,
    DEBOUNCE_TIME_LONG,
    DEBOUNCE_TIME,
    DEFAULT_INDENTATION_SIZE,
    DEFAULT_LANGUAGE,
    DRAWER_DOCUMENT_SYMBOLS,
    EMACS,
    focusEvent,
    KEEP_ALIVE_INTERVAL,
    keyDownEvent,
    keyUpEvent,
    LSP_TO_CODEMIRROR_TYPE,
    NONE,
    SEEING_IMPLEMENTATIONS,
    SEEING_USAGES,
    VIM, DRAWER_STATS, EDITOR_MENU_ID, DEBOUNCE_TIME_SHORT,
} from "../constants.ts";
import {
    getCodeContent,
    getCursorHead,
    getCursorPos,
    getFileUri,
    getWsUrl,
    isUserCode,
    posToHead,
    viewUpdate
} from "../utils.ts";
import {LSP_KIND_LABELS, LSPClient} from "../lib/lsp.ts";
import MyMenu from "./Menu.tsx";
import {ClickBoard, RefreshButton} from "./Common.tsx";
import StatusBar from "./StatusBar.tsx";
import {SessionI, Sessions} from "./Sessions.tsx";
import {createHoverTooltip} from "../lib/hover-ext.ts";
import {createHoverLink} from "../lib/link-ext.ts";
import {setUsageHighlights, usageHighlightField} from "../lib/usageHighlightPlugin.ts";
import {Usages} from "./Usages.tsx";

const usageHighlight = Decoration.mark({class: "cm-usage-highlight"});

// Compartments for dynamic config
const fontSizeCompartment = new Compartment();
const indentCompartment = new Compartment();
const keyBindingsCompartment = new Compartment();
const themeCompartment = new Compartment();
const autoCompletionCompartment = new Compartment();
const lintCompartment = new Compartment();
const readOnlyCompartment = new Compartment()
const hoverCompartment = new Compartment();

// setters of compartments
const setLint = (on: boolean, diagnostics: Diagnostic[]) => {
    // do not display diagnostics for non-user code
    return on ? linter(() => diagnostics) : [];
}
const setAutoCompletion = (completions: LSPCompletionItem[]) => {
    return (context: CompletionContext): CompletionResult | null => {
        const word = context.matchBefore(/\w*/)
        if ((!word || word.from == word.to) && !context.explicit) return null

        const items: Completion[] = completions.map((v) => {
            return {
                label: v.label,
                detail: v.detail,
                boost: parseInt(v.sortText || "0"),
                type: LSP_TO_CODEMIRROR_TYPE[LSP_KIND_LABELS[v.kind || 1]],
                info: v.documentation?.value,
                apply: (view, _completion, from, to) => {
                    let insert = v.insertText ?? v.label;

                    // method or function
                    if (v.kind && v.kind > 1 && v.kind < 5) {
                        insert = `${insert}()`
                    }

                    // Build the base change: replace the selected text with insertText
                    const changes: ChangeSpec[] = [];

                    if (v.additionalTextEdits) {
                        for (const edit of v.additionalTextEdits) {
                            const {range: {start, end}, newText} = edit;
                            const from = view.state.doc.line(start.line + 1).from + start.character;
                            const to = view.state.doc.line(end.line + 1).from + end.character;
                            changes.push({from, to, insert: newText});
                        }
                    }
                    changes.push({from, to, insert})
                    view.dispatch({changes});
                },
            }
        });

        return {
            from: word?.from ?? context.pos,
            options: items,
            validFor: /^\w*$/, // keeps the list open while typing
        }
    }
}
const setTheme = (mode: ThemeMode) => {
    return mode === "dark" ? themeDark : themeLight;
}
const setFontSize = (fontSize: number) => {
    return EditorView.theme({
        "&": {
            fontSize: `${fontSize}px`,
            fontWeight: "100",
        }
    })
}
const setIndent = (indent: number) => {
    return indentUnit.of(" ".repeat(indent));
}
const setKeyBindings = (keyBindings: KeyBindingsType) => {
    switch (keyBindings) {
        case VIM:
            return vim();
        case EMACS:
            return emacs();
        case NONE:
            return []
        default:
            return [];
    }
}

export default function Component(props: {
    // toast
    setToastError: (message: ReactNode) => void

    sandboxId: mySandboxes
    goVersion: string;
    value: string;
    patch: patchI;

    // drawers
    openedDrawer: selectableDrawers;

    // document symbols
    setDocumentSymbols: (v: LSPDocumentSymbol[]) => void;
    selectedSymbol: LSPDocumentSymbol | null;

    // settings
    lan: languages
    keyBindings: KeyBindingsType;
    fontSize: number;
    isLintOn: boolean;
    isAutoCompletionOn: boolean;
    isVertical: boolean;

    // handler
    onChange: (code: string) => void;
    // setters
    setShowSettings: (v: boolean) => void;
    setShowManual: (v: boolean) => void;
    // actions
    debouncedRun: () => void;
    debouncedFormat: () => void;
    debouncedShare: () => void;
}) {
    const {
        sandboxId,
        goVersion,
        setToastError,
        // drawers
        openedDrawer,

        // document symbols
        setDocumentSymbols,
        selectedSymbol,

        // props
        lan = DEFAULT_LANGUAGE,
        value, patch,
        fontSize, keyBindings,
        isLintOn, isAutoCompletionOn, isVertical,
        // handlers
        onChange,
        // setters
        setShowSettings,
        setShowManual,
        // action
        debouncedRun,
        debouncedFormat,
        debouncedShare,
    } = props;
    const {mode} = useThemeMode();

    // local state
    const [row, setRow] = useState(1); // 1-based index
    const [col, setCol] = useState(1); // 1-based index
    const [errorCount, setErrorCount] = useState(0);
    const [warningCount, setWarningCount] = useState(0);
    const [infoCount, setInfoCount] = useState(0);
    const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
    const [completions, setCompletions] = useState<LSPCompletionItem[]>([]);
    const [usages, setUsages] = useState<LSPReferenceResult[]>([]);
    const [seeing, setSeeing] = useState<SeeingType>(SEEING_USAGES);

    // ref
    const editor = useRef<HTMLDivElement>(null);
    const view = useRef<EditorView | null>(null);
    const lsp = useRef<LSPClient | null>(null);
    const version = useRef<number>(1); // initial version
    const file = useRef<string>(getFileUri(goVersion));
    const sessions = useRef<SessionI[]>([]);
    const metaKey = useRef<boolean>(false);
    const ready = useRef<boolean>(false); // initially not ready

    // manage cursor
    const onCursorChange = debounce(useCallback((v: ViewUpdate) => {
        const head = v.state.selection.main.head;
        localStorage.setItem(CURSOR_HEAD_KEY, String(head))
        const {row, col} = getCursorPos(v);
        setRow(row);
        setCol(col);


        // update the main session
        if (isUserCode(file.current)) {
            sessions.current[0].cursor = head
        }
    }, []), DEBOUNCE_TIME)

    const debouncedGetDocumentSymbol = debounce(useCallback(async () => {
        if (!lsp.current) return;
        const res = await lsp.current.getDocumentSymbol();
        if (!res) return;
        setDocumentSymbols(res);
    }, [setDocumentSymbols]), DEBOUNCE_TIME_LONG);

    useEffect(() => {
        if (!lsp.current || !ready.current) return;

        switch (openedDrawer) {
            case "":
                // do nothing
                break
            case DRAWER_STATS:
            case DRAWER_DOCUMENT_SYMBOLS:
                debouncedGetDocumentSymbol();
                break

        }
    }, [ready.current, openedDrawer]); // no more dependencies here!!

    useEffect(() => {
        if (!lsp.current || !view.current || !ready.current) return;

        if (!selectedSymbol) {
            return
        }

        // jump to the symbol
        const {location: {range: {start}}} = selectedSymbol;
        const head = posToHead(view.current, start.line + 1, start.character + 1);

        view.current.dispatch({
            selection: EditorSelection.cursor(head),
            effects: EditorView.scrollIntoView(head, {
                y: "center",
            }),
        })
        view.current.focus();
    }, [selectedSymbol]);

    useEffect(() => {
        // reset error/warning/info count
        setErrorCount(0);
        setWarningCount(0);
        setInfoCount(0);

        diagnostics.forEach((v) => {
            switch (v.severity) {
                case "error":
                    setErrorCount((prev) => prev + 1);
                    break;
                case "warning":
                    setWarningCount((prev) => prev + 1);
                    break;
                case "hint":
                    setInfoCount((prev) => prev + 1);
                    break;
                default:
                    setInfoCount((prev) => prev + 1);
            }
        })
    }, [diagnostics]);

    // manage content
    const debouncedLspUpdate = debounce(useCallback(async (v: ViewUpdate) => {
        try {
            if (!lsp.current || !view.current) return

            // version increment
            version.current += 1;

            // update file view in lsp
            await lsp.current.didChange(version.current, v.state.doc.toString());

            // only get completion for user code
            if (isUserCode(file.current)) {
                const {row, col} = getCursorPos(v);
                const completions = await lsp.current.getCompletions(row - 1, col - 1) // use 0-based index
                setCompletions(completions);
            }
        } catch (e) {
            setToastError((e as Error).message)
        }
    }, [setToastError]), DEBOUNCE_TIME)

    const debouncedStoreCode = debounce(useCallback((data: string) => {
        // only store user code
        if (isUserCode(file.current)) {
            localStorage.setItem(sandboxId, data)
        }
    }, [sandboxId]), DEBOUNCE_TIME);

    const onViewUpdate = useCallback((v: ViewUpdate) => {
        if (v.docChanged) {
            const data = v.state.doc.toString();
            onChange(data);
            debouncedStoreCode(data);
            debouncedLspUpdate(v);
            debouncedGetDocumentSymbol();
        }
    }, [onChange, debouncedLspUpdate, debouncedStoreCode, debouncedGetDocumentSymbol]);

    const clearUsages = useCallback(() => {
        view.current?.dispatch({
            effects: [setUsageHighlights.of(Decoration.none)]
        });
        return false
    }, [])

    const seeImplementations = useCallback((): boolean => {
        (async function () {
            if (!lsp.current || !view.current) return;

            const res = await lsp.current.getImplementations(file.current);
            if (res.length === 0) {
                return
            }
            // for display the implementations popup
            // only display for user code
            if (isUserCode(file.current)) {
                setUsages(res as LSPReferenceResult[]);
                setSeeing(SEEING_IMPLEMENTATIONS)
            }
        })();
        return true;
    }, []);


    const seeUsages = useCallback((): boolean => {
        (async function () {
            if (!lsp.current || !view.current) {
                return
            }

            const res = await lsp.current.getUsages()
            if (res.length === 0) {
                return
            }

            // for highlighting
            const builder = new RangeSetBuilder<Decoration>();
            for (const {uri, range} of res as LSPReferenceResult[]) {
                if (uri !== file.current) continue; // only decorate in the current file

                const {start, end} = range
                const startLine = start.line + 1;
                const startCol = start.character;
                const endCol = end.character;

                const line = view.current.state.doc.line(startLine);
                const from = line.from + startCol;
                const to = line.from + endCol;

                builder.add(from, to, usageHighlight);
            }
            const decorations = builder.finish();
            view.current.dispatch({
                effects: [setUsageHighlights.of(decorations)]
            });

            // for display the usages popup
            // only display for user code
            if (isUserCode(file.current)) {
                setUsages(res as LSPReferenceResult[]);
                setSeeing(SEEING_USAGES)
            }

        }());
        return true
    }, [])

    const seeDefinition = useCallback((): boolean => {
        (async function () {
            if (!lsp.current || !view.current) {
                return
            }

            // update the current session before going to the definition
            const data = {
                id: file.current,
                cursor: view.current.state.selection.main.head,
                data: view.current.state.doc.toString()
            }
            const index = sessions.current.findIndex((s) => s.id === file.current)
            // update the session
            sessions.current[index] = data

            await lsp.current.loadDefinition()
        }());
        return true;
    }, []);

    const [focusedKeymap] = useState(() => [
        {
            key: "Mod--",
            preventDefault: true,
            run: (v: EditorView) => {
                return foldCode(v)
            },
        },
        {
            key: "Mod-=",
            preventDefault: true,
            run: (v: EditorView) => {
                return unfoldCode(v)
            },
        },
        {
            key: `Escape`,
            preventDefault: false,
            run: clearUsages
        },
        {
            key: `Mod-b`,
            preventDefault: true,
            run: seeDefinition,
        },
        {
            key: `Mod-Alt-b`,
            preventDefault: true,
            run: seeImplementations,
        },
        {
            key: `Mod-Alt-F7`,
            preventDefault: true,
            run: seeUsages,
        },
        {
            key: `Shift-F12`,
            preventDefault: true,
            run: seeUsages,
        },
        {
            key: `F12`,
            preventDefault: true,
            run: () => {
                setShowManual(true);
                return true;
            }
        },
        {
            key: `Mod-,`,
            preventDefault: true,
            run: () => {
                setShowSettings(true);
                return true;
            }
        },
        {
            key: `Mod-Enter`,
            preventDefault: true,
            run: () => {
                debouncedRun()
                return true;
            }
        },
        {
            key: `Mod-Alt-[`,
            preventDefault: true,
            run: () => {
                prevSession()
                return true;
            }
        },
        {
            key: `Mod-Alt-]`,
            preventDefault: true,
            run: () => {
                nextSession()
                return true;
            }
        },
        {
            // for intellij
            key: `Mod-Alt-l`,
            preventDefault: true,
            run: () => {
                debouncedFormat()
                return true;
            }
        },
        {
            // for vscode
            key: `Shift-Alt-f`,
            preventDefault: true,
            run: () => {
                debouncedFormat()
                return true;
            }
        },
        {
            key: `Mod-s`,
            preventDefault: true,
            run: () => {
                debouncedShare()
                return true;
            }
        },
        {
            key: "Tab",
            preventDefault: true,
            run: (v: EditorView) => {
                if (!completionStatus(v.state)) {
                    return indentMore(v);
                }
                return acceptCompletion(v);
            },
        },
        {
            key: "Shift-Tab",
            preventDefault: true,
            run: (v: EditorView) => {
                return indentLess(v)
            },
        },
    ]);

    const [extensions] = useState(() => [
        go(),
        indentationMarkers(), // Show indentation markers
        lineNumbers(), // A line number gutter
        lintGutter(), // A gutter with lint icon
        foldGutter(), // A gutter with code folding markers
        highlightSpecialChars(), // Replace non-printable characters with placeholders
        history(), // The undo history
        drawSelection(), // Replace the native cursor /selection with our own
        dropCursor(), // Show a drop cursor when dragging over the editor
        indentOnInput(), // Re-indent lines when typing specific input
        bracketMatching(), // Highlight matching brackets near the cursor
        closeBrackets(), // Automatically close brackets
        rectangularSelection(), // Allow alt-drag to select rectangular regions
        crosshairCursor(), // Change the cursor to a crosshair when holding alt
        highlightActiveLine(), // Style the current line specially
        highlightActiveLineGutter(), // Style the gutter for the current line specially
        highlightSelectionMatches(), // Highlight text that matches the selected text
        keymap.of([
            ...focusedKeymap, // Custom key bindings
            ...closeBracketsKeymap, // Closed-bracket-aware backspace
            ...defaultKeymap, // A large set of basic bindings
            ...searchKeymap, // Search-related keys
            ...historyKeymap, // Redo/undo keys
            ...foldKeymap, // Code folding bindings
            ...completionKeymap, // Autocompletion keys
            ...lintKeymap, // Keys related to the linter system
        ]),
        usageHighlightField,
        hoverCompartment.of([]), // empty hover tooltip at first because lsp is not ready
        readOnlyCompartment.of(EditorState.readOnly.of(!isUserCode(file.current))),
        lintCompartment.of(setLint(isLintOn, diagnostics)),
        autoCompletionCompartment.of(autocompletion({override: isAutoCompletionOn ? [setAutoCompletion(completions)] : []})),
        fontSizeCompartment.of(setFontSize(fontSize)),
        indentCompartment.of(setIndent(DEFAULT_INDENTATION_SIZE)),
        keyBindingsCompartment.of(setKeyBindings(keyBindings)),
        themeCompartment.of(setTheme(mode)),
        EditorView.updateListener.of(onCursorChange),
        EditorView.updateListener.of(onViewUpdate),
    ]);

    // update the view when the value changes from outside
    useEffect(() => {
        if (!view.current) return;

        // no dispatch if the value is the same or empty
        switch (patch.value) {
            case view.current.state.doc.toString():
            case "":
                return;
        }

        // reset the file back to the main file
        file.current = getFileUri(goVersion);

        // update the view
        view.current.dispatch({
            changes: {
                from: 0,
                to: view.current.state.doc.length,
                insert: patch.value
            },
            selection: {
                anchor: patch.keepCursor ? Math.min(getCursorHead(), patch.value.length) : 0,
            },
            scrollIntoView: true,
        });
    }, [goVersion, patch]);

    const handleDiagnostics = useCallback((data: Diagnostic[]) => {
        setDiagnostics(data);
    }, []);
    const handleError = useCallback((message: string) => {
        setToastError(message);
    }, [setToastError]);

    // must only run once, so no dependencies
    useEffect(() => {
        if (!editor.current || view.current) return;

        const cursorHead = Math.min(getCursorHead(), value.length)
        view.current = new EditorView({
            doc: value,
            extensions: extensions,
            parent: editor.current,
            selection: EditorSelection.cursor(cursorHead),
        });
        view.current.dispatch({
            effects: EditorView.scrollIntoView(cursorHead, {
                y: "center",
            }),
        })
        view.current.focus();

        // add the default session
        sessions.current = [{id: getFileUri(goVersion), cursor: cursorHead}]

        lsp.current = new LSPClient(
            getWsUrl("/ws"), goVersion, view.current,
            file, sessions,
            handleDiagnostics, handleError, ready,
        );

        // asynchronously add the hover tooltip when the lsp is ready
        view.current.dispatch({
            effects: hoverCompartment.reconfigure([
                createHoverTooltip(lsp.current),
                createHoverLink(lsp.current, metaKey),
            ])
        });

        // key bindings for unfocused editor
        Mousetrap.bind('esc', function () {
            clearUsages()
            view.current?.focus();
            return false
        });
        Mousetrap.bind(`mod+,`, function () {
            setShowSettings(true);
            return false
        });
        Mousetrap.bind(`f12`, function () {
            setShowManual(true);
            return false
        });
        Mousetrap.bind(`mod+enter`, function () {
            debouncedRun()
            return false
        });
        // for intellij
        Mousetrap.bind(`mod+option+l`, function () {
            debouncedFormat()
            return false
        });
        // for vscode
        Mousetrap.bind(`shift+option+f`, function () {
            debouncedFormat()
            return false
        });
        Mousetrap.bind(`mod+s`, function () {
            debouncedShare()
            return false
        });

        // listen to meta-key events
        window.addEventListener(keyDownEvent, e => {
            if (e.metaKey) metaKey.current = true;
        });
        window.addEventListener(keyUpEvent, e => {
            if (!e.metaKey) metaKey.current = false;
        });
        window.addEventListener(blurEvent, () => {
            metaKey.current = false;
        });
        window.addEventListener(focusEvent, () => {
            lsp.current?.reconnect();
        });

        const keepAlive = setInterval(() => {
            lsp.current?.keepAlive()
        }, KEEP_ALIVE_INTERVAL)

        // destroy editor when unmount
        return () => {
            clearInterval(keepAlive);
            view.current?.destroy();
            view.current = null;
        };
    }, []);

    // dynamically update configuration
    useEffect(() => {
        view.current?.dispatch({effects: [themeCompartment.reconfigure(setTheme(mode))]})
    }, [mode]);
    useEffect(() => {
        view.current?.dispatch({effects: [keyBindingsCompartment.reconfigure(setKeyBindings(keyBindings))]})
    }, [keyBindings]);
    useEffect(() => {
        view.current?.dispatch({effects: [fontSizeCompartment.reconfigure(setFontSize(fontSize))]})
    }, [fontSize]);
    useEffect(() => {
        view.current?.dispatch({
            effects: [autoCompletionCompartment.reconfigure(autocompletion({
                override: isAutoCompletionOn ? [setAutoCompletion(completions)] : []
            }))]
        })
    }, [completions, isAutoCompletionOn]);
    useEffect(() => {
        view.current?.dispatch({effects: [lintCompartment.reconfigure(setLint(isLintOn, diagnostics))]})
        view.current?.dispatch({effects: [readOnlyCompartment.reconfigure(EditorState.readOnly.of(!isUserCode(file.current)))]})
    }, [diagnostics, isLintOn]);

    const onLintClick = useCallback(() => {
        if (!view.current) return;
        openLintPanel(view.current);
    }, [view]);

    const onSessionClose = useCallback((index: number, newIndex: number) => {
        if (!view.current) return;

        const {id, data, cursor} = sessions.current[newIndex];

        // update the file
        file.current = id;

        // remove the session from the list
        sessions.current.splice(index, 1);

        // if the new session is user code, use the latest value
        const content = isUserCode(id) ? getCodeContent(sandboxId) : data || "";
        viewUpdate(view.current, content, cursor);
    }, [sandboxId])

    const onSessionClick = useCallback((index: number) => {
        if (!view.current) return;

        const {id, data, cursor} = sessions.current[index];
        if (id === file.current) return; // already selected

        file.current = id;

        // if the new session is user code, use the latest value
        const content = isUserCode(id) ? getCodeContent(sandboxId) : data || "";
        viewUpdate(view.current, content, cursor);
    }, [sandboxId]);

    const backgroundColor = mode === "dark" ? "editor-bg-dark" : "editor-bg-light";

    const prevSession = debounce(useCallback(() => {
        if (sessions.current.length < 2) return;
        const index = sessions.current.findIndex((s) => s.id === file.current)
        if (index === -1) return;

        // go to the previous session
        const i = !index ? 0 : index - 1;
        onSessionClick(i);
    }, [onSessionClick]), DEBOUNCE_TIME_SHORT);

    const nextSession = debounce(useCallback(() => {
        if (sessions.current.length < 2) return;
        const index = sessions.current.findIndex((s) => s.id === file.current)
        if (index === -1) return;

        // go to the next session
        const i = index + 1 >= sessions.current.length ? index : index + 1;
        onSessionClick(i);
    }, [onSessionClick]), DEBOUNCE_TIME_SHORT);

    // context menu
    const {show} = useContextMenu({id: EDITOR_MENU_ID});

    function handleContextMenu(event: MouseEvent) {
        show({
            event,
            props: {key: 'value'}
        })
    }

    return (
        <>
            <Sessions onSessionClick={onSessionClick} onSessionClose={onSessionClose} sessions={sessions.current}
                      activeSession={file.current}/>
            <div
                className={`relative flex-1 flex-col overflow-hidden ${isVertical ? "" : "pb-5"} ${backgroundColor}`}>

                <MyMenu lan={lan} view={view.current}
                        seeDefinition={seeDefinition} seeImplementation={seeImplementations} seeUsages={seeUsages}
                        run={debouncedRun} format={debouncedFormat} share={debouncedShare}/>

                <Usages
                    lan={lan}
                    seeing={seeing} view={view.current} value={value}
                    usages={usages} setUsages={setUsages}/>

                <div className={"h-full overflow-auto"} ref={editor} onContextMenu={handleContextMenu}>
                    <div className={"sticky right-0 top-0 z-10"}>
                        <RefreshButton lan={lan}/>
                        <ClickBoard content={value}/>
                    </div>
                </div>

                <StatusBar
                    row={row} col={col} file={file.current}
                    sessions={sessions.current}
                    prevSession={prevSession}
                    nextSession={nextSession}
                    onLintClick={onLintClick}
                    errors={errorCount}
                    warnings={warningCount}
                    info={infoCount}/>
            </div>
        </>
    )
};
