import {Tooltip} from "flowbite-react";

import {BUTTON_INACTIVE, ICON_BUTTON_CLASS} from "../constants.ts";
import {TRANSLATE} from "../lib/i18n.ts";
import {EnterKey, FormatIcon, MetaKey, OptionKey, RunICon, ShareIcon, ShiftKey} from "./Icons.tsx";
import {useContext} from "react";
import {AppCtx, isUserCode} from "../utils.ts";

const COMMON_CLASSES = "z-20 text-xs font-light";

export default function Component(props: {
    run: () => void;
    format: () => void;
    share: () => void;
    hasCode: boolean;
}) {
    const {run, format, share, hasCode} = props;
    const {lan, file, isMobile, isRunning} = useContext(AppCtx)

    const sharable = hasCode && !isRunning;
    const executable = sharable && isUserCode(file);

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
                <RunICon className={executable ? ICON_BUTTON_CLASS : BUTTON_INACTIVE}
                         onClick={executable ? run : undefined} size={isMobile ? 21 : 22}/>
            </Tooltip>

            <Tooltip className={COMMON_CLASSES} content={
                <div className={"flex items-center gap-1.5"}>
                    {TRANSLATE.format[lan]}
                    <div className={"flex items-center"}>
                        <MetaKey/><OptionKey/>L<span>&#160;</span><span>&#160;</span>or<span>&#160;</span><span>&#160;</span><ShiftKey/><OptionKey/>F
                    </div>
                </div>
            }>
                <FormatIcon className={`mx-1.5 max-md:mx-0.5 ${executable ? ICON_BUTTON_CLASS : BUTTON_INACTIVE}`}
                            onClick={executable ? format : undefined} size={isMobile ? 21 : 22}/>
            </Tooltip>

            <Tooltip className={COMMON_CLASSES} content={
                <div className={"flex items-center gap-1.5"}>
                    {TRANSLATE.share[lan]}
                    <div className={"flex items-center"}>
                        <MetaKey/>S
                    </div>
                </div>
            }>
                <ShareIcon className={sharable ? ICON_BUTTON_CLASS : BUTTON_INACTIVE}
                           onClick={sharable ? share : undefined} size={isMobile ? 20 : 21}/>
            </Tooltip>
        </>
    );
}
