import {isMac} from "../utils.ts";
import {MdKeyboardCommandKey, MdKeyboardControlKey} from "react-icons/md";

export {VscSettingsGear as SettingsIcon} from "react-icons/vsc";
export {
    HiOutlineInformationCircle as AboutIcon,
    HiOutlineQuestionMarkCircle as ManualIcon,
    HiExclamation as ErrorIcon,
    HiInformationCircle as InfoIcon,
    HiRefresh as RefreshIcon,
} from "react-icons/hi";
export {
    BiCut as CutIcon,
    BiSearch as SearchIcon,
} from "react-icons/bi";
export {RiShareBoxLine as ShareIcon} from "react-icons/ri";
export {HiMiniCodeBracket as FormatIcon} from "react-icons/hi2";
export {FiPlay as RunICon} from "react-icons/fi";
export {
    MdOutlineContentPaste as PasteIcon,
    MdContentCopy as CopyIcon,
    MdKeyboardControlKey as CtrlKey,
    MdKeyboardOptionKey as OptionKey,
    MdKeyboardReturn as EnterKey,
} from "react-icons/md";
export {BsShift as ShiftKey} from "react-icons/bs";

export function MetaKey() {
    return isMac() ? <MdKeyboardCommandKey/> : <MdKeyboardControlKey/>;
}
