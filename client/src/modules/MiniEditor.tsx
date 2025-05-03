import {useEffect, useRef, useState} from "react";
import {
    crosshairCursor,
    drawSelection,
    dropCursor,
    EditorView, highlightActiveLine, highlightActiveLineGutter,
    highlightSpecialChars,
    lineNumbers,
    rectangularSelection
} from "@codemirror/view";
import {Compartment, EditorSelection, EditorState} from "@codemirror/state";
import {go} from "@codemirror/lang-go";
import {indentationMarkers} from "@replit/codemirror-indentation-markers";
import {lintGutter} from "@codemirror/lint";
import {bracketMatching, foldGutter, indentOnInput} from "@codemirror/language";
import {closeBrackets} from "@codemirror/autocomplete";
import {highlightSelectionMatches} from "@codemirror/search";

// theme import
import {vsCodeDark as themeDark} from '@fsegurai/codemirror-theme-vscode-dark'
import {vsCodeLight as themeLight} from '@fsegurai/codemirror-theme-vscode-light'
import {ThemeMode, useThemeMode} from "flowbite-react";

const themeCompartment = new Compartment();
const setTheme = (mode: ThemeMode) => {
    return mode === "dark" ? themeDark : themeLight;
}

export default function Component(props: {
    value: string,
    className?: string,
    head: number,
}) {
    const {mode} = useThemeMode();
    const editor = useRef<HTMLDivElement>(null);
    const view = useRef<EditorView | null>(null);
    const {value, head, className} = props;

    const [extensions] = useState(() => [
        go(),
        EditorView.theme({
            "&": {
                fontSize: "12px",
                fontWeight: "100",
            }
        }),
        EditorState.readOnly.of(true), // Make the editor read-only
        indentationMarkers(), // Show indentation markers
        lineNumbers(), // A line number gutter
        lintGutter(), // A gutter with lint icon
        foldGutter(), // A gutter with code folding markers
        highlightSpecialChars(), // Replace non-printable characters with placeholders
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
        themeCompartment.of(setTheme(mode)),
    ]);

    // Initialize the editor only once
    useEffect(() => {
        if (!editor.current) return;

        view.current = new EditorView({
            doc: value,
            extensions: extensions,
            parent: editor.current,
        });
        view.current.dispatch({
            selection: EditorSelection.cursor(head),
            effects: EditorView.scrollIntoView(head, {
                y: "center",
            })
        });
    }, [extensions, head, value]);

    useEffect(() => {
        if (!view.current) return;

        view.current.dispatch({
            effects: themeCompartment.reconfigure(setTheme(mode))
        });
    }, [mode]);

    return (
        <div className={`${className}`} ref={editor}/>
    )
}
