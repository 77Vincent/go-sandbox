import {ClickBoard, Wrapper} from "./Common.tsx";
import {mapFontSize} from "../utils.ts";

export default function Component(props: {
    fontSize: number,
    result: string,
    resultInfo: string,
    resultError: string,
}) {
    const {fontSize, result, resultInfo, resultError} = props
    const common = "dark:border-neutral-600 border-neutral-300 pb-1 mb-1.5"
    return (
        <Wrapper
            className={`flex flex-col py-2 pb-0 px-2 bg-neutral-200 dark:bg-neutral-800 text-${mapFontSize(fontSize)} leading-4`}>
            <ClickBoard content={result}/>

            {
                (!resultError && !resultInfo && !result) &&
                <div className={"text-neutral-400 dark:text-neutral-600 font-light"}>
                    Press "Run" or type anything to execute automatically
                </div>
            }

            {
                resultError &&
                <pre
                    className={`text-orange-600 border-b ${common}`}>{resultError}</pre>
            }

            {
                resultInfo &&
                <pre
                    className={`text-green-600 border-b leading-5 ${common}`}>{resultInfo}</pre>
            }

            <pre className={"overflow-y-auto"}>{result}</pre>
        </Wrapper>
    )
}
