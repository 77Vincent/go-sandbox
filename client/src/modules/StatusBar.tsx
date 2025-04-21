import {CiFaceFrown as ErrorIcon, CiFaceSmile as GoodIcon} from "react-icons/ci";
import {GrFormPrevious as PrevIcon, GrFormNext as NextIcon} from "react-icons/gr";
import {EditorView} from "@codemirror/view";
import {historyBack, historyField, historyForward} from "./codeHistory.ts";
import {Tooltip} from "flowbite-react";
import {BUTTON_INACTIVE, ICON_BUTTON_CLASS, TRANSLATE} from "../constants.ts";
import {languages} from "../types";
import {MetaKey} from "./Common.tsx";
import {MdKeyboardOptionKey as OptionKey} from "react-icons/md";

const errorClasses = "text-orange-800 dark:text-orange-700";
const infoClasses = "text-cyan-700 dark:text-cyan-500";
const warningClasses = "text-cyan-700 dark:text-cyan-500";
const textClasses = "text-xs text-gray-700 dark:text-gray-300";
const commonClasses = "text-xs cursor-pointer hover:opacity-70";

function chooseColor(errors: number, warnings: number, info: number) {
    if (errors > 0) return errorClasses;
    if (warnings > 0) return warningClasses;
    if (info > 0) return infoClasses;
    return infoClasses;
}

export default function Component(props: {
    lan: languages,
    view: EditorView | null,
    row: number,
    col: number,
    errors: number,
    warnings: number,
    info: number,
    onLintClick: () => void,
    filePath: string
}) {
    const {
        lan,
        view, row, col,
        errors, warnings, info,
        onLintClick,
        filePath
    } = props

    if (!view) {
        return null
    }

    const hist = view.state.field(historyField)
    const hasPrevious = hist.index > 0
    const hasNext = hist.index < hist.stack.length - 1

    const onPrevious = () => {
        historyBack(view)
    }
    const onNext = () => {
        historyForward(view)
    }

    return (
        <div
            className={"fixed bottom-0 left-0 z-10 flex w-full justify-between border-t border-t-gray-400 bg-gray-200 px-3 py-0.5 dark:border-t-gray-600 dark:bg-gray-900 "}>
            <div className={"flex items-center gap-2"}>
                <Tooltip content={<div className={"flex items-center gap-1.5"}>
                    {TRANSLATE.prevPlace[lan]}
                    <div className={"flex items-center"}>
                        <MetaKey/><OptionKey/>,
                    </div>
                </div>} className={"text-xs "}>
                    <PrevIcon className={!hasPrevious ? BUTTON_INACTIVE : ICON_BUTTON_CLASS}
                              size={16}
                              onClick={onPrevious}/>
                </Tooltip>

                <Tooltip content={<div className={"flex items-center gap-1.5"}>
                    {TRANSLATE.nextPlace[lan]}
                    <div className={"flex items-center"}>
                        <MetaKey/><OptionKey/>.
                    </div>
                </div>} className={"text-xs "}>
                    <NextIcon className={!hasNext ? BUTTON_INACTIVE : ICON_BUTTON_CLASS}
                              size={16}
                              onClick={onNext}/>
                </Tooltip>
            </div>

            <div className={`flex items-center gap-1 ${textClasses}`}>
                <img src={"/logo.svg"} alt={"logo"} className={"h-2"}/>
                {filePath}

            </div>


            <div className={"flex items-center gap-4"}>
                <span className={textClasses}> {row}:{col} </span>
                <span className={textClasses}>4 spaces</span>

                <div className={"flex items-center gap-1"}>
                    <div className={`text-sm ${chooseColor(errors, warnings, info)}`}>
                        {errors === 0 ? <GoodIcon/> : <ErrorIcon/>}
                    </div>
                    {!!errors &&
                        <span onClick={onLintClick}
                              className={`${commonClasses} ${errorClasses}`}>{errors} errors</span>}
                    {!!warnings &&
                        <span onClick={onLintClick}
                              className={`${commonClasses} ${warningClasses}`}>{warnings} warnings</span>}
                    {!!info &&
                        <span onClick={onLintClick} className={`${commonClasses} ${infoClasses}`}>{info} hints</span>}
                </div>
            </div>
        </div>
    )
}
