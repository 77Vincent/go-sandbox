import {Tooltip} from "flowbite-react";
import {PiPlay as RunICon} from "react-icons/pi";
import {HiCodeBracket as FormatIcon} from "react-icons/hi2";
import {RiShareBoxLine as ShareIcon} from "react-icons/ri";
import {HOVER_CLASS, TRANSLATE} from "../constants.ts";
import {languages} from "../types";

const COLOR_INACTIVE = "text-gray-300 dark:text-gray-600";

export default function Component(props: {
    debouncedRun: () => void;
    debouncedFormat: () => void;
    debouncedShare: () => void;
    hasCode: boolean;
    isRunning: boolean;
    lan: languages;
}) {
    const {debouncedRun, debouncedFormat, debouncedShare, hasCode, isRunning, lan} = props;

    return (
        <>
            <Tooltip content={`${TRANSLATE.run[lan]}: cmd/win + enter`}>
                <RunICon className={hasCode && !isRunning ? HOVER_CLASS : COLOR_INACTIVE}
                         onClick={hasCode && !isRunning ? debouncedRun : undefined} size={24}/>
            </Tooltip>

            <Tooltip content={`${TRANSLATE.format[lan]}: cmd/win + b`}>
                <FormatIcon className={`mx-1.5 max-md:mx-0.5 ${hasCode && !isRunning ? HOVER_CLASS : COLOR_INACTIVE}`}
                            onClick={hasCode && !isRunning ? debouncedFormat : undefined} size={24}/>
            </Tooltip>

            <Tooltip content={`${TRANSLATE.share[lan]}: cmd/win + e`}>
                <ShareIcon className={hasCode ? HOVER_CLASS : COLOR_INACTIVE}
                           onClick={hasCode ? debouncedShare : undefined} size={24}/>
            </Tooltip>
        </>
    );
}
