import {VscSettingsGear as SettingsIcon} from "react-icons/vsc";
import {ICON_BUTTON_CLASS, TRANSLATE} from "../constants.ts";
import {IoIosHelpCircleOutline as ManualIcon, IoIosInformationCircleOutline as AboutIcon} from "react-icons/io";

import {Tooltip} from "flowbite-react";
import {languages} from "../types";
import {Divider, MetaKey} from "./Common.tsx";

const commonClasses = `${ICON_BUTTON_CLASS} max-md:mx-0 max-md:text-lg`

export default function Component(props: {
    lan: languages;
    isMobile: boolean;
    setShowSettings: (show: boolean) => void;
    setShowAbout: (show: boolean) => void;
    setShowManual: (show: boolean) => void;
}) {
    const {lan, isMobile, setShowSettings, setShowAbout, setShowManual} = props

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
                    size={isMobile ? 18 : 19}
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
                    size={isMobile ? 24 : 25}
                    onClick={() => setShowManual(true)}
                    className={`${commonClasses} ml-0.5 max-md:ml-0.5`}/>
            </Tooltip>

            <AboutIcon
                size={isMobile ? 23 : 25}
                onClick={() => setShowAbout(true)}
                className={commonClasses}/>
        </div>
    )
}
