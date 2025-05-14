import {ReactNode} from "react";
import {
    ACTIVE_ICON_BUTTON_CLASS,
    ACTIVE_ICON_BUTTON_CLASS_2,
    BUTTON_INACTIVE,
    ICON_BUTTON_CLASS
} from "../constants.ts";

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
