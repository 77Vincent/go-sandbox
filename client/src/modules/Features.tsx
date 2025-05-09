import {Divider} from "./Common.tsx";
import {Tooltip} from "flowbite-react";
import {TRANSLATE} from "../lib/i18n.ts";
import {selectableDrawers} from "../types";
import {
    ACTIVE_ICON_BUTTON_CLASS,
    DRAWER_DOCUMENT_SYMBOLS, DRAWER_STATS,
    ICON_BUTTON_CLASS
} from "../constants.ts";
import {LearnIcon, OutlineIcon, StatsIcon} from "./Icons.tsx";
import {useContext} from "react";
import {AppCtx} from "../utils.ts";

export default function Component(props: {
    openedDrawer: selectableDrawers
    setOpenedDrawer: (id: selectableDrawers) => void
}) {
    const {openedDrawer, setOpenedDrawer} = props;
    const {lan} = useContext(AppCtx)
    const onClick = (id: selectableDrawers) => {
        return () => {
            if (id !== openedDrawer) {
                setOpenedDrawer(id);
            } else {
                setOpenedDrawer("");
            }
        };
    }

    return (
        <div className="z-20 flex items-center gap-4 max-md:gap-2">
            <Tooltip className={"text-xs"} content={TRANSLATE.documentSymbols[lan]}>
                <OutlineIcon
                    onClick={onClick(DRAWER_DOCUMENT_SYMBOLS)} size={18}
                    className={`${openedDrawer === DRAWER_DOCUMENT_SYMBOLS ? ACTIVE_ICON_BUTTON_CLASS : ICON_BUTTON_CLASS}`}
                />
            </Tooltip>

            <Tooltip className={"text-xs"} content={TRANSLATE.stats[lan]}>
                <StatsIcon
                    onClick={onClick(DRAWER_STATS)} size={18}
                    className={`${openedDrawer === DRAWER_STATS ? ACTIVE_ICON_BUTTON_CLASS : ICON_BUTTON_CLASS}`}
                />
            </Tooltip>

            <Divider/>

            <Tooltip className={"text-xs"} content={TRANSLATE.study[lan]}>
                <LearnIcon size={18} className={ICON_BUTTON_CLASS} onClick={() => {
                    window.open("https://go.dev/tour/welcome/1", "_blank");
                }}/>
            </Tooltip>
        </div>
    );
}
