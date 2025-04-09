import {Tooltip} from "flowbite-react";
import {FiPlay as RunICon} from "react-icons/fi";
import {HiMiniCodeBracket as FormatIcon} from "react-icons/hi2";
import {RiShareBoxLine as ShareIcon} from "react-icons/ri";
import {MdKeyboardOptionKey} from "react-icons/md";

import {BUTTON_INACTIVE, ICON_BUTTON_CLASS, TRANSLATE} from "../constants.ts";
import {languages} from "../types";
import {MetaKey} from "./Common.tsx";

const COMMON_CLASSES = "text-xs font-light";

export default function Component(props: {
    isMobile: boolean;
    debouncedRun: () => void;
    debouncedFormat: () => void;
    debouncedShare: () => void;
    hasCode: boolean;
    isRunning: boolean;
    lan: languages;
}) {
    const {isMobile, debouncedRun, debouncedFormat, debouncedShare, hasCode, isRunning, lan} = props;
    const isEnabled = hasCode && !isRunning;

    return (
        <>
            <Tooltip className={COMMON_CLASSES} content={
                <div className={"flex items-center gap-1.5"}>
                    {TRANSLATE.run[lan]}
                    <div className={"flex items-center"}>
                        <MetaKey/>r
                    </div>
                </div>
            }>
                <RunICon className={isEnabled ? ICON_BUTTON_CLASS : BUTTON_INACTIVE}
                         onClick={isEnabled ? debouncedRun : undefined} size={isMobile ? 21 : 23}/>
            </Tooltip>

            <Tooltip className={COMMON_CLASSES} content={
                <div className={"flex items-center gap-1.5"}>
                    {TRANSLATE.format[lan]}
                    <div className={"flex items-center"}>
                        <MetaKey/><MdKeyboardOptionKey/>l
                    </div>
                </div>
            }>
                <FormatIcon className={`mx-1.5 max-md:mx-0.5 ${isEnabled ? ICON_BUTTON_CLASS : BUTTON_INACTIVE}`}
                            onClick={isEnabled ? debouncedFormat : undefined} size={isMobile ? 21 : 23}/>
            </Tooltip>

            <Tooltip className={COMMON_CLASSES} content={
                <div className={"flex items-center gap-1.5"}>
                    {TRANSLATE.share[lan]}
                    <div className={"flex items-center"}>
                        <MetaKey/>s
                    </div>
                </div>
            }>
                <ShareIcon className={isEnabled ? ICON_BUTTON_CLASS : BUTTON_INACTIVE}
                           onClick={isEnabled ? debouncedShare : undefined} size={isMobile ? 20 : 22}/>
            </Tooltip>
        </>
    );
}
