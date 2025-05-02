import {Modal, useThemeMode} from "flowbite-react";
import hljs from "highlight.js/lib/core";
import go from "highlight.js/lib/languages/go";

import {languages, LSPReferenceResult, SeeingType} from "../types";
import {ICON_BUTTON_CLASS, LANGUAGE_GO, TRANSLATE} from "../constants.ts";
import {displayFileUri, isUserCode} from "../utils.ts";
import {EditorView} from "@codemirror/view"; // or any other style you like

hljs.registerLanguage(LANGUAGE_GO, go);

const highlightClass = "inline-highlight";
const startMarker = "/*__START__*/";
const endMarker = "/*__END__*/";

export function Usages(props: {
    lan: languages
    seeing: SeeingType
    usages: LSPReferenceResult[],
    setUsages: (v: LSPReferenceResult[]) => void
    rawFile: string,
    view: EditorView | null,
}) {
    const {mode} = useThemeMode();
    const {lan, view, usages, setUsages, seeing, rawFile} = props;
    const allLines = rawFile.split("\n");
    const displayUsages = usages.filter(v => isUserCode(v.uri)); // only show usages in user code

    function jumpToUsage(row: number, col: number) {
        if (!view) return;

        const line = view.state.doc.line(row);
        const pos = line.from + col;
        view.dispatch({
            selection: {anchor: pos, head: pos},
            effects: EditorView.scrollIntoView(pos)
        });
    }

    function onClick(row: number, col: number) {
        return () => {
            jumpToUsage(row + 1, col); // LSP is 0-indexed, but CodeMirror is 1-indexed
            setUsages([]); // to close the modal
        }
    }

    return (
        <Modal dismissible show={!!usages.length} onClose={() => setUsages([])}>
            <Modal.Header>
                {TRANSLATE[seeing][lan]}: {displayUsages.length}
            </Modal.Header>
            <Modal.Body>
                <div className="flex flex-col gap-2">
                    {displayUsages.map(({uri, range: {start, end}}, index) => {
                        const lineIndex = start.line;
                        const fromCol = start.character;
                        const toCol = end.character;
                        const previewStart = Math.max(0, lineIndex - 3);
                        const previewEnd = Math.min(allLines.length, lineIndex + 4);

                        const contextLines = allLines.slice(
                            Math.max(0, previewStart),
                            Math.min(allLines.length, previewEnd)
                        );

                        const annotatedLines = [...contextLines];
                        const targetLineOffset = lineIndex - previewStart;
                        const originalLine = annotatedLines[targetLineOffset];

                        // Highlight the usage span in the target line using markers
                        annotatedLines[targetLineOffset] =
                            originalLine.slice(0, fromCol) +
                            startMarker +
                            originalLine.slice(fromCol, toCol) +
                            endMarker +
                            originalLine.slice(toCol);

                        const code = annotatedLines.join("\n");

                        // Syntax highlight and post-process
                        let highlighted = hljs.highlight(code, {language: LANGUAGE_GO}).value;
                        highlighted = highlighted
                            .replace(startMarker, `<mark class=${highlightClass}>`)
                            .replace(endMarker, '</mark>');

                        return (
                            <div key={index}>
                                    <span onClick={onClick(start.line, start.character)} className={`mb-0.5 flex items-center gap-1 text-sm ${ICON_BUTTON_CLASS}`}>
                                        <span className={"font-semibold"}> {index + 1}: </span>
                                        <span className={`break-all underline`}>
                                            {displayFileUri(uri)}: {lineIndex + 1}
                                        </span>
                                    </span>
                                <pre
                                    className={`overflow-auto rounded border p-2 text-xs leading-snug dark:border-gray-500 ${mode === "dark" ? "hljs" : "bg-gray-50"}`}>
                                        <code dangerouslySetInnerHTML={{__html: highlighted}}/>
                                </pre>
                            </div>
                        );
                    })}
                </div>
            </Modal.Body>
        </Modal>
    );
}
