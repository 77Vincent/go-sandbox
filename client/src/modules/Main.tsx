import {useEffect, useRef, useState} from "react";
import {EditorView} from "codemirror";
import {go} from "@codemirror/lang-go";
import {vim} from "@replit/codemirror-vim";
import {emacs} from "@replit/codemirror-emacs";
import {Compartment} from "@codemirror/state";
import {indentUnit} from "@codemirror/language";
import CodeMirror, {ViewUpdate} from "@uiw/react-codemirror";
import {useThemeMode} from "flowbite-react";

import {KeyBindingsType} from "../types";
import {EMACS, NONE, VIM} from "../constants.ts";

// Compartments for dynamic config
const fontSizeCompartment = new Compartment();
const indentCompartment = new Compartment();
const keyBindingsCompartment = new Compartment();

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
    keyBindings: KeyBindingsType;
    code: string;
    cursorHead: number;
    fontSize: number;
    indent: number;
    onChange: (code: string) => void;
    onCursorChange: (value: ViewUpdate) => void;
}) {
    const {code, cursorHead, onChange, fontSize, indent, keyBindings, onCursorChange} = props;
    const {mode} = useThemeMode();
    const viewRef = useRef<EditorView | null>(null);

    const [extensions] = useState(() => [
        go(),
        fontSizeCompartment.of(setFontSize(fontSize)),
        indentCompartment.of(setIndent(indent)),
        keyBindingsCompartment.of(setKeyBindings(keyBindings)),
        EditorView.updateListener.of(onCursorChange),
    ]);

    function onCreateEditor(view: EditorView) {
        viewRef.current = view;
        view.focus();
        view.dispatch({
            selection: {anchor: cursorHead},
            scrollIntoView: true,
        })
    }

    // Dynamically reconfigure compartments when props change
    useEffect(() => {
        if (!viewRef.current) return;

        viewRef.current.dispatch({
            effects: [
                fontSizeCompartment.reconfigure(setFontSize(fontSize)),
                indentCompartment.reconfigure(setIndent(indent)),
                keyBindingsCompartment.reconfigure(setKeyBindings(keyBindings)),
            ]
        });
    }, [fontSize, indent, mode, keyBindings]);

    return (
        <CodeMirror
            value={code}
            theme={mode === "light" ? "light" : "dark"}
            className={"flex-1 overflow-auto"}
            extensions={extensions}
            onCreateEditor={onCreateEditor}
            onChange={onChange}/>
    )
};
