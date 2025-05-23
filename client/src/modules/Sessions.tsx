import {useThemeMode} from "flowbite-react";
import {displayFileUri} from "../utils.ts";
import {MouseEventHandler} from "react";
import {CloseIcon} from "./Icons.tsx";
import {ACTIVE_ICON_BUTTON_CLASS_2} from "./IconButton.tsx";

const activeClasses = "border-b-cyan-500 border-b-2 bg-white dark:bg-neutral-800 dark:text-white"
const inactiveClasses = "opacity-70"

function Session(props: {
    num: number
    id: string
    active: boolean
    sessions: string[]
    onSessionClose: (index: number, newIndex: number) => void
    onSessionClick: (index: number) => void
}) {
    const {id, active, num, sessions, onSessionClose, onSessionClick} = props

    function handleClose(id: string, sessions: string[]): MouseEventHandler<SVGElement> {
        return (e) => {
            e.stopPropagation()

            const index = sessions.findIndex((v) => v === id)
            let newIndex = null
            // if session no found, this should not happen
            if (index === -1) {
                throw new Error(`session ${id} not found`)
            }

            if (index < sessions.length - 1) {
                // if not the last session, use the next one
                newIndex = index + 1
            } else {
                // use the previous one
                newIndex = index - 1
            }

            onSessionClose(index, newIndex)
        }
    }

    function handleClick(id: string): MouseEventHandler<HTMLDivElement> {
        return () => {
            const index = sessions.findIndex((v) => v === id)
            // if session no found, this should not happen
            if (index === -1) {
                throw new Error(`session ${id} not found`)
            }
            onSessionClick(index)
        }
    }

    return (
        <div
            onClick={handleClick(id)}
            className={`flex h-8 cursor-default items-center gap-1.5 border-r border-r-gray-200 px-2 py-1.5 hover:bg-gray-200 dark:border-r-gray-800 dark:hover:bg-gray-700 ${active
                ? activeClasses
                : inactiveClasses}`}
        >
            <span className={"max-w-32 truncate text-xs italic tracking-wide"}>{displayFileUri(id)}</span>
            {
                num > 0 &&
                <CloseIcon size={14} onClick={handleClose(id, sessions)}
                           className={ACTIVE_ICON_BUTTON_CLASS_2}/>
            }
        </div>
    )
}

export function Sessions(props: {
    sessions: SessionI[]
    activeSession: string
    onSessionClose: (index: number, newIndex: number) => void
    onSessionClick: (index: number) => void
}) {
    const {mode} = useThemeMode();
    const {sessions, activeSession, onSessionClose, onSessionClick} = props

    return (
        <div
            className={`hide-scrollbar relative z-10 flex items-center overflow-x-auto border-b border-gray-300 bg-gray-100 shadow dark:border-gray-700 ${mode === "dark" ? "editor-bg-dark" : ""}`}>
            {sessions.map(({id}, i) => {
                    return <Session num={i}
                                    sessions={sessions.map(v => v.id)}
                                    onSessionClose={onSessionClose}
                                    onSessionClick={onSessionClick}
                                    active={id === activeSession}
                                    id={id}
                                    key={id}/>
                }
            )}
        </div>
    )

}

export interface SessionI {
    id: string
    cursor: number
    data?: string
}
