import { acceptCompletion, completionStatus } from "@codemirror/autocomplete";

import {keymap} from "@codemirror/view";
import {useCallback, useEffect, useRef, useState} from "react";
import {EditorView} from "codemirror";
import {go} from "@codemirror/lang-go";
import {vim} from "@replit/codemirror-vim";
import {emacs} from "@replit/codemirror-emacs";
import {Compartment, EditorSelection} from "@codemirror/state";
import {indentUnit} from "@codemirror/language";
import CodeMirror, {ViewUpdate} from "@uiw/react-codemirror";
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
    keyBindings: KeyBindingsType;
    code: string;
    fontSize: number;
    indent: number;
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
        code, fontSize, indent, keyBindings,
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
    const view = useRef<EditorView | null>(null);
    const codeRef = useRef<string>(code);

    // manage cursor
    const onCursorChange = useRef(debounce(useCallback((v: ViewUpdate) => {
        setCursorHead(v.state.selection.main.head);
    }, []), RUN_DEBOUNCE_TIME)).current

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
                if (!completionStatus(v.state))  {
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
        focusedKeymap,
        fontSizeCompartment.of(setFontSize(fontSize)),
        indentCompartment.of(setIndent(indent)),
        keyBindingsCompartment.of(setKeyBindings(keyBindings)),
        EditorView.updateListener.of(onCursorChange),
    ]);

    function onCreateEditor(v: EditorView) {
        // initialize refs
        view.current = v;
        codeRef.current = code;

        // key bindings for unfocused editor
        Mousetrap.bind('esc', function () {
            v.focus();
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
    }

    // Dynamically reconfigure compartments when props change
    useEffect(() => {
        if (!view.current) return;

        view.current.dispatch({
            effects: [
                fontSizeCompartment.reconfigure(setFontSize(fontSize)),
                indentCompartment.reconfigure(setIndent(indent)),
                keyBindingsCompartment.reconfigure(setKeyBindings(keyBindings)),
            ]
        });
    }, [fontSize, indent, mode, keyBindings]);

    return (
        <CodeMirror
            indentWithTab={false}
            value={code}
            autoFocus={true}
            theme={mode === "light" ? "light" : "dark"}
            className={`${mode === "dark" ? "editor-bg-color" : ""} flex-1 overflow-auto`}
            extensions={extensions}
            onCreateEditor={onCreateEditor}
            selection={EditorSelection.cursor(Math.min(getCursorHead(), code.length))}
            onChange={onChange}/>
    )
};
