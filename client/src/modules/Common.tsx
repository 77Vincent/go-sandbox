import {ReactNode} from "react";
import {Toast} from "flowbite-react";
import {HiExclamation} from "react-icons/hi";

export function Wrapper(props: {
    children: ReactNode,
    className?: string
}) {
    const {children, className} = props
    const classes = `w-full rounded overflow-hidden border border-stone-400 dark:border-stone-500 dark:bg-neutral-800 dark:text-white ${className}`

    return (
        <div className={classes}>
            {children}
        </div>
    )
}

export function Divider() {
    return <div className={"h-4 w-1 border-r border-gray-300 dark:border-stone-500"}/>
}

export function MyToast(props: {
    children: ReactNode,
    className?: string
}) {
    const {children, className} = props
    const classes = `absolute z-10 bottom-6 left-6 ${className}`

    return (
        children &&
        <Toast className={classes}>
            <div
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-500 dark:bg-orange-700 dark:text-orange-200 mr-2">
                <HiExclamation className="h-5 w-5"/>
            </div>

            <div className={"text-sm"}>
                {children}
            </div>

            <Toast.Toggle/>
        </Toast>
    )
}
