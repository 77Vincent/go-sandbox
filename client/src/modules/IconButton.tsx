import {ReactNode} from "react";

export const ACTIVE_ICON_BUTTON_CLASS = "cursor-pointer text-cyan-500 dark:text-cyan-400"
export const ACTIVE_ICON_BUTTON_CLASS_2 = "cursor-pointer text-gray-400 text-sm hover:opacity-60"
export const ICON_BUTTON_CLASS = "cursor-pointer hover:text-cyan-500 text-gray-600 dark:hover:text-cyan-400 dark:text-gray-300"
export const BUTTON_INACTIVE = "cursor-not-allowed text-gray-300 dark:text-gray-700";

export function IconButton(props: {
    icon: ReactNode
    active?: boolean
    disabled?: boolean
    onClick?: () => void
    className?: string
    variant?: "default" | "secondary"
}) {
    const {icon, disabled, onClick, className, active, variant} = props

    const handleClick = () => {
        if (onClick) {
            onClick()
        }
    }

    let classes = ""

    switch (variant) {
        // used for close icon button, etc.
        case "secondary":
            classes = `${disabled ? BUTTON_INACTIVE : ACTIVE_ICON_BUTTON_CLASS_2} ${className}`
            break
        default:
            classes = `${disabled ? BUTTON_INACTIVE : active ? ACTIVE_ICON_BUTTON_CLASS : ICON_BUTTON_CLASS} ${className}`
    }

    return (
        <div onClick={handleClick} className={classes}>
            {icon}
        </div>
    )
}
