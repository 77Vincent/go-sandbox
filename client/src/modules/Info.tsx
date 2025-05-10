import {ICON_BUTTON_CLASS} from "../constants.ts";

import {Tooltip} from "flowbite-react";
import {Divider} from "./Common.tsx";
import {TRANSLATE} from "../lib/i18n.ts";
import {AboutIcon, ManualIcon, MetaKey, SettingsIcon} from "./Icons.tsx";
import {AppCtx} from "../utils.ts";
import {useContext} from "react";

const commonClasses = `${ICON_BUTTON_CLASS} max-md:mx-0 max-md:text-lg`

export default function Component(props: {
    isMobile: boolean;
    setShowSettings: (show: boolean) => void;
    setShowAbout: (show: boolean) => void;
    setShowManual: (show: boolean) => void;
}) {
    const {isMobile, setShowSettings, setShowAbout, setShowManual} = props
    const {lan} = useContext(AppCtx)

    return (
        <div className={"flex items-center gap-2.5 max-md:gap-2"}>
            <Divider/>
            <Tooltip className={"z-20 text-xs"} content={
                <div className={"flex items-center gap-1"}>
                    {TRANSLATE.settings[lan]}
                    <div className={"flex items-center"}>
                        <MetaKey/>,
                    </div>
                </div>
            }>
                <SettingsIcon
                    onClick={() => setShowSettings(true)}
                    size={isMobile ? 16 : 17}
                    className={commonClasses}/>
            </Tooltip>

            <Tooltip className={"z-20 text-xs"} content={
                <div className={"flex items-center gap-1"}>
                    {TRANSLATE.manual[lan]}
                    <div className={"flex items-center"}>
                        F12
                    </div>
                </div>
            }>
                <ManualIcon
                    size={isMobile ? 21 : 22}
                    onClick={() => setShowManual(true)}
                    className={`${commonClasses} ml-0.5 max-md:ml-0.5`}/>
            </Tooltip>

            <AboutIcon
                size={isMobile ? 21 : 23}
                onClick={() => setShowAbout(true)}
                className={commonClasses}/>
        </div>
    )
}
