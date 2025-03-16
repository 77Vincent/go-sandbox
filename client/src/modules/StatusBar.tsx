import {MutableRefObject} from "react";

export default function Component(props: {
    statusBarRef: MutableRefObject<HTMLDivElement | null>
}) {
    const {statusBarRef} = props

    return (

        <div ref={statusBarRef}
             className={"px-3 border-t border-t-gray-400 dark:border-t-gray-600 text-gray-800 bg-gray-300 dark:text-white dark:bg-gray-900"}/>
    )
}
