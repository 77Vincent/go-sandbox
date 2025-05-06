import {ClickBoard, Wrapper} from "./Common.tsx";
import {mapFontSize} from "../utils.ts";
import {languages, resultI} from "../types";
import {EVENT_STDERR} from "../constants.ts";
import {TRANSLATE} from "../lib/i18n.ts";

const common = "border-b dark:border-neutral-700 border-neutral-300 pb-1.5 mb-1"
const errorColor = "text-red-700 dark:text-red-500"
const infoColor = "text-green-600 dark:text-green-300"

export default function Component(props: {
    lan: languages,
    hint: string,
    running: boolean,
    result: resultI[],
    fontSize: number,
    info: string,
    error: string,
}) {
    const {fontSize, result, info, error, running, hint, lan} = props

    return (
        <Wrapper
            className={`overflow-hidden flex flex-col p-1.5 pb-5 bg-neutral-200 dark:bg-neutral-800 text-${mapFontSize(fontSize)}`}>
            <ClickBoard content={
                result.map(item => item.content).join("\n")
            }/>

            {
                (!error && !info) &&
                <div className={`${common} font-light text-neutral-400 dark:text-neutral-500`}>
                    {running ? TRANSLATE.running[lan] : hint}
                </div>
            }

            {error && <pre className={`${errorColor} ${common}`}>{error}</pre>}

            {info && <pre className={`${infoColor} ${common}`}>{info}</pre>}

            <div className={`flex size-full flex-col overflow-auto`}>
                {
                    result.map((item, index) => {
                        return (
                            <pre key={index}
                                 className={item.type === EVENT_STDERR ? errorColor : ""}>
                                {item.content}
                            </pre>
                        )
                    })
                }
            </div>
        </Wrapper>
    )
}
