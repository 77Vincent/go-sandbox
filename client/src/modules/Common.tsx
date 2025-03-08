import {ReactNode} from "react";
import {Toast} from "flowbite-react";
import {HiExclamation} from "react-icons/hi";

export function Wrapper(props: {
    children: ReactNode,
    className?: string
}) {
    const {children, className} = props
    const classes = `shadow-sm w-full rounded overflow-hidden border border-stone-400 dark:border-stone-500 dark:bg-neutral-800 dark:text-white ${className}`

    return (
        <div className={classes}>
            {children}
        </div>
    )
}

export function Divider() {
    return <div className={"mx-1 h-4 w-1 border-r border-gray-300 dark:border-stone-500"}/>
}

export function MyToast(props: {
    children: ReactNode,
    className?: string
    show: boolean,
    setShowToast: (show: string) => void
}) {
    const {show, children, className, setShowToast} = props
    const classes = `absolute z-10 bottom-6 left-6 ${className}`

    return (
        show && <Toast className={classes}>
            <div
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-500 dark:bg-orange-700 dark:text-orange-200 mr-2">
                <HiExclamation className="h-5 w-5"/>
            </div>

            <div className={"text-sm"}>
                {children}
            </div>

            <Toast.Toggle onDismiss={() => setShowToast("")}/>
        </Toast>
    )
}

export function ToggleSwitch(props: {
    label?: string,
    checked: boolean,
    onChange: () => void
}) {
    const {checked, onChange, label} = props

    return (
        <label className="mx-0.5 inline-flex items-center cursor-pointer">
            <div>
                <input checked={checked} onChange={onChange} type="checkbox" value="" className="sr-only peer"/>
                <div
                    className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600 dark:peer-checked:bg-lime-600"></div>
            </div>

            {
                label &&
                <span className="text-xs font-light text-gray-800 dark:text-gray-300">{label}</span>
            }
        </label>
    )
}
