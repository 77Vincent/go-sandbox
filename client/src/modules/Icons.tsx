import {isMac} from "../utils.ts";
import {MdKeyboardCommandKey, MdKeyboardControlKey} from "react-icons/md";

export {
    IoMdRemoveCircleOutline as RemoveIcon,
    IoMdInformationCircle as AboutIcon,
} from "react-icons/io";

export { BsDiagram3Fill as OutlineIcon } from "react-icons/bs";

export {GoUnfold as UnfoldAllIcon, GoFold as FoldAllIcon} from "react-icons/go";

export { GrPrevious as PrevIcon, GrNext as NextIcon } from "react-icons/gr";

export {
    IoClose as CloseIcon,
    IoBook as LibraryIcon,
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

export { FaCode as FormatIcon } from "react-icons/fa";

export {
    BiCut as CutIcon,
    BiSearch as SearchIcon,
    BiSolidKeyboard as ManualIcon,
} from "react-icons/bi";

export {
    RiSettings5Fill as SettingsIcon,
} from "react-icons/ri";

export {
    MdOutlineContentPaste as PasteIcon,
    MdContentCopy as CopyIcon,
    MdKeyboardControlKey as CtrlKey,
    MdKeyboardOptionKey as OptionKey,
    MdKeyboardReturn as EnterKey,
    MdOutlineAdd as AddIcon,
    MdOutlineEdit as EditIcon,
    MdUnfoldLess as  FoldIcon,
    MdUnfoldMore as UnfoldIcon,
} from "react-icons/md";

export {BsShift as ShiftKey} from "react-icons/bs";

export function MetaKey() {
    return isMac() ? <MdKeyboardCommandKey/> : <MdKeyboardControlKey/>;
}
