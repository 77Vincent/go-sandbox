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
    const classes = `relative h-full w-full overflow-hidden dark:bg-gray-800 dark:text-white ${className}`

    return (
        <div className={classes}>
            {children}
        </div>
    )
}

export function Divider() {
    return <div className={"mx-1 h-4 w-1 border-r border-neutral-300 dark:border-neutral-500"}/>
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
        show && <Toast className={`absolute z-10 bottom-6 left-6 w-auto max-w-xl`}>
            <div
                className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mr-2 ${color}`}>
                {
                    type === "info" ?
                        <InfoIcon className="h-5 w-5"/> :
                        <ErrorIcon className="h-5 w-5"/>
                }
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
                    className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 dark:peer-focus:ring-cyan-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-cyan-500"></div>
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
                className={"absolute top-4 right-0.5 z-10 opacity-50"}
            />
        </Flowbite>
    )
}
