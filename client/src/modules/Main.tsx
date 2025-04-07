// react
import {useCallback, useEffect, useRef, useState} from "react";
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
    autocompletion, completionKeymap, closeBrackets,
    closeBracketsKeymap
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
import {KeyBindingsType, patchI} from "../types";
import {EMACS, NONE, DEBOUNCE_TIME, VIM} from "../constants.ts";
import {getCursorHead, getUrl, setCursorHead} from "../utils.ts";
import LSP from "../lsp/client.ts";

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
const setAutoCompletion = (isAutoCompletionOn: boolean) => {
    return isAutoCompletionOn ? autocompletion() : [];
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
    value: string;
    patch: patchI;

    // settings
    keyBindings: KeyBindingsType;
    fontSize: number;
    indent: number;
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
        value, patch,
        fontSize, indent, keyBindings,
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
    const lspClientRef = useRef<LSP | null>(null);
    const docVersion = useRef<number>(1);

    // local state
    const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);

    // manage cursor
    const onCursorChange = useRef(debounce(useCallback((v: ViewUpdate) => {
        setCursorHead(v.state.selection.main.head);
    }, []), DEBOUNCE_TIME)).current

    // manage content
    const onViewUpdate = (v: ViewUpdate) => {
        if (v.docChanged) {
            onChange(v.state.doc.toString());
            // version increment
            docVersion.current += 1;

            (async function () {
                try {
                    if (!lspClientRef.current) return
                    await lspClientRef.current.didChange(docVersion.current, v.state.doc.toString());
                } catch (e) {
                    console.error("LSP didChange error:", e);
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
        // A line number gutter
        lineNumbers(),
        lintGutter(),
        // A gutter with code folding markers
        foldGutter(),
        // Replace non-printable characters with placeholders
        highlightSpecialChars(),
        // The undo history
        history(),
        // Replace native cursor/selection with our own
        drawSelection(),
        // Show a drop cursor when dragging over the editor
        dropCursor(),
        // Allow multiple cursors/selections
        EditorState.allowMultipleSelections.of(true),
        // Re-indent lines when typing specific input
        indentOnInput(),
        // Highlight matching brackets near cursor
        bracketMatching(),
        // Automatically close brackets
        closeBrackets(),
        // Allow alt-drag to select rectangular regions
        rectangularSelection(),
        // Change the cursor to a crosshair when holding alt
        crosshairCursor(),
        // Style the current line specially
        highlightActiveLine(),
        // Style the gutter for current line specially
        highlightActiveLineGutter(),
        // Highlight text that matches the selected text
        highlightSelectionMatches(),
        keymap.of([
            // Closed-brackets aware backspace
            ...closeBracketsKeymap,
            // A large set of basic bindings
            ...defaultKeymap,
            // Search-related keys
            ...searchKeymap,
            // Redo/undo keys
            ...historyKeymap,
            // Code folding bindings
            ...foldKeymap,
            // Autocompletion keys
            ...completionKeymap,
            // Keys related to the linter system
            ...lintKeymap,
            // Custom key bindings
            ...focusedKeymap,
        ]),
        lintCompartment.of(setLint(isLintOn, diagnostics)),
        autoCompletionCompartment.of(setAutoCompletion(isAutoCompletionOn)),
        fontSizeCompartment.of(setFontSize(fontSize)),
        indentCompartment.of(setIndent(indent)),
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

    useEffect(() => {
        if (!editor.current || view.current) return;

        view.current = new EditorView({
            doc: value,
            extensions: extensions,
            parent: editor.current,
            selection: EditorSelection.cursor(Math.min(getCursorHead(), value.length)),
        });
        view.current.focus();

        lspClientRef.current = new LSP(getUrl("/ws"), view.current, setDiagnostics);

        (async function () {
            await lspClientRef.current?.initialize(value)
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
        view.current.dispatch({effects: [indentCompartment.reconfigure(setIndent(indent))]})
    }, [indent]);
    useEffect(() => {
        if (!view.current) return;
        view.current.dispatch({effects: [fontSizeCompartment.reconfigure(setFontSize(fontSize))]})
    }, [fontSize]);
    useEffect(() => {
        if (!view.current) return;
        view.current.dispatch({effects: [autoCompletionCompartment.reconfigure(setAutoCompletion(isAutoCompletionOn))]})
    }, [isAutoCompletionOn]);
    useEffect(() => {
        if (!view.current) return;
        view.current.dispatch({effects: [lintCompartment.reconfigure(setLint(isLintOn, diagnostics))]})
    }, [diagnostics, isLintOn]);

    return (
        // eslint-disable-next-line tailwindcss/no-custom-classname
        <div className={`flex-1 overflow-auto ${mode === "dark" ? "editor-bg-dark" : ""}`} ref={editor}/>
    )
};
