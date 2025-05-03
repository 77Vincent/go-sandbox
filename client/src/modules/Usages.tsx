import {Modal, Tooltip} from "flowbite-react";
import {EditorView} from "@codemirror/view"; // or any other style you like

import {languages, LSPReferenceResult, SeeingType} from "../types";
import {SEEING_IMPLEMENTATIONS, TRANSLATE} from "../constants.ts";
import {displayFileUri, isUserCode, posToHead} from "../utils.ts";
import MiniEditor from "./MiniEditor.tsx";
import {useCallback, useEffect, useState} from "react";

const highlightClass = "inline-highlight";
const startMarker = "/*__START__*/";
const endMarker = "/*__END__*/";

export function Usages(props: {
    lan: languages
    seeing: SeeingType
    usages: LSPReferenceResult[],
    setUsages: (v: LSPReferenceResult[]) => void
    value: string,
    view: EditorView | null,
}) {
    const {lan, view, usages, setUsages, seeing, value} = props;
    const [lookAt, setLookAt] = useState<number>(0);

    const allLines = value.split("\n");
    const displayUsages = usages.filter(v => isUserCode(v.uri)); // only show usages in user code
    const start = displayUsages[lookAt]?.range.start;
    const head = start ? posToHead(view as EditorView, start.line + 1, start.character) : 0;

    useEffect(() => {
        setLookAt(0); // reset the lookAt index when usages change
    }, [usages]);

    const jumpToUsage = useCallback((row: number, col: number) => {
        if (!view) return;

        const line = view.state.doc.line(row);
        const pos = line.from + col;
        view.dispatch({
            selection: {anchor: pos, head: pos},
            effects: EditorView.scrollIntoView(pos, {
                y: "center",
            })
        });
    }, [view])

    const onPreviewClick = useCallback((index: number) => {
        return () => {
            setLookAt(index);
        }
    }, [setLookAt])

    const onJumpClick = useCallback((row: number, col: number) => {
        return () => {
            jumpToUsage(row + 1, col); // LSP is 0-indexed, but CodeMirror is 1-indexed
            setUsages([]); // to close the modal
        }
    }, [jumpToUsage, setUsages])

    return (
        <Modal size={"4xl"} dismissible show={!!usages.length} onClose={() => setUsages([])}>
            <Modal.Header className={"flex items-center gap-2"}>
                <span>
                    {
                        seeing === SEEING_IMPLEMENTATIONS
                            ? `${TRANSLATE.implementations[lan]} / ${TRANSLATE.definitions[lan]}`
                            : TRANSLATE.usages[lan]
                    }
                </span>

                <span>: {displayUsages.length}</span>
            </Modal.Header>

            <Modal.Body className={"relative"}>
                <MiniEditor className={"sticky top-0 mb-2 max-h-52 overflow-auto border border-gray-200 dark:border-gray-600"}
                            value={value} head={head}/>

                <div className="flex flex-col">
                    {displayUsages.map(({uri, range: {start, end}}, index) => {
                        const lineIndex = start.line;
                        const fromCol = start.character;
                        const toCol = end.character;
                        const previewStart = Math.max(0, lineIndex);
                        const previewEnd = Math.min(allLines.length, lineIndex + 1);

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

                        let code = annotatedLines.join("\n");
                        code = code
                            .replace(startMarker, `<mark class=${highlightClass}>`)
                            .replace(endMarker, '</mark>');

                        return (
                            <div key={index}
                                 className={`flex items-center gap-2 px-2 py-0.5 ${index === lookAt ? "bg-cyan-100 dark:bg-gray-800" : ""}`}>
                                <pre onClick={onPreviewClick(index)}
                                     className={`flex-1 cursor-default overflow-auto p-0.5 text-xs leading-snug text-black dark:text-white`}>
                                        <code dangerouslySetInnerHTML={{__html: code}}/>
                                </pre>

                                <Tooltip placement={"left"} content={`${TRANSLATE.jumpTo[lan]} line ${lineIndex + 1}`}
                                         className={"text-xs"}>
                                    <div onClick={onJumpClick(start.line, start.character)}
                                         className={`cursor-pointer text-xs font-light text-gray-500 hover:opacity-60 dark:text-gray-400`}
                                    >
                                        {displayFileUri(uri)}:
                                        <span className={`text-gray-700 dark:text-gray-200`}> {lineIndex + 1} </span>
                                    </div>
                                </Tooltip>
                            </div>
                        );
                    })}
                </div>
            </Modal.Body>
        </Modal>
    );
}
