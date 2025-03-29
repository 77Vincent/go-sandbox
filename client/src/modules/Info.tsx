import {VscSettingsGear as SettingsIcon} from "react-icons/vsc";
import {ICON_BUTTON_CLASS, TRANSLATE} from "../constants.ts";
import {HiOutlineInformationCircle as AboutIcon} from "react-icons/hi";
import {Tooltip} from "flowbite-react";
import {languages} from "../types";
import {MetaKey} from "./Common.tsx";

const commonClasses = `${ICON_BUTTON_CLASS} max-md:mx-0 max-md:text-lg`

export default function Component(props: {
    lan: languages;
    isMobile: boolean;
    setShowSettings: (show: boolean) => void;
    setShowAbout: (show: boolean) => void;
}) {
    const {lan, isMobile, setShowSettings, setShowAbout} = props

    return (
        <div className={"ml-3 flex items-center gap-3"}>
            <Tooltip content={
                <div className={"flex items-center gap-1"}>
                    {TRANSLATE.settings[lan]}
                    <div className={"flex items-center"}>
                        {MetaKey},
                    </div>
                </div>
            }>
                <SettingsIcon
                    onClick={() => setShowSettings(true)}
                    size={isMobile ? 17 : 19}
                    className={commonClasses}/>
            </Tooltip>
            <AboutIcon
                size={isMobile ? 22 : 24}
                onClick={() => setShowAbout(true)}
                className={commonClasses}/>
        </div>
    )
}
