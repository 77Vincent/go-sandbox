import {acceptCompletion, completionStatus} from "@codemirror/autocomplete";

import {keymap} from "@codemirror/view";
import {useCallback, useEffect, useRef, useState} from "react";
import {basicSetup, EditorView} from "codemirror";
import {go} from "@codemirror/lang-go";
import {vim} from "@replit/codemirror-vim";
import {emacs} from "@replit/codemirror-emacs";
import {Compartment, EditorSelection} from "@codemirror/state";
import {indentUnit} from "@codemirror/language";
import {ViewUpdate} from "@uiw/react-codemirror";
import {useThemeMode} from "flowbite-react";
import Mousetrap from "mousetrap";

import {KeyBindingsType} from "../types";
import {EMACS, NONE, RUN_DEBOUNCE_TIME, VIM} from "../constants.ts";
import {getCursorHead, setCursorHead} from "../utils.ts";
import debounce from "debounce";
import {indentLess, indentMore} from "@codemirror/commands";

// Compartments for dynamic config
const fontSizeCompartment = new Compartment();
const indentCompartment = new Compartment();
const keyBindingsCompartment = new Compartment();
const onViewUpdateCompartment = new Compartment();

const setFontSize = (fontSize: number) => {
    return EditorView.theme({
        "&": {
            fontSize: `${fontSize}px`,
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
    value: string;
    patch: string;
    keyBindings: KeyBindingsType;
    fontSize: number;
    indent: number;
    isAutoRun: boolean;
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
        value, patch, fontSize, indent, keyBindings, isAutoRun,
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
    }, []), RUN_DEBOUNCE_TIME)).current

    // manage content
    const onViewUpdate = (v: ViewUpdate) => {
        if (v.docChanged) {
            onChange(v.state.doc.toString());
        }
    }

    const focusedKeymap = keymap.of([
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
            run: (v) => {
                if (!completionStatus(v.state)) {
                    return indentMore(v);
                }
                return acceptCompletion(v);
            },
        },
        {
            key: "Shift-Tab",
            preventDefault: true,
            run: (v) => {
                return indentLess(v)
            },
        },
    ]);

    const [extensions] = useState(() => [
        go(),
        basicSetup,
        focusedKeymap,
        fontSizeCompartment.of(setFontSize(fontSize)),
        indentCompartment.of(setIndent(indent)),
        keyBindingsCompartment.of(setKeyBindings(keyBindings)),
        EditorView.updateListener.of(onCursorChange),
        onViewUpdateCompartment.of(EditorView.updateListener.of(onViewUpdate)),
    ]);

    // update the view when the value changes from outside
    useEffect(() => {
        if (patch === "" || !view.current) return;

        view.current.dispatch({
            changes: {
                from: 0,
                to: view.current.state.doc.length,
                insert: patch
            },
            selection: {
                anchor: Math.min(getCursorHead(), patch.length),
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
                onViewUpdateCompartment.reconfigure(EditorView.updateListener.of(onViewUpdate)),
            ]
        });
    }, [isAutoRun, fontSize, indent, mode, keyBindings]);

    return (
        <div className={`flex-1 overflow-auto ${mode === "dark" ? "bg-gray-950" : ""}`} ref={editor}/>
    )
};
