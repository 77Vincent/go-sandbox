import {IoClose as CloseIcon} from "react-icons/io5";
import {useThemeMode} from "flowbite-react";
import {displayFileUri} from "../utils.ts";

const activeClasses = "border-b-cyan-500 font-semibold border-b-2 dark:text-white"
const inactiveClasses = "text-gray-800 dark:text-gray-300"

function Session(props: {
    num: number
    id: string
    active: boolean
    sessions: string[]
    onSessionClose: (index: number, newIndex: number) => void
}) {
    const {id, active, num, sessions, onSessionClose} = props

    function handleClose(id: string, sessions: string[]) {
        return () => {
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

    return (
        <div
            className={`flex h-8 cursor-default items-center gap-1 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 ${active ? activeClasses : inactiveClasses}`}>
            <span className={"max-w-32 truncate text-xs italic"}>{displayFileUri(id)}</span>
            {
                num > 0 &&
                <CloseIcon onClick={handleClose(id, sessions)}
                           className={"cursor-pointer text-sm text-gray-400 hover:opacity-50"}/>
            }
        </div>
    )
}

export function Sessions(props: {
    sessions: SessionI[]
    activeSession: string
    onSessionClose: (index: number, newIndex: number) => void
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
                    return <Session num={i} sessions={sessions.map(v => v.id)} onSessionClose={onSessionClose} active={id === activeSession} id={id}
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
