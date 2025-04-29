import {IoClose as CloseIcon} from "react-icons/io5";
import {useThemeMode} from "flowbite-react";
import {DEFAULT_MAIN_FILE_PATH} from "../constants.ts";
import {displayFileUri} from "../utils.ts";

const activeClasses = "border-b-cyan-500 font-semibold border-b-2 dark:text-white"
const inactiveClasses = "text-gray-800 dark:text-gray-300"

function Session(props: {
    value: string
    active: boolean
}) {
    const {value, active} = props
    return (
        <div
            className={`flex h-8 cursor-default items-center gap-1 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 ${active ? activeClasses : inactiveClasses}`}>
            <span className={"max-w-32 truncate text-xs italic"}>{value}</span>
            <CloseIcon className={"cursor-pointer text-sm text-gray-400 hover:opacity-50"}/>
        </div>
    )
}

export function Sessions(props: {
    sessions: SessionI[]
    activeTab: string
}) {
    const {mode} = useThemeMode();
    const {sessions, activeTab} = props

    if (sessions.length === 0) {
        return null
    }

    return (
        <div
            className={`flex items-center border-b border-gray-200 dark:border-gray-700 ${mode === "dark" ? "editor-bg-dark" : ""}`}>
            <Session active={DEFAULT_MAIN_FILE_PATH === activeTab} value={DEFAULT_MAIN_FILE_PATH}/>

            {sessions.map(({id}) => {
                    return <Session active={id === activeTab} value={displayFileUri(id)} key={id}/>
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
