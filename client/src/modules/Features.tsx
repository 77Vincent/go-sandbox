import {Tooltip} from "flowbite-react";
import {TRANSLATE} from "../lib/i18n.ts";
import {selectableDrawers} from "../types";
import {
    DRAWER_DOCUMENT_SYMBOLS, DRAWER_LIBRARY, DRAWER_STATS,
    NO_OPENED_DRAWER
} from "../constants.ts";
import {LibraryIcon, OutlineIcon, StatsIcon} from "./Icons.tsx";
import {useContext} from "react";
import {AppCtx} from "../utils.ts";
import {IconButton} from "./Common.tsx";

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
                <IconButton
                    active={openedDrawer === DRAWER_DOCUMENT_SYMBOLS}
                    icon={<OutlineIcon size={isMobile ? 16 : 18}/>}
                    onClick={onClick(DRAWER_DOCUMENT_SYMBOLS)}
                />
            </Tooltip>

            <Tooltip className={"text-xs font-light"} content={TRANSLATE.stats[lan]}>
                <IconButton
                    active={openedDrawer === DRAWER_STATS}
                    icon={<StatsIcon size={isMobile ? 14 : 16}/>}
                    onClick={onClick(DRAWER_STATS)}
                />
            </Tooltip>

            <Tooltip className={"text-xs font-light"} content={TRANSLATE.library[lan]}>
                <IconButton
                    active={openedDrawer === DRAWER_LIBRARY}
                    icon={<LibraryIcon size={isMobile ? 15 : 16}/>}
                    onClick={onClick(DRAWER_LIBRARY)}
                />
            </Tooltip>
        </>
    );
}
