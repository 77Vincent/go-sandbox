import {CiFaceFrown as ErrorIcon, CiFaceSmile as GoodIcon} from "react-icons/ci";

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
    row: number,
    col: number,
    errors: number,
    warnings: number,
    info: number,
    onLintClick: () => void,
    filePath: string
}) {
    const {row, col, errors, warnings, info, onLintClick, filePath} = props

    return (
        <div
            className={"fixed bottom-0 left-0 z-10 flex w-full justify-between border-t border-t-gray-400 bg-gray-200 px-3 py-0.5 dark:border-t-gray-600 dark:bg-gray-900 "}>
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
