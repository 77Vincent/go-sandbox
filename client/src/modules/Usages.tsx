import {Modal, Tooltip} from "flowbite-react";
import {EditorView} from "@codemirror/view"; // or any other style you like

import {LSPReferenceResult, SeeingType} from "../types";
import {
    arrowDownEvent,
    arrowUpEvent,
    enterEvent,
    keyDownEvent,
    SEEING_IMPLEMENTATIONS
} from "../constants.ts";
import {AppCtx, displayFileUri, getCursorPos, isUserCode, posToHead} from "../utils.ts";
import MiniEditor from "./MiniEditor.tsx";
import {useCallback, useContext, useEffect, useRef, useState} from "react";
import {Divider} from "./Common.tsx";
import {TRANSLATE} from "../lib/i18n.ts";

const highlightClass = "inline-highlight";
const startMarker = "/*__START__*/";
const endMarker = "/*__END__*/";

export function Usages(props: {
    seeing: SeeingType
    usages: LSPReferenceResult[],
    setUsages: (v: LSPReferenceResult[]) => void
    value: string,
    view: EditorView | null,
}) {
    const {view, usages, setUsages, seeing, value} = props;
    const {lan} = useContext(AppCtx);
    const [lookAt, setLookAt] = useState<number>(0);
    const [displayUsages, setDisplayUsages] = useState<LSPReferenceResult[]>(usages);
    const [previewFrom, setPreviewFrom] = useState<number>(0);
    const [previewTo, setPreviewTo] = useState<number>(0);

    // useRef to store the lines of the code without re-rendering
    const lines = useRef<string[]>(value.split("\n"));

    useEffect(() => {
        if (!view) return;

        // only show usages in user code
        const displayed = usages.filter(v => isUserCode(v.uri))
        setDisplayUsages(displayed);
        // find the current lookAt index

        // find the usage index to look at
        const usageIndex = displayed.findIndex(v => v.range.start.line + 1 === getCursorPos(view).row);
        setLookAt(usageIndex === -1 ? 0 : usageIndex)
    }, [usages, view]);

    useEffect(() => {
        const u = displayUsages[lookAt];
        if (u) {
            const {range: {start, end}} = u;
            const head = posToHead(view as EditorView, start.line + 1, start.character + 1);
            setPreviewFrom(head);
            setPreviewTo(head + end.character - start.character);
        }
    }, [displayUsages, lookAt, view]);

    const jumpToUsage = useCallback((row: number, col: number) => {
        if (!view) return;

        const line = view.state.doc.line(row);
        const pos = line.from + col;
        view.dispatch({
            selection: {anchor: pos, head: pos},
            scrollIntoView: true,
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

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === arrowDownEvent) {
            setLookAt(prev => {
                if (prev + 1 >= displayUsages.length) {
                    return prev;
                }
                return prev + 1;
            })
        }
        if (e.key === arrowUpEvent) {
            setLookAt(prev => {
                if (prev - 1 < 0) {
                    return prev;
                }
                return prev - 1;
            })
        }
        if (e.key === enterEvent) {
            e.preventDefault();
            const {range: {start: {line, character}}} = displayUsages[lookAt];
            onJumpClick(line, character)();
        }
    }, [displayUsages, lookAt, onJumpClick]);

    useEffect(() => {
        window.addEventListener(keyDownEvent, handleKeyDown);
        return () => {
            window.removeEventListener(keyDownEvent, handleKeyDown);
        }
    }, [handleKeyDown]);

    return (
        <Modal size={"5xl"} dismissible show={!!usages.length} onClose={() => setUsages([])}>
            <Modal.Header className={"flex items-center gap-2"}>
                <span>
                    {
                        seeing === SEEING_IMPLEMENTATIONS
                            ? `${TRANSLATE.implementations[lan]} / ${TRANSLATE.definitions[lan]}`
                            : TRANSLATE.usages[lan]
                    }
                </span>

                <span
                    className={"ml-4 text-xs font-light text-gray-500"}>{displayUsages.length} {TRANSLATE.matches[lan]}</span>
            </Modal.Header>

            <Modal.Body className={"relative"}>
                <MiniEditor
                    from={previewFrom} to={previewTo}
                    className={"sticky top-0 mb-2 max-h-52 overflow-auto border border-gray-200 dark:border-gray-600"}
                    value={value}/>

                <div className="flex flex-col">
                    {displayUsages.map(({uri, range: {start, end}}, index) => {
                        const lineIndex = start.line;
                        const fromCol = start.character;
                        const toCol = end.character;
                        const previewStart = Math.max(0, lineIndex);
                        const previewEnd = Math.min(lines.current.length, lineIndex + 1);

                        const contextLines = lines.current.slice(
                            Math.max(0, previewStart),
                            Math.min(lines.current.length, previewEnd)
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
                                <pre onDoubleClick={onJumpClick(start.line, start.character)}
                                     onClick={onPreviewClick(index)}
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

                <Divider className={"my-2"} horizontal={true}/>
                <div className={`text-xs italic text-gray-400 dark:text-gray-500`}>
                    {TRANSLATE.doubleClickGotoHint[lan]}
                </div>
            </Modal.Body>
        </Modal>
    );
}
