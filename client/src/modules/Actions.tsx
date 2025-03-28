import {Tooltip} from "flowbite-react";
import {PiPlay as RunICon} from "react-icons/pi";
import {HiCodeBracket as FormatIcon} from "react-icons/hi2";
import {RiShareBoxLine as ShareIcon} from "react-icons/ri";

import {HOVER_CLASS, TRANSLATE} from "../constants.ts";
import {languages} from "../types";
import {isMac} from "../utils.ts";

const BUTTON_SIZE = 23;
const COLOR_INACTIVE = "text-gray-300 dark:text-gray-600";
const CMD = "Cmd"
const WIN = "win"
const COMMON_CLASSES = "text-xs font-light";

export default function Component(props: {
    debouncedRun: () => void;
    debouncedFormat: () => void;
    debouncedShare: () => void;
    hasCode: boolean;
    isRunning: boolean;
    lan: languages;
}) {
    const {debouncedRun, debouncedFormat, debouncedShare, hasCode, isRunning, lan} = props;
    const metaKey = isMac() ? CMD : WIN;

    return (
        <>
            <Tooltip className={COMMON_CLASSES} content={`${TRANSLATE.run[lan]}: ${metaKey} + enter`}>
                <RunICon className={hasCode && !isRunning ? HOVER_CLASS : COLOR_INACTIVE}
                         onClick={hasCode && !isRunning ? debouncedRun : undefined} size={BUTTON_SIZE}/>
            </Tooltip>

            <Tooltip className={COMMON_CLASSES} content={`${TRANSLATE.format[lan]}: ${metaKey} + b`}>
                <FormatIcon className={`mx-1.5 max-md:mx-0.5 ${hasCode && !isRunning ? HOVER_CLASS : COLOR_INACTIVE}`}
                            onClick={hasCode && !isRunning ? debouncedFormat : undefined} size={BUTTON_SIZE}/>
            </Tooltip>

            <Tooltip className={COMMON_CLASSES} content={`${TRANSLATE.share[lan]}: ${metaKey} + e`}>
                <ShareIcon className={hasCode ? HOVER_CLASS : COLOR_INACTIVE}
                           onClick={hasCode ? debouncedShare : undefined} size={BUTTON_SIZE}/>
            </Tooltip>
        </>
    );
}
