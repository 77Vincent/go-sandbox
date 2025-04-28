// react
import {ReactNode, useCallback, useEffect, useRef, useState} from "react";
import {ThemeMode, useThemeMode} from "flowbite-react";

// codemirror imports
import {indentationMarkers} from '@replit/codemirror-indentation-markers';
import {openLintPanel, lintKeymap, lintGutter, linter, Diagnostic} from "@codemirror/lint";
import {acceptCompletion, completionStatus} from "@codemirror/autocomplete";
import {EditorState, Compartment, EditorSelection, ChangeSpec} from "@codemirror/state"
import {
    ViewUpdate, EditorView, keymap, highlightSpecialChars, drawSelection,
    highlightActiveLine, dropCursor, rectangularSelection,
    crosshairCursor, lineNumbers, highlightActiveLineGutter
} from "@codemirror/view"
import {
    indentOnInput,
    bracketMatching, foldGutter, foldKeymap, indentUnit,
} from "@codemirror/language"
import {
    defaultKeymap, history, historyKeymap, indentMore, indentLess
} from "@codemirror/commands"
import {
    searchKeymap, highlightSelectionMatches
} from "@codemirror/search"
import {
    autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap,
    CompletionContext, CompletionResult, Completion
} from "@codemirror/autocomplete"

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
import {KeyBindingsType, languages, LSPCompletionItem, mySandboxes, patchI} from "../types";
import {
    EMACS,
    NONE,
    DEBOUNCE_TIME,
    VIM,
    CURSOR_HEAD_KEY,
    DEFAULT_INDENTATION_SIZE,
} from "../constants.ts";
import {getCursorHead, getFileUri, getWsUrl, isUserCode} from "../utils.ts";
import {LSP_KIND_LABELS, LSPClient} from "../lib/lsp.ts";
import {ClickBoard, RefreshButton} from "./Common.tsx";
import StatusBar from "./StatusBar.tsx";
import {fetchSourceCode} from "../api/api.ts";
import {
    historyBack,
    historyField,
    historyForward,
    recordHistory, resetHistory,
} from "../lib/history.ts";


function getCursorPos(v: ViewUpdate | EditorView) {
    // return 1-based index
    const pos = v.state.selection.main.head;
    const line = v.state.doc.lineAt(pos);
    return {row: line.number, col: pos - line.from + 1}
}

function posToHead(v: ViewUpdate | EditorView, row: number, col: number) {
    const line = v.state.doc.line(row);
    return line.from + col - 1;
}

// map type from LSP to codemirror
const LSP_TO_CODEMIRROR_TYPE: Record<string, string> = {
    Text: "text",
    Method: "method",
    Function: "function",
    Constructor: "function",
    Field: "property",
    Variable: "variable",
    Class: "class",
    Interface: "interface",
    Module: "namespace",
    Property: "property",
    Unit: "constant",
    Value: "text",
    Enum: "enum",
    Keyword: "keyword",
    Snippet: "function",
    Color: "constant",
    File: "variable",
    Reference: "variable",
    Folder: "namespace",
    EnumMember: "enum",
    Constant: "constant",
    Struct: "class",
    Event: "function",
    Operator: "function",
    TypeParameter: "type",
}

