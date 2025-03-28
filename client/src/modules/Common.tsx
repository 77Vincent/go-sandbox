import {ReactNode} from "react";
import {Clipboard, Toast, Flowbite, CustomFlowbiteTheme} from "flowbite-react";
import {
    HiExclamation as ErrorIcon,
    HiInformationCircle as InfoIcon,
} from "react-icons/hi";
import {toastType} from "../types";

export function Wrapper(props: {
    children: ReactNode,
    className?: string
}) {
    const {children, className} = props
    const classes = `relative h-full w-full dark:bg-gray-800 dark:text-white ${className}`

    return (
        <div className={classes}>
            {children}
        </div>
    )
}

export function Divider(props: {
    horizontal?: boolean
}) {
    const {horizontal} = props
    if (horizontal) {
        return <div className={"h-0 w-full border-b border-neutral-200 dark:border-neutral-500"}/>
    }

    return <div className={"h-4 w-0 border-r border-neutral-200 dark:border-neutral-500"}/>
}

const defaultToastType = "info"

export function MyToast(props: {
    children: ReactNode,
    show: boolean,
    type?: toastType,
    setShowToast: (show: string) => void
}) {
    const {type = defaultToastType, show, children, setShowToast} = props
    const color = type === "info"
        ? "bg-cyan-100 text-cyan-500 dark:bg-cyan-700 dark:text-cyan-200"
        : "bg-orange-100 text-orange-500 dark:bg-orange-700 dark:text-orange-200"

    return (
        show && <Toast className={`absolute bottom-6 left-6 z-10 w-auto max-w-xl`}>
            <div
                className={`mr-2 inline-flex size-8 shrink-0 items-center justify-center rounded-lg ${color}`}>
                {
                    type === "info" ?
                        <InfoIcon className="size-5"/> :
                        <ErrorIcon className="size-5"/>
                }
            </div>

            <div className={"mr-2 text-sm"}>
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
        <label className="mx-0.5 inline-flex cursor-pointer items-center">
            <div>
                <input checked={checked} onChange={onChange} type="checkbox" value="" className="peer sr-only"/>
                <div
                    className="peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:size-5 after:rounded-full after:border after:border-neutral-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 dark:border-neutral-600 dark:bg-gray-700 dark:peer-focus:ring-cyan-800 rtl:peer-checked:after:-translate-x-full"></div>
            </div>

            {
                label &&
                <span className="text-xs font-light text-gray-800 dark:text-gray-300">{label}</span>
            }
        </label>
    )
}

export function ClickBoard(props: {
    content: string
}) {
    const {content} = props
    const customTheme: CustomFlowbiteTheme = {
        clipboard: {
            "withIcon": {
                "icon": {
                    "defaultIcon": "h-3 w-3",
                    "successIcon": "h-3 w-3 text-cyan-700 dark:text-cyan-500"
                }
            },
        }
    };

    return (
        content &&
        <Flowbite theme={{theme: customTheme}}>
            <Clipboard.WithIcon
                valueToCopy={content}
                className={"absolute right-0.5 top-4 z-10 opacity-50"}
            />
        </Flowbite>
    )
}
