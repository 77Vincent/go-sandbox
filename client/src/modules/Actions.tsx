import {Tooltip} from "flowbite-react";

import {TRANSLATE} from "../lib/i18n.ts";
import {EnterKey, FormatIcon, MetaKey, OptionKey, RunIcon, ShareIcon, ShiftKey} from "./Icons.tsx";
import {useContext} from "react";
import {AppCtx, isUserCode} from "../utils.ts";

import {IconButton} from "./IconButton.tsx";
import {Row} from "./Common.tsx";

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
                <Row className={"gap-1.5"}>
                    {TRANSLATE.run[lan]}
                    <Row> <MetaKey/><EnterKey/> </Row>
                </Row>
            }>
                <IconButton
                    disabled={!executable}
                    icon={<RunIcon size={isMobile ? 18 : 20}/>}
                    onClick={executable ? run : undefined}
                />
            </Tooltip>

            <Tooltip className={COMMON_CLASSES} content={
                <Row className={"gap-1.5"}>
                    {TRANSLATE.format[lan]}
                    <Row>
                        <MetaKey/><OptionKey/>L<span>&#160;</span><span>&#160;</span>or<span>&#160;</span><span>&#160;</span><ShiftKey/><OptionKey/>F
                    </Row>
                </Row>
            }>
                <IconButton
                    disabled={!executable}
                    icon={<FormatIcon size={isMobile ? 18 : 20}/>}
                    onClick={executable ? format : undefined}
                />
            </Tooltip>

            <Tooltip className={COMMON_CLASSES} content={
                <div className={"flex items-center gap-1.5"}>
                    <Row className={"gap-1.5"}>
                        {TRANSLATE.share[lan]}
                        <Row>
                            <MetaKey/>S
                        </Row>
                    </Row>
                </div>
            }>
                <IconButton icon={<ShareIcon size={isMobile ? 17 : 19}/>} onClick={sharable ? share : undefined}/>
            </Tooltip>
        </>
    );
}
