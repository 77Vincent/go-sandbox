import {ICON_BUTTON_CLASS} from "../constants.ts";

import {Tooltip} from "flowbite-react";
import {Divider} from "./Common.tsx";
import {TRANSLATE} from "../lib/i18n.ts";
import {AboutIcon, CtrlKey, ManualIcon, MetaKey, SettingsIcon, TerminalIcon} from "./Icons.tsx";
import {AppCtx} from "../utils.ts";
import {useContext} from "react";
import {IconButton} from "./IconButton.tsx";

export default function Component(props: {
    setShowSettings: (show: boolean) => void;
    setShowAbout: (show: boolean) => void;
    setShowManual: (show: boolean) => void;
}) {
    const {setShowSettings, setShowManual} = props
    const {
        lan, isMobile,
        showTerminal, updateShowTerminal,
    } = useContext(AppCtx)

    return (
        <>
            <Divider/>

            <Tooltip className={"z-20 text-xs"} content={
                <div className={"flex items-center gap-1"}>
                    {TRANSLATE.terminal[lan]}
                    <div className={"flex items-center"}>
                        <MetaKey/><CtrlKey/>L
                    </div>
                </div>
            }>
                <IconButton active={showTerminal} icon={<TerminalIcon size={isMobile ? 17 : 18.5}/>}
                            onClick={() => updateShowTerminal(!showTerminal)}
                />
            </Tooltip>

            <Tooltip className={"z-20 text-xs"} content={
                <div className={"flex items-center gap-1"}>
                    {TRANSLATE.settings[lan]}
                    <div className={"flex items-center"}>
                        <MetaKey/>,
                    </div>
                </div>
            }>
                <IconButton
                    onClick={() => setShowSettings(true)}
                    icon={<SettingsIcon size={isMobile ? 18 : 20}/>}
                />
            </Tooltip>

            <Tooltip className={"z-20 text-xs"} content={
                <div className={"flex items-center gap-1"}>
                    {TRANSLATE.manual[lan]}
                    <div className={"flex items-center"}>
                        F12
                    </div>
                </div>
            }>
                <IconButton
                    icon={<ManualIcon size={isMobile ? 18 : 20}/>}
                    onClick={() => setShowManual(true)}
                />
            </Tooltip>

            <Tooltip className={"text-xs"} content={TRANSLATE.about[lan]}>
                <IconButton icon={<AboutIcon size={isMobile ? 18.5 : 20.5}/>} className={ICON_BUTTON_CLASS}
                            onClick={() => window.open("/about.html", "_blank")}
                />
            </Tooltip>
        </>
    )
}
