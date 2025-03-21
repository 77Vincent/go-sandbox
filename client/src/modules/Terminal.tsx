import {ClickBoard, Wrapper} from "./Common.tsx";
import {mapFontSize} from "../utils.ts";
import {resultI} from "../types";
import {EVENT_STDERR} from "../constants.ts";

const common = "border-b dark:border-neutral-700 border-neutral-300 pb-1.5 mb-2"
const errorColor = "text-red-700 dark:text-red-500"
const infoColor = "text-green-600 dark:text-green-300"

export default function Component(props: {
    hint: string,
    result: resultI[],
    fontSize: number,
    info: string,
    error: string,
}) {
    const {fontSize, result, info, error, hint} = props

    return (
        <Wrapper
            className={`flex flex-col p-2 pb-0 bg-neutral-200 dark:bg-neutral-800 text-${mapFontSize(fontSize)}`}>
            <ClickBoard content={
                result.map(item => item.content).join("\n")
            }/>

            {
                (!error && !info && !result.length) &&
                <div className={"text-neutral-400 dark:text-neutral-600 font-light"}>
                    {hint}
                </div>
            }

            {error && <pre className={`${errorColor} ${common}`}>{error}</pre>}

            {info && <pre className={`${infoColor} ${common}`}>{info}</pre>}

            {
                result.map((item, index) => {
                    return (
                        <pre key={index} className={item.type === EVENT_STDERR ? errorColor : ""}>
                            {item.content}
                        </pre>
                    )
                })
            }
        </Wrapper>
    )
}
