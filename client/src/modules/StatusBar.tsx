import {displayFileUri} from "../utils.ts";
import {BadIcon, GoodIcon} from "./Icons.tsx";
import {Row, Typography} from "./Common.tsx";

const errorClasses = "text-orange-800 dark:text-orange-700";
const infoClasses = "text-cyan-700 dark:text-cyan-500";
const warningClasses = "text-cyan-700 dark:text-cyan-500";
const textClasses = "text-xs font-light text-gray-800 dark:text-gray-400";
const commonClasses = `${textClasses} cursor-pointer hover:opacity-70`;

function chooseColor(errors: number, warnings: number, info: number) {
    if (errors > 0) return errorClasses;
    if (warnings > 0) return warningClasses;
    if (info > 0) return infoClasses;
    return infoClasses;
}

export default function Component(props: {
    row: number, col: number,
    errors: number, warnings: number, info: number,
    onLintClick: () => void,
    file: string
}) {
    const {
        row, col,
        errors, warnings, info,
        onLintClick,
        file,
    } = props

    return (
        <div
            className={"fixed bottom-0 left-0 z-20 flex w-full justify-between border-t border-t-gray-400 bg-gray-200 px-3 py-0.5 dark:border-t-gray-600 dark:bg-gray-900 "}>
                <Row className={"gap-1"}>
                    <img src={"/logo.svg"} alt={"logo"} className={"h-2"}/>
                    <Typography variant={"caption"} className={"text-xs italic tracking-wide"}> {displayFileUri(file)} </Typography>
                </Row>


            <div className={"flex items-center gap-5"}>
                <span className={textClasses}> {row}:{col} </span>
                <span className={textClasses}>4 spaces</span>

                <div className={"flex items-center gap-1"}>
                    <div className={`text-sm ${chooseColor(errors, warnings, info)}`}>
                        {errors === 0 ? <GoodIcon/> : <BadIcon/>}
                    </div>
                    {!!errors &&
                        <span onClick={onLintClick}
                              className={`${commonClasses} ${errorClasses}`}>{errors} errors</span>}
                    {!!warnings &&
                        <span onClick={onLintClick}
                              className={`${commonClasses} ${warningClasses}`}>{warnings} warnings</span>}
                    {!!info &&
                        <span onClick={onLintClick} className={`${commonClasses} ${infoClasses}`}>{info} hints</span>}
                </div>
            </div>
        </div>
    )
}