// Compartments for dynamic config
const fontSizeCompartment = new Compartment();
const indentCompartment = new Compartment();
const keyBindingsCompartment = new Compartment();
const themeCompartment = new Compartment();
const autoCompletionCompartment = new Compartment();
const lintCompartment = new Compartment();
const readOnlyCompartment = new Compartment()

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

    // settings
    lan: languages
    keyBindings: KeyBindingsType;
    fontSize: number;
    isLintOn: boolean;
    isAutoCompletionOn: boolean;

    // handler
    onChange: (code: string) => void;
    // setters
    setShowSettings: (v: boolean) => void;
    setShowManual: (v: boolean) => void;
    // actions
    debouncedRun: () => void;
    debouncedFormat: () => void;
    debouncedShare: () => void;
    cleanHistoryTrigger: boolean;
}) {
    const {
        sandboxId,
        goVersion,
        setToastError,
        // props
        lan,
        value, patch,
        fontSize, keyBindings,
        isLintOn, isAutoCompletionOn,
        // handlers
        onChange,
        // setters
        setShowSettings,
        setShowManual,
        cleanHistoryTrigger,
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

    // ref
    const editor = useRef<HTMLDivElement>(null);
    const view = useRef<EditorView | null>(null);
    const lsp = useRef<LSPClient | null>(null);
    const version = useRef<number>(1); // initial version
    const file = useRef<string>(getFileUri(goVersion));

    const hist = view.current?.state.field(historyField);
    // update the file path when the history changes
    useEffect(() => {
        if (!hist || hist.stack.length === 0) return;
        const path = hist.stack[hist.index].filePath;

        if (path === file.current) return;
        // on update the file path when the history changes
        file.current = path;
    }, [hist]);

    // should only be triggered by the trigger
    useEffect(() => {
        resetHistory(view.current, value, getFileUri(goVersion));
    }, [cleanHistoryTrigger]);

    // manage cursor
    const onCursorChange = debounce(useCallback((v: ViewUpdate) => {
        localStorage.setItem(CURSOR_HEAD_KEY, String(v.state.selection.main.head))
        const {row, col} = getCursorPos(v);
        setRow(row);
        setCol(col);
    }, []), DEBOUNCE_TIME)

    useEffect(() => {
        // reset error/warning/info count
        setErrorCount(0);
        setWarningCount(0);
        setInfoCount(0);

        // do no display diagnostic for non-user code
        if (!isUserCode(file.current)) {
            return
        }

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

            // do not display completion for non-user code
            const {stack, index} = v.state.field(historyField);
            if (stack.length) {
                if (!isUserCode(stack[index].filePath)) {
                    return
                }
            }

            // get completions
            const {row, col} = getCursorPos(v);
            const completions = await lsp.current.getCompletions(row - 1, col - 1) // use 0-based index
            setCompletions(completions);
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
        }
    }, [onChange, debouncedLspUpdate, debouncedStoreCode]);

    const seeDefinition = useCallback((v: EditorView): boolean => {
        (async function () {
            if (!lsp.current) {
                return
            }
            const {row: currentRow, col: currentCol} = getCursorPos(v);
            const definitions = await lsp.current.getDefinition(currentRow - 1, currentCol - 1, file.current);
            if (!definitions.length) {
                return
            }

            // push the current position to the history
            recordHistory(view.current, file.current);

            const path = decodeURIComponent(definitions[0].uri);
            file.current = path;
            const {is_main, error, content} = await fetchSourceCode(path, goVersion)
            const {range: {start: {line, character}}} = definitions[0];
            const row = line + 1; // 1-based index
            const col = character + 1; // 1-based index
            if (error) {
                setToastError(error);
                return;
            }
            if (is_main) {
                v.dispatch({
                    selection: {
                        anchor: posToHead(v, row, col), // 1-based index
                    },
                    scrollIntoView: true,
                })
            }
            if (content) {
                // update the doc first
                v.dispatch({
                    changes: {
                        from: 0,
                        to: v.state.doc.length,
                        insert: content
                    },
                });
                // then move the cursor
                v.dispatch({
                    selection: {
                        anchor: posToHead(v, row, col), // 1-based index
                    },
                    scrollIntoView: true,
                })
            }

            // record the history after the change
            recordHistory(v, path);
        }());
        return true;
    }, [goVersion, setToastError]);

    const [focusedKeymap] = useState(() => [
        {
            key: `Mod-Alt-,`,
            preventDefault: true,
            run: historyBack,
        },
        {
            key: `Mod-Alt-.`,
            preventDefault: true,
            run: historyForward,
        },
        {
            key: `Mod-b`,
            preventDefault: true,
            run: seeDefinition,
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
            key: `Mod-r`,
            preventDefault: true,
            run: () => {
                debouncedRun()
                return true;
            }
        },
        {
            key: `Mod-Alt-l`,
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
        EditorState.allowMultipleSelections.of(true), // Allow multiple cursors/selections
        indentOnInput(), // Re-indent lines when typing specific input
        bracketMatching(), // Highlight matching brackets near the cursor
        closeBrackets(), // Automatically close brackets
        rectangularSelection(), // Allow alt-drag to select rectangular regions
        crosshairCursor(), // Change the cursor to a crosshair when holding alt
        highlightActiveLine(), // Style the current line specially
        highlightActiveLineGutter(), // Style the gutter for the current line specially
        highlightSelectionMatches(), // Highlight text that matches the selected text
        keymap.of([
            ...closeBracketsKeymap, // Closed-bracket-aware backspace
            ...defaultKeymap, // A large set of basic bindings
            ...searchKeymap, // Search-related keys
            ...historyKeymap, // Redo/undo keys
            ...foldKeymap, // Code folding bindings
            ...completionKeymap, // Autocompletion keys
            ...lintKeymap, // Keys related to the linter system
            ...focusedKeymap, // Custom key bindings
        ]),
        historyField, // The history field
        readOnlyCompartment.of(EditorState.readOnly.of(!isUserCode(file.current))),
        lintCompartment.of(setLint(isLintOn && isUserCode(file.current), diagnostics)),
        autoCompletionCompartment.of(autocompletion({override: isAutoCompletionOn && isUserCode(file.current) ? [setAutoCompletion(completions)] : []})),
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
    }, [patch]);

    const handleDiagnostics = useCallback((data: Diagnostic[]) => {
        setDiagnostics(data);
    }, []);
    const handleError = useCallback((message: string) => {
        setToastError(message);
    }, [setToastError]);

    // must only run once, so no dependencies
    useEffect(() => {
        if (!editor.current || view.current) return;

        view.current = new EditorView({
            doc: value,
            extensions: extensions,
            parent: editor.current,
            selection: EditorSelection.cursor(Math.min(getCursorHead(), value.length)),
        });
        view.current.dispatch({
            scrollIntoView: true,
        })
        view.current.focus();

        // push the initial state to the history
        recordHistory(view.current, getFileUri(goVersion));

        lsp.current = new LSPClient(getWsUrl("/ws"), goVersion, view.current, handleDiagnostics, handleError);

        // key bindings for unfocused editor
        Mousetrap.bind('esc', function () {
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
        Mousetrap.bind(`mod+r`, function () {
            debouncedRun()
            return false
        });
        Mousetrap.bind(`mod+option+l`, function () {
            debouncedFormat()
            return false
        });
        Mousetrap.bind(`mod+s`, function () {
            debouncedShare()
            return false
        });
        Mousetrap.bind(`mod+option+,`, function () {
            historyBack(view.current);
            return false
        });
        Mousetrap.bind(`mod+option+.`, function () {
            historyForward(view.current);
            return false
        });

        // destroy editor on unmount
        return () => {
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
        const on = isAutoCompletionOn && isUserCode(file.current);
        view.current?.dispatch({
            effects: [autoCompletionCompartment.reconfigure(autocompletion({
                override: on ? [setAutoCompletion(completions)] : []
            }))]
        })
    }, [completions, isAutoCompletionOn]);
    useEffect(() => {
        const on = isLintOn && isUserCode(file.current);
        view.current?.dispatch({effects: [lintCompartment.reconfigure(setLint(on, diagnostics))]})
        view.current?.dispatch({effects: [readOnlyCompartment.reconfigure(EditorState.readOnly.of(!isUserCode(file.current)))]})
    }, [diagnostics, isLintOn]);

    const onLintClick = useCallback(() => {
        if (!view.current) return;
        openLintPanel(view.current);
    }, [view]);

    return (
        // eslint-disable-next-line tailwindcss/no-custom-classname
        <div className={`relative mb-5 flex-1 overflow-auto ${mode === "dark" ? "editor-bg-dark" : ""}`} ref={editor}>
            <div className={"sticky right-0 top-0 z-10"}>
                <RefreshButton lan={lan}/>
                <ClickBoard content={value}/>
            </div>

            <StatusBar
                lan={lan}
                view={view.current}
                row={row} col={col} file={file.current}
                onLintClick={onLintClick}
                errors={errorCount}
                warnings={warningCount}
                info={infoCount}/>
        </div>
    )
};
