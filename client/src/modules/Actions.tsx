import {Tooltip} from "flowbite-react";
import {PiPlay as RunICon} from "react-icons/pi";
import {HiCodeBracket as FormatIcon} from "react-icons/hi2";
import {RiShareBoxLine as ShareIcon} from "react-icons/ri";
import {HOVER_CLASS, TRANSLATE} from "../constants.ts";
import {languages} from "../types";

const COLOR_INACTIVE = "text-gray-300";

export default function Component(props: {
    debouncedRun: () => void;
    debouncedFormat: () => void;
    debouncedShare: () => void;
    hasCode: boolean;
    isRunning: boolean;
    lan: languages;
}) {
    const {debouncedRun, debouncedFormat, debouncedShare, hasCode, isRunning, lan} = props;
    const common = `mx-0.5 ${HOVER_CLASS}`;

    return (
        <>
            <Tooltip content={`${TRANSLATE.run[lan]}: cmd/win + enter`}>
                <RunICon className={`${common} ${hasCode && !isRunning ? "" : COLOR_INACTIVE}`}
                         onClick={hasCode && !isRunning ? debouncedRun : undefined} size={24}/>
            </Tooltip>

            <Tooltip content={`${TRANSLATE.format[lan]}: cmd/win + b`}>
                <FormatIcon className={`${common} ${hasCode && !isRunning ? "" : COLOR_INACTIVE}`}
                            onClick={hasCode && !isRunning ? debouncedFormat : undefined} size={24}/>
            </Tooltip>

            <Tooltip content={`${TRANSLATE.share[lan]}: cmd/win + e`}>
                <ShareIcon className={`${common} ${hasCode ? "" : COLOR_INACTIVE}`}
                           onClick={hasCode ? debouncedShare : undefined} size={24}/>
            </Tooltip>
        </>
    );
}
