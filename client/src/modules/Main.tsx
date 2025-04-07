import {acceptCompletion, completionStatus} from "@codemirror/autocomplete";
import {EditorState} from "@codemirror/state"
import {
    EditorView, keymap, highlightSpecialChars, drawSelection,
    highlightActiveLine, dropCursor, rectangularSelection,
    crosshairCursor, lineNumbers, highlightActiveLineGutter
} from "@codemirror/view"
import {
    indentOnInput,
    bracketMatching, foldGutter, foldKeymap
} from "@codemirror/language"
import {
    defaultKeymap, history, historyKeymap
} from "@codemirror/commands"
import {
    searchKeymap, highlightSelectionMatches
} from "@codemirror/search"
import {
    autocompletion, completionKeymap, closeBrackets,
    closeBracketsKeymap
} from "@codemirror/autocomplete"
import {lintKeymap} from "@codemirror/lint"
import { vsCodeDark as themeDark } from '@fsegurai/codemirror-theme-vscode-dark'
import { vsCodeLight as themeLight } from '@fsegurai/codemirror-theme-vscode-light'

import {useCallback, useEffect, useRef, useState} from "react";
import {go} from "@codemirror/lang-go";
import {vim} from "@replit/codemirror-vim";
import {emacs} from "@replit/codemirror-emacs";
import {Compartment, EditorSelection} from "@codemirror/state";
import {indentUnit} from "@codemirror/language";
import {ViewUpdate} from "@uiw/react-codemirror";
import {ThemeMode, useThemeMode} from "flowbite-react";
import Mousetrap from "mousetrap";

import {KeyBindingsType, patchI} from "../types";
import {EMACS, NONE, DEBOUNCE_TIME, VIM} from "../constants.ts";
import {getCursorHead, setCursorHead} from "../utils.ts";
import debounce from "debounce";
import {indentLess, indentMore} from "@codemirror/commands";

// Compartments for dynamic config
const fontSizeCompartment = new Compartment();
const indentCompartment = new Compartment();
const keyBindingsCompartment = new Compartment();
const themeCompartment = new Compartment();

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
    const editor = useRef<HTMLDivElement>(null);
    const view = useRef<EditorView | null>(null);

    // manage cursor
    const onCursorChange = useRef(debounce(useCallback((v: ViewUpdate) => {
        setCursorHead(v.state.selection.main.head);
    }, []), DEBOUNCE_TIME)).current

    // manage content
    const onViewUpdate = (v: ViewUpdate) => {
        if (v.docChanged) {
            onChange(v.state.doc.toString());
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
        // Load the autocompletion system
        isAutoCompletionOn ? autocompletion() : [],
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
        fontSizeCompartment.of(setFontSize(fontSize)),
        indentCompartment.of(setIndent(indent)),
        keyBindingsCompartment.of(setKeyBindings(keyBindings)),
        themeCompartment.of(setTheme(mode)),
        EditorView.updateListener.of(onCursorChange),
        EditorView.updateListener.of(onViewUpdate),
    ]);

    // update the view when the value changes from outside
    useEffect(() => {
        if (patch.value === "" || !view.current) return;

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

    // Dynamically reconfigure compartments when props change
    useEffect(() => {
        if (!view.current) return;

        view.current.dispatch({
            effects: [
                fontSizeCompartment.reconfigure(setFontSize(fontSize)),
                indentCompartment.reconfigure(setIndent(indent)),
                keyBindingsCompartment.reconfigure(setKeyBindings(keyBindings)),
                themeCompartment.reconfigure(setTheme(mode)),
            ]
        });
    }, [fontSize, indent, mode, keyBindings]);

    return (
        // eslint-disable-next-line tailwindcss/no-custom-classname
        <div className={`flex-1 overflow-auto ${mode === "dark" ? "editor-bg-dark" : ""}`} ref={editor}/>
    )
};
