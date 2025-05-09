import {ClickBoard, Wrapper} from "./Common.tsx";
import {AppCtx, mapFontSize} from "../utils.ts";
import {resultI} from "../types";
import {EVENT_STDERR} from "../constants.ts";
import {TRANSLATE} from "../lib/i18n.ts";
import {useContext} from "react";

const common = "border-b dark:border-neutral-700 border-neutral-300 pb-1.5 mb-1"
const errorColor = "text-red-700 dark:text-red-500"
const infoColor = "text-green-600 dark:text-green-300"

export default function Component(props: {
    running: boolean,
    result: resultI[],
    fontSize: number,
    info: string,
    error: string,
}) {
    const {fontSize, result, info, error, running} = props
    const {lan} = useContext(AppCtx)

    const textSize = `text-${mapFontSize(fontSize)}`
    return (
        <Wrapper
            className={`flex flex-col overflow-hidden bg-neutral-200 p-1.5 pb-5 dark:bg-neutral-800 ${textSize}`}>
            <ClickBoard content={
                result.map(item => item.content).join("\n")
            }/>

            {
                (!error && !info) &&
                <div className={`${common} font-light text-neutral-400 dark:text-neutral-500`}>
                    {running ? TRANSLATE.running[lan] : TRANSLATE.hintManual[lan]}
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
