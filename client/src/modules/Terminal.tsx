import {ClickBoard, Wrapper} from "./Common.tsx";
import {AppCtx} from "../utils.ts";
import {resultI} from "../types";
import {EVENT_STDERR} from "../constants.ts";
import {TRANSLATE} from "../lib/i18n.ts";
import {useContext} from "react";

const errorColor = "text-red-700 dark:text-red-500"
const infoColor = "text-green-600 dark:text-green-300"

export default function Component(props: {
    running: boolean,
    result: resultI[],
    info: string,
    error: string,
}) {
    const {result, info, error, running} = props
    const {lan, fontSize} = useContext(AppCtx)

    const textSize = `text-size-${fontSize}`
    return (
        <Wrapper
            className={`flex flex-col overflow-hidden bg-neutral-200 pb-5 dark:bg-neutral-800 ${textSize}`}>
            <ClickBoard content={
                result.map(item => item.content).join("\n")
            }/>

            <div className={"terminal-info flex flex-col justify-center border-b border-neutral-300 p-2 font-light dark:border-neutral-700"}>
                {
                    (!error && !info) &&
                    <div className={`text-neutral-400 dark:text-neutral-500`}>
                        {running ? TRANSLATE.running[lan] : TRANSLATE.hintManual[lan]}
                    </div>
                }
                {error && <pre className={errorColor}>{error}</pre>}

                {info && <pre className={infoColor}>{info}</pre>}
            </div>


            <div className={`flex size-full flex-col overflow-auto px-2 py-1.5`}>
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
