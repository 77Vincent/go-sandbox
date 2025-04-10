import {CiFaceFrown as ErrorIcon, CiFaceSmile as GoodIcon} from "react-icons/ci";

const errorClasses = "text-orange-800 dark:text-orange-700";
const goodClasses = "text-cyan-700 dark:text-cyan-500";
const warningClasses = "text-yellow-800 dark:text-yellow-700";
const textClasses = "text-xs text-gray-700 dark:text-gray-300";

export default function Component(props: {
    row: number,
    col: number,
    errors: number,
    warnings: number,
    info: number
}) {
    const {row, col, errors, warnings, info} = props

    return (
        <div
            className={"fixed bottom-0 left-0 z-10 flex w-full justify-between border-t border-t-gray-400 bg-gray-200 px-3 py-0.5 dark:border-t-gray-600 dark:bg-gray-900 "}>
            <div className={textClasses}>
                {row}:{col}
            </div>


            <div className={"flex items-center gap-4"}>
                <span className={textClasses}>4 spaces</span>

                <div className={"flex items-center gap-1"}>
                    <div className={`${errors === 0 ? goodClasses : errorClasses}`}>
                        {errors === 0 ? <GoodIcon className={"text-sm"}/> : <ErrorIcon className={"text-sm"}/>}
                    </div>
                    {!!errors && <span className={`text-xs ${errorClasses}`}>{errors} errors</span>}
                    {!!warnings && <span className={`text-xs ${warningClasses}`}>{warnings} warnings</span>}
                    {!!info && <span className={`text-xs ${goodClasses}`}>{info} hints</span>}
                </div>
            </div>
        </div>
    )
}
