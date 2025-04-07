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
import {EMACS, NONE, DEBOUNCE_TIME, VIM, CURSOR_HEAD_KEY} from "../constants.ts";
import {getCursorHead, getUrl} from "../utils.ts";
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
        localStorage.setItem(CURSOR_HEAD_KEY, String(v.state.selection.main.head))
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
