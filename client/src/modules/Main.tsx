// react
import {ReactNode, useCallback, useEffect, useRef, useState} from "react";
import {ThemeMode, useThemeMode} from "flowbite-react";

// codemirror imports
import {lintKeymap, lintGutter, linter, Diagnostic} from "@codemirror/lint";
import {acceptCompletion, completionStatus} from "@codemirror/autocomplete";
import {EditorState, Compartment, EditorSelection} from "@codemirror/state"
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
import {KeyBindingsType, LSPCompletionItem, patchI} from "../types";
import {EMACS, NONE, DEBOUNCE_TIME, VIM, CURSOR_HEAD_KEY, DEFAULT_INDENTATION_SIZE} from "../constants.ts";
import {getCursorHead, getUrl} from "../utils.ts";
import LSP, {LSP_KIND_LABELS} from "../lsp/client.ts";

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

// setters of compartments
const setLint = (isLintOn: boolean, diagnostics: Diagnostic[]) => {
    return isLintOn ? linter(() => diagnostics) : [];
}
const setAutoCompletion = (completions: LSPCompletionItem[]) => {
    return (context: CompletionContext): CompletionResult | null => {
        const word = context.matchBefore(/\w*/);
        if (!word || (word.from === word.to && !context.explicit)) return null;

        const items: Completion[] = completions.map((v) => {
            return {
                label: v.label,
                detail: v.detail,
                boost: parseInt(v.sortText || "0"),
                type: LSP_TO_CODEMIRROR_TYPE[LSP_KIND_LABELS[v.kind || 1]],
                info: v.documentation?.value,
                apply: (view, _completion, from, to) => {
                    const insert = v.insertText ?? v.label;
                    // Build the base change: replace the selected text with insertText
                    const changes = [
                        {from, to, insert}
                    ];

                    if (v.additionalTextEdits) {
                        for (const edit of v.additionalTextEdits) {
                            const from = view.state.doc.line(edit.range.start.line + 1).from + edit.range.start.character;
                            const to = view.state.doc.line(edit.range.end.line + 1).from + edit.range.end.character;
                            changes.push({from, to, insert: edit.newText});
                        }
                    }
                    view.dispatch({changes});
                },
            }
        });

        return {
            from: word.from,
            options: items,
            validFor: /^\w*$/, // keeps the list open while typing
        }
    }
}
const setTheme = (mode: ThemeMode) => {
    return mode === "dark" ? themeDark : themeLight;
}
const setFontSize = (fontSize: number) => {
    return EditorView.theme({"&": {fontSize: `${fontSize}px`}})
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

    value: string;
    patch: patchI;

    // settings
    keyBindings: KeyBindingsType;
    fontSize: number;
    isLintOn: boolean;
    isAutoCompletionOn: boolean;

    // handler
    onChange: (code: string) => void;
    // setters
    setShowSettings: (v: boolean) => void;
    // actions
    debouncedRun: () => void;
    debouncedFormat: () => void;
    debouncedShare: () => void;
}) {
    const {
        setToastError,
        // props
        value, patch,
        fontSize, keyBindings,
        isLintOn, isAutoCompletionOn,
        // handlers
        onChange,
        // setters
        setShowSettings,
        // action
        debouncedRun,
        debouncedFormat,
        debouncedShare,
    } = props;
    const {mode} = useThemeMode();

    // ref
    const editor = useRef<HTMLDivElement>(null);
    const view = useRef<EditorView | null>(null);
    const lsp = useRef<LSP | null>(null);
    const version = useRef<number>(1); // initial version

    // local state
    const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
    const [completions, setCompletions] = useState<LSPCompletionItem[]>([]);

    // manage cursor
    const onCursorChange = useRef(debounce(useCallback((v: ViewUpdate) => {
        localStorage.setItem(CURSOR_HEAD_KEY, String(v.state.selection.main.head))
    }, []), DEBOUNCE_TIME)).current

    // manage content
    const onViewUpdate = (v: ViewUpdate) => {
        if (v.docChanged) {
            onChange(v.state.doc.toString());
            // version increment
            version.current += 1;


            (async function () {
                try {
                    if (!lsp.current) return
                    // update file view in lsp
                    await lsp.current.didChange(version.current, v.state.doc.toString());

                    // get completions
                    const pos = v.state.selection.main.head;
                    const line = v.state.doc.lineAt(pos);
                    const row = line.number - 1
                    const col = pos - line.from;
                    const completions = await lsp.current.getCompletions(row, col)
                    setCompletions(completions);
                } catch (e) {
                    setToastError((e as Error).message)
                }
            }());
        }
    }

    const focusedKeymap = [
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
            key: `Mod-Shift-e`,
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
    ]

    const [extensions] = useState(() => [
        go(),
        lineNumbers(), // A line number gutter
        lintGutter(), // A gutter with lint icon
        foldGutter(), // A gutter with code folding markers
        highlightSpecialChars(), // Replace non-printable characters with placeholders
        history(), // The undo history
        drawSelection(), // Replace native cursor/selection with our own
        dropCursor(), // Show a drop cursor when dragging over the editor
        EditorState.allowMultipleSelections.of(true), // Allow multiple cursors/selections
        indentOnInput(), // Re-indent lines when typing specific input
        bracketMatching(), // Highlight matching brackets near cursor
        closeBrackets(), // Automatically close brackets
        rectangularSelection(), // Allow alt-drag to select rectangular regions
        crosshairCursor(), // Change the cursor to a crosshair when holding alt
        highlightActiveLine(), // Style the current line specially
        highlightActiveLineGutter(), // Style the gutter for current line specially
        highlightSelectionMatches(), // Highlight text that matches the selected text
        keymap.of([
            ...closeBracketsKeymap, // Closed-brackets aware backspace
            ...defaultKeymap, // A large set of basic bindings
            ...searchKeymap, // Search-related keys
            ...historyKeymap, // Redo/undo keys
            ...foldKeymap, // Code folding bindings
            ...completionKeymap, // Autocompletion keys
            ...lintKeymap, // Keys related to the linter system
            ...focusedKeymap, // Custom key bindings
        ]),
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

    // must only run once, so no dependencies
    useEffect(() => {
        if (!editor.current || view.current) return;

        view.current = new EditorView({
            doc: value,
            extensions: extensions,
            parent: editor.current,
            selection: EditorSelection.cursor(Math.min(getCursorHead(), value.length)),
        });
        view.current.focus();

        lsp.current = new LSP(getUrl("/ws"), view.current, setDiagnostics);

        (async function () {
            await lsp.current?.initialize(value)
        }());

        // key bindings for unfocused editor
        Mousetrap.bind('esc', function () {
            view.current?.focus();
            return false
        });
        Mousetrap.bind(`mod+,`, function () {
            setShowSettings(true);
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
        Mousetrap.bind(`mod+shift+e`, function () {
            debouncedShare()
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
        if (!view.current) return;
        view.current.dispatch({effects: [themeCompartment.reconfigure(setTheme(mode))]})
    }, [mode]);
    useEffect(() => {
        if (!view.current) return;
        view.current.dispatch({effects: [keyBindingsCompartment.reconfigure(setKeyBindings(keyBindings))]})
    }, [keyBindings]);
    useEffect(() => {
        if (!view.current) return;
        view.current.dispatch({effects: [fontSizeCompartment.reconfigure(setFontSize(fontSize))]})
    }, [fontSize]);
    useEffect(() => {
        if (!view.current) return;
        view.current.dispatch({
            effects: [autoCompletionCompartment.reconfigure(autocompletion({
                override: isAutoCompletionOn ? [setAutoCompletion(completions)] : []
            }))]
        })
    }, [completions, isAutoCompletionOn]);
    useEffect(() => {
        if (!view.current) return;
        view.current.dispatch({effects: [lintCompartment.reconfigure(setLint(isLintOn, diagnostics))]})
    }, [diagnostics, isLintOn]);

    return (
        // eslint-disable-next-line tailwindcss/no-custom-classname
        <div className={`flex-1 overflow-auto ${mode === "dark" ? "editor-bg-dark" : ""}`} ref={editor}/>
    )
};
