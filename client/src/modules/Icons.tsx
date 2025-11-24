import {isMac} from "../utils.ts";
import {MdKeyboardCommandKey, MdKeyboardControlKey} from "react-icons/md";

import {
    RxLockOpen2 as UnlockIcon,
    RxLockClosed as LockIcon,
} from "react-icons/rx";
import {Tooltip} from "flowbite-react";

export function PrivateIcon() {
    return <Tooltip className={"text-xs"} content={"Private"}>
        <LockIcon size={12} className="text-gray-500 dark:text-gray-300"/>
    </Tooltip>
}

export function PublicIcon() {
    return <Tooltip className={"text-xs"} content={"Public"}>
        <UnlockIcon size={12} className="text-green-600 dark:text-green-300"/>
    </Tooltip>
}

export {
    IoMdRemoveCircleOutline as RemoveIcon,
    IoMdInformationCircle as AboutIcon,
    IoLogoGithub as GitHubIcon,
} from "react-icons/io";

export {BsDiagram3Fill as OutlineIcon} from "react-icons/bs";

export {GoUnfold as UnfoldAllIcon, GoFold as FoldAllIcon} from "react-icons/go";

export {GrPrevious as PrevIcon, GrNext as NextIcon} from "react-icons/gr";

export {
    IoClose as CloseIcon,
    IoStatsChart as StatsIcon,
    IoShareSocialSharp as ShareIcon,
    IoPlaySharp as RunIcon,
} from "react-icons/io5";
export {CiFaceFrown as BadIcon, CiFaceSmile as GoodIcon} from "react-icons/ci";
export {
    VscLayoutPanel as LayoutVerticalIcon,
    VscLayoutSidebarRight as LayoutHorizontalIcon,
} from "react-icons/vsc";

export {
    HiExclamation as ErrorIcon,
    HiInformationCircle as InfoIcon,
    HiRefresh as RefreshIcon,
    HiMail as MailIcon,
} from "react-icons/hi";

export {ImBook as LibraryIcon} from "react-icons/im";

export {FaCode as FormatIcon} from "react-icons/fa";

export {
    BiCut as CutIcon,
    BiSearch as SearchIcon,
    BiSolidKeyboard as ManualIcon,
} from "react-icons/bi";

export {
    RiSettings5Fill as SettingsIcon,
    RiTerminalBoxFill as TerminalIcon,
} from "react-icons/ri";

export {
    MdOutlineContentPaste as PasteIcon,
    MdContentCopy as CopyIcon,
    MdKeyboardControlKey as CtrlKey,
    MdKeyboardOptionKey as OptionKey,
    MdKeyboardReturn as EnterKey,
    MdOutlineAdd as AddIcon,
    MdOutlineEdit as EditIcon,
    MdUnfoldLess as FoldIcon,
    MdUnfoldMore as UnfoldIcon,
} from "react-icons/md";

export {
    BsShift as ShiftKey,
} from "react-icons/bs";

export function MetaKey() {
    return isMac() ? <MdKeyboardCommandKey/> : <MdKeyboardControlKey/>;
}
