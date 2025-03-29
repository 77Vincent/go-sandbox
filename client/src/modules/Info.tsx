import {VscSettingsGear as SettingsIcon} from "react-icons/vsc";
import {ICON_BUTTON_CLASS} from "../constants.ts";
import {HiOutlineInformationCircle as AboutIcon} from "react-icons/hi";

const commonClasses = `${ICON_BUTTON_CLASS} max-md:mx-0 max-md:text-lg`

export default function Component(props: {
    isMobile: boolean;
    setShowSettings: (show: boolean) => void;
    setShowAbout: (show: boolean) => void;
}) {
    const {isMobile, setShowSettings, setShowAbout} = props

    return (
        <div className={"ml-3 flex items-center gap-3"}>
            <SettingsIcon
                onClick={() => setShowSettings(true)}
                size={isMobile ? 17 : 19}
                className={commonClasses}/>
            <AboutIcon
                size={isMobile ? 22 : 24}
                onClick={() => setShowAbout(true)}
                className={commonClasses}/>
        </div>
    )
}
