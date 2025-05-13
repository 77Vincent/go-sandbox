import {Tooltip} from "flowbite-react";
import {TRANSLATE} from "../lib/i18n.ts";
import {selectableDrawers} from "../types";
import {
    ACTIVE_ICON_BUTTON_CLASS,
    DRAWER_DOCUMENT_SYMBOLS, DRAWER_LIBRARY, DRAWER_STATS,
    ICON_BUTTON_CLASS, NO_OPENED_DRAWER
} from "../constants.ts";
import {LibraryIcon, OutlineIcon, StatsIcon} from "./Icons.tsx";
import {useContext} from "react";
import {AppCtx} from "../utils.ts";

export default function Component() {
    const {isMobile, lan, openedDrawer, updateOpenedDrawer} = useContext(AppCtx)

    const onClick = (id: selectableDrawers) => {
        return () => {
            if (id !== openedDrawer) {
                updateOpenedDrawer(id);
            } else {
                updateOpenedDrawer(NO_OPENED_DRAWER);
            }
        };
    }

    return (
        <>
            <Tooltip className={"text-xs font-light"} content={TRANSLATE.documentSymbols[lan]}>
                <OutlineIcon
                    onClick={onClick(DRAWER_DOCUMENT_SYMBOLS)} size={isMobile ? 16 : 18}
                    className={`${openedDrawer === DRAWER_DOCUMENT_SYMBOLS ? ACTIVE_ICON_BUTTON_CLASS : ICON_BUTTON_CLASS}`}
                />
            </Tooltip>

            <Tooltip className={"text-xs font-light"} content={TRANSLATE.stats[lan]}>
                <StatsIcon
                    onClick={onClick(DRAWER_STATS)} size={isMobile ? 14 : 16}
                    className={`${openedDrawer === DRAWER_STATS ? ACTIVE_ICON_BUTTON_CLASS : ICON_BUTTON_CLASS}`}
                />
            </Tooltip>

            <Tooltip className={"text-xs font-light"} content={TRANSLATE.library[lan]}>
                <LibraryIcon
                    onClick={onClick(DRAWER_LIBRARY)} size={isMobile ? 15 : 16}
                    className={`${openedDrawer === DRAWER_LIBRARY ? ACTIVE_ICON_BUTTON_CLASS : ICON_BUTTON_CLASS}`}
                />
            </Tooltip>
        </>
    );
}
