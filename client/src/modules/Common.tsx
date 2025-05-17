import {ReactNode, useContext} from "react";
import {Clipboard, CustomFlowbiteTheme, Flowbite, Toast, Tooltip} from "flowbite-react";
import {toastType} from "../types";

import {TRANSLATE} from "../lib/i18n.ts";
import {CopyIcon, ErrorIcon, InfoIcon, RefreshIcon} from "./Icons.tsx";
import {AppCtx} from "../utils.ts";

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
    className?: string
}) {
    const {horizontal, className} = props
    if (horizontal) {
        return <div className={`h-0 w-full border-b border-neutral-200 dark:border-gray-600 ${className}`}/>
    }

    return <div className={`h-4 w-0 border-r border-neutral-200 dark:border-gray-600 ${className}`}/>
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
        show &&
        <Toast className={`absolute bottom-6 left-6 z-20 w-auto max-w-xl border border-gray-200 dark:border-gray-600`}>
            <div
                className={`mr-2 inline-flex size-8 shrink-0 items-center justify-center rounded-lg ${color}`}>
                {
                    type === "info" ?
                        <InfoIcon className="size-5"/> :
                        <ErrorIcon className="size-5"/>
                }
            </div>

            <div className={"mr-2 break-all text-sm"}>
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
                    className="peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:size-5 after:rounded-full after:border after:border-neutral-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 dark:border-neutral-600 dark:bg-gray-500 dark:peer-focus:ring-cyan-800 rtl:peer-checked:after:-translate-x-full"></div>
            </div>

            {
                label &&
                <span className="text-xs font-light text-gray-800 dark:text-gray-300">{label}</span>
            }
        </label>
    )
}

export function RefreshButton(props: {
    onClick?: () => void;
}) {
    const {onClick} = props
    const {lan} = useContext(AppCtx)
    const onClockHandler = () => {
        if (onClick) {
            onClick()
        }
        location.reload()
    }
    return (
        <div className={"absolute right-8 top-2 z-10"}>
            <Tooltip className={"text-xs"} content={TRANSLATE.reload[lan]} placement={"left"}>
                <RefreshIcon
                    onClick={onClockHandler}
                    className={"h-3.5 cursor-pointer text-gray-500 opacity-90 hover:text-cyan-500 dark:text-gray-400 dark:hover:text-cyan-400"}/>
            </Tooltip>
        </div>
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
                icon={CopyIcon}
                valueToCopy={content}
                className={"absolute right-1 top-4 z-10"}
            />
        </Flowbite>
    )
}

export function Grid(props: {
    children: ReactNode;
}) {
    return <div className={"grid grid-cols-2 gap-x-10 gap-y-4 max-md:grid-cols-1"}>
        {props.children}
    </div>
}

export function Row(props: {
    key?: string;
    children: ReactNode;
    onClick?: () => void;
    className?: string;
}) {
    const {children, className, onClick, key} = props
    return <div key={key} onClick={onClick} className={`flex items-center justify-between ${className}`}>
        {children}
    </div>
}

export function Typography(props: {
    children: ReactNode;
    className?: string;
    variant?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "body1" | "body2" | "subtitle" | "caption";
}) {
    const {children, variant = "p", className} = props
    let classes = ""
    switch (variant) {
        case "h3":
            classes = "text-2xl font-semibold text-gray-800 dark:text-gray-300"
            break
        case "h4":
            classes = "text-lg font-semibold text-gray-800 dark:text-gray-300"
            break
        case "h5":
            classes = "text-base text-gray-800 dark:text-gray-300"
            break
        case "h6":
            classes = "text-sm font-semibold text-gray-800 dark:text-gray-300"
            break
        case "body1":
            classes = "text-base font-normal text-gray-800 dark:text-gray-300"
            break
        case "body2":
            classes = "text-sm font-normal text-gray-700 dark:text-gray-300"
            break
        case "caption":
            classes = "font-light text-gray-500 dark:text-gray-400"
            break
        default:
            classes = "text-sm font-light text-gray-800 dark:text-gray-300"
            break
    }
    return <div className={`${classes} ${className}`}>
        {children}
    </div>
}
