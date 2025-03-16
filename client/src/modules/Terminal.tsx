import {ClickBoard, Wrapper} from "./Common.tsx";
import {mapFontSize} from "../utils.ts";

export default function Component(props: {
    fontSize: number,
    result: string,
    resultError: string,
}) {
    const {fontSize, result, resultError} = props
    return (
        <Wrapper className={`relative flex flex-col py-2 px-2 bg-stone-200 text-${mapFontSize(fontSize)}`}>
            <ClickBoard content={result}/>
            {
                resultError &&
                <div className={"text-orange-600 border-b border-neutral-300 pb-1 mb-1"}> {resultError} </div>
            }
            <div className={"h-full overflow-auto"}>
                <pre>{result}</pre>
            </div>
        </Wrapper>
    )
}
