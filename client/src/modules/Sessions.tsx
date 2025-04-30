import {IoClose as CloseIcon} from "react-icons/io5";
import {useThemeMode} from "flowbite-react";
import {displayFileUri} from "../utils.ts";

const activeClasses = "border-b-cyan-500 font-semibold border-b-2 dark:text-white"
const inactiveClasses = "text-gray-800 dark:text-gray-300"

function Session(props: {
    num: number
    id: string
    active: boolean
    onSessionClose: (id: string) => void
}) {
    const {id, active, num, onSessionClose} = props

    function handleClose(id: string) {
        return () => {
            onSessionClose(id)
        }
    }

    return (
        <div
            className={`flex h-8 cursor-default items-center gap-1 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 ${active ? activeClasses : inactiveClasses}`}>
            <span className={"max-w-32 truncate text-xs italic"}>{displayFileUri(id)}</span>
            {
                num > 0 &&
                <CloseIcon onClick={handleClose(id)}
                           className={"cursor-pointer text-sm text-gray-400 hover:opacity-50"}/>
            }
        </div>
    )
}

export function Sessions(props: {
    sessions: SessionI[]
    activeSession: string
    onSessionClose: (id: string) => void
}) {
    const {mode} = useThemeMode();
    const {sessions, activeSession, onSessionClose} = props

    // omit the default main file
    if (sessions.length === 1) {
        return null
    }

    return (
        <div
            className={`flex items-center border-b border-gray-200 dark:border-gray-700 ${mode === "dark" ? "editor-bg-dark" : ""}`}>
            {sessions.map(({id}, i) => {
                    return <Session num={i} onSessionClose={onSessionClose} active={id === activeSession} id={id}
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
