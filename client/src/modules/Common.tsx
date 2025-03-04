import {ReactNode} from "react";

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
