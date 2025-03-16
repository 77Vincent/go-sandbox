import {ReactNode} from "react";
import {Clipboard, Toast, Flowbite, CustomFlowbiteTheme} from "flowbite-react";
import {HiExclamation} from "react-icons/hi";

export function Wrapper(props: {
    children: ReactNode,
    className?: string
}) {
    const {children, className} = props
    const classes = `w-full overflow-hidden border border-neutral-300 dark:border-neutral-700 dark:bg-gray-800 dark:text-white ${className}`

    return (
        <div className={classes}>
            {children}
        </div>
    )
}

export function Divider() {
    return <div className={"mx-1 h-4 w-1 border-r border-neutral-300 dark:border-neutral-500"}/>
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
                    className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-blue-700 dark:peer-checked:bg-orange-500"></div>
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
                "base": "absolute end-2 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800",
                "icon": {
                    "defaultIcon": "h-3 w-3",
                    "successIcon": "h-3 w-3 text-blue-700 dark:text-blue-500"
                }
            },
        }
    };

    return (
        content &&
        <Flowbite theme={{theme: customTheme}}>
            <Clipboard.WithIcon
                valueToCopy={content}
                className={"absolute top-4 right-0.5 z-10 opacity-60"}
            />
        </Flowbite>
    )
}
