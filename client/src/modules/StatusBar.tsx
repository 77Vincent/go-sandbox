import {CiFaceFrown as ErrorIcon, CiFaceSmile as GoodIcon} from "react-icons/ci";

const errorClasses = "text-orange-800 dark:text-orange-700";
const goodClasses = "text-cyan-700 dark:text-cyan-500";
const infoClasses = "text-xs text-gray-600 dark:text-gray-400";

export default function Component(props: {
    row: number,
    col: number,
    errors: number,
}) {
    const {row, col, errors} = props

    return (
        <div
            className={"fixed bottom-0 left-0 z-10 flex w-full justify-between border-t border-t-gray-400 bg-gray-200 px-3 py-0.5 font-light dark:border-t-gray-600 dark:bg-gray-900 "}>
            <div className={infoClasses}>
                {row}:{col}
            </div>


            <div className={"flex items-center gap-4"}>
                <span className={infoClasses}>4 spaces</span>

                <div className={`flex items-center gap-1 ${errors === 0 ? goodClasses : errorClasses}`}>
                    {errors === 0 ? <GoodIcon className={"text-sm"}/> : <ErrorIcon className={"text-sm"}/>}
                    <span className={"text-xs"}>{errors} errors</span>
                </div>
            </div>
        </div>
    )
}
