import {displayFileUri} from "../utils.ts";
import {BadIcon, GoodIcon, MetaKey, NextIcon, OptionKey, PrevIcon} from "./Icons.tsx";
import {IconButton, Row, Typography} from "./Common.tsx";
import {SessionI} from "./Sessions.tsx";
import {useEffect, useState} from "react";
import {Tooltip} from "flowbite-react";
import {TRANSLATE} from "../lib/i18n.ts";
import {languages} from "../types";

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
    lan: languages,
    row: number, col: number,
    errors: number, warnings: number, info: number,
    onLintClick: () => void,
    file: string
    sessions: SessionI[]
    prevSession: () => void
    nextSession: () => void
}) {
    const {
        lan,
        row, col,
        errors, warnings, info,
        onLintClick,
        file, sessions,
        prevSession,
        nextSession,
    } = props

    const [disablePrev, setDisablePrev] = useState(false)
    const [disableNext, setDisableNext] = useState(false)

    useEffect(() => {
        const index = sessions.findIndex((s) => s.id === file)
        setDisablePrev(index === 0 || sessions.length < 2)
        setDisableNext(index === sessions.length - 1 || sessions.length < 2)
    }, [file, sessions])

    return (
        <div
            className={"fixed bottom-0 left-0 z-20 flex w-full justify-between border-t border-t-gray-400 bg-gray-200 px-3 py-0.5 dark:border-t-gray-600 dark:bg-gray-900 "}>
            <Row className={"gap-3"}>
                <Row className={"gap-2.5"}>
                    <Tooltip className={"text-xs"} content={
                        <Row className={"gap-1.5"}>
                            {TRANSLATE.prevFile[lan]}
                            <Row> <MetaKey/><OptionKey/>[ </Row>
                        </Row>
                    } placement={"top"}>
                        <IconButton onClick={prevSession} disabled={disablePrev} icon={<PrevIcon size={11}/>}/>
                    </Tooltip>
                    <Tooltip className={"text-xs"} content={
                        <Row className={"gap-1.5"}>
                            {TRANSLATE.nextFile[lan]}
                            <Row> <MetaKey/><OptionKey/>] </Row>
                        </Row>
                    } placement={"top"}>
                        <IconButton onClick={nextSession} disabled={disableNext} icon={<NextIcon size={11}/>}/>
                    </Tooltip>
                </Row>

                <Row className={"gap-1"}>
                    <Typography variant={"caption"}
                                className={"text-xs italic tracking-wide"}> {displayFileUri(file)} </Typography>
                </Row>
            </Row>


            <div className={"flex items-center gap-5"}>
                <img src={"/logo.svg"} alt={"logo"} className={"h-2"}/>
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
