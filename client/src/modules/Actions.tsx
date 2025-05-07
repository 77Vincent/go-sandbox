import {Tooltip} from "flowbite-react";

import {BUTTON_INACTIVE, ICON_BUTTON_CLASS} from "../constants.ts";
import {languages} from "../types";
import {OptionKey, EnterKey, FormatIcon, MetaKey, RunICon, ShiftKey} from "./Common.tsx";
import {TRANSLATE} from "../lib/i18n.ts";
import {ShareIcon} from "./Icons.tsx";

const COMMON_CLASSES = "z-20 text-xs font-light";

export default function Component(props: {
    isMobile: boolean;
    run: () => void;
    format: () => void;
    share: () => void;
    hasCode: boolean;
    isRunning: boolean;
    lan: languages;
}) {
    const {isMobile, run, format, share, hasCode, isRunning, lan} = props;
    const isEnabled = hasCode && !isRunning;

    return (
        <>
            <Tooltip className={COMMON_CLASSES} content={
                <div className={"flex items-center gap-1.5"}>
                    {TRANSLATE.run[lan]}
                    <div className={"flex items-center"}>
                        <MetaKey/><EnterKey/>
                    </div>
                </div>
            }>
                <RunICon className={isEnabled ? ICON_BUTTON_CLASS : BUTTON_INACTIVE}
                         onClick={isEnabled ? run : undefined} size={isMobile ? 21 : 22}/>
            </Tooltip>

            <Tooltip className={COMMON_CLASSES} content={
                <div className={"flex items-center gap-1.5"}>
                    {TRANSLATE.format[lan]}
                    <div className={"flex items-center"}>
                        <MetaKey/><OptionKey/>L<span>&#160;</span><span>&#160;</span>or<span>&#160;</span><span>&#160;</span><ShiftKey/><OptionKey/>F
                    </div>
                </div>
            }>
                <FormatIcon className={`mx-1.5 max-md:mx-0.5 ${isEnabled ? ICON_BUTTON_CLASS : BUTTON_INACTIVE}`}
                            onClick={isEnabled ? format : undefined} size={isMobile ? 21 : 22}/>
            </Tooltip>

            <Tooltip className={COMMON_CLASSES} content={
                <div className={"flex items-center gap-1.5"}>
                    {TRANSLATE.share[lan]}
                    <div className={"flex items-center"}>
                        <MetaKey/>S
                    </div>
                </div>
            }>
                <ShareIcon className={isEnabled ? ICON_BUTTON_CLASS : BUTTON_INACTIVE}
                           onClick={isEnabled ? share : undefined} size={isMobile ? 20 : 21}/>
            </Tooltip>
        </>
    );
}
