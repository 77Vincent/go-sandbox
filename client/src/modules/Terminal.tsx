import {ClickBoard, Wrapper} from "./Common.tsx";
import {mapFontSize} from "../utils.ts";

const common = "dark:border-neutral-600 border-neutral-300 pb-1 mb-1.5"
const errorColor = "text-red-700 dark:text-red-500"
const infoColor = "text-green-600 dark:text-green-300"

export default function Component(props: {
    stdout: string,
    stderr: string,
    fontSize: number,
    info: string,
    error: string,
}) {
    const {fontSize, stdout, stderr, info, error} = props

    return (
        <Wrapper
            className={`flex flex-col py-2 pb-0 px-2 bg-neutral-200 dark:bg-neutral-800 text-${mapFontSize(fontSize)}`}>
            <ClickBoard content={stdout}/>

            {
                (!error && !info && !stdout && !stderr) &&
                <div className={"text-neutral-400 dark:text-neutral-600 font-light"}>
                    Press "Run" or type anything to execute automatically
                </div>
            }

            {error && <pre className={`${errorColor} ${common}`}>{error}</pre>}

            {info && <pre className={`${infoColor} ${common}`}>{info}</pre>}

            {stdout && <pre className={"overflow-y-auto"}>{stdout}</pre>}

            {stderr && <pre className={`overflow-y-auto ${errorColor}`}>{stderr}</pre>}
        </Wrapper>
    )
}
