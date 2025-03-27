import {MutableRefObject} from "react";

import {CiFaceFrown as ErrorIcon, CiFaceSmile as GoodIcon} from "react-icons/ci";

const errorClasses = "text-orange-800 dark:text-orange-700";
const goodClasses = "text-cyan-800 dark:text-cyan-500";

export default function Component(props: {
    statusBarRef: MutableRefObject<HTMLDivElement | null>,
    errors: number,
}) {
    const {statusBarRef, errors} = props

    return (

        <div
            className={"flex justify-between gap-2 border-t border-t-gray-400 bg-gray-300 px-3 text-sm text-gray-800 dark:border-t-gray-600 dark:bg-gray-900 dark:text-white"}>
            <div ref={statusBarRef}/>

            <div className={`flex items-center gap-1 font-light ${errors === 0 ? goodClasses : errorClasses}`}>
                {
                    errors === 0 ? <GoodIcon/> : <ErrorIcon/>
                }
                <span className={"text-xs"}>{errors} Errors</span>
            </div>
        </div>
    )
}
