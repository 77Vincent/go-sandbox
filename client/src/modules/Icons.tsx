import {isMac} from "../utils.ts";
import {MdKeyboardCommandKey, MdKeyboardControlKey} from "react-icons/md";

export {ImTextColor as TextMIcon} from "react-icons/im"

export {
    IoMdRemoveCircleOutline as RemoveIcon,
    IoMdStats as StatsIcon,
} from "react-icons/io";

export {GoUnfold as UnfoldAllIcon, GoFold as FoldAllIcon} from "react-icons/go";

export { GrPrevious as PrevIcon, GrNext as NextIcon } from "react-icons/gr";

export {
    IoClose as CloseIcon,
    IoSchoolOutline as LearnIcon,
} from "react-icons/io5";
export {CiFaceFrown as BadIcon, CiFaceSmile as GoodIcon} from "react-icons/ci";
export {
    VscSettingsGear as SettingsIcon,
    VscLayoutPanel as LayoutVerticalIcon,
    VscLayoutSidebarRight as LayoutHorizontalIcon,
    VscSymbolStructure as OutlineIcon,
} from "react-icons/vsc";

export {
    HiOutlineInformationCircle as AboutIcon,
    HiOutlineQuestionMarkCircle as ManualIcon,
    HiExclamation as ErrorIcon,
    HiInformationCircle as InfoIcon,
    HiRefresh as RefreshIcon,
    HiMail as MailIcon,
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
    MdOutlineAdd as AddIcon,
    MdOutlineEdit as EditIcon,
    MdTextDecrease as TextSIcon,
    MdTextIncrease as TextLIcon,
    MdUnfoldLess as  FoldIcon,
    MdUnfoldMore as UnfoldIcon,
} from "react-icons/md";

export {BsShift as ShiftKey} from "react-icons/bs";

export function MetaKey() {
    return isMac() ? <MdKeyboardCommandKey/> : <MdKeyboardControlKey/>;
}
