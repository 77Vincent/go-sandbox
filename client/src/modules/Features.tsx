import {Tooltip} from "flowbite-react";
import {TRANSLATE} from "../lib/i18n.ts";
import {selectableDrawers} from "../types";
import {
    DRAWER_DOCUMENT_SYMBOLS, DRAWER_LIBRARY, DRAWER_STATS,
    NO_OPENED_DRAWER
} from "../constants.ts";
import {LibraryIcon, MetaKey, OptionKey, OutlineIcon, StatsIcon} from "./Icons.tsx";
import {useContext} from "react";
import {AppCtx} from "../utils.ts";

import {IconButton} from "./IconButton.tsx";
import {Row} from "./Common.tsx";

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
            <Tooltip content={
                <Row className={"gap-1.5"}>
                    {TRANSLATE.documentSymbols[lan]}
                    <Row> <MetaKey/><OptionKey/>1 </Row>
                </Row>
            }>
                <IconButton
                    active={openedDrawer === DRAWER_DOCUMENT_SYMBOLS}
                    icon={<OutlineIcon size={isMobile ? 16 : 18}/>}
                    onClick={onClick(DRAWER_DOCUMENT_SYMBOLS)}
                />
            </Tooltip>

            <Tooltip content={
                <Row className={"gap-1.5"}>
                    {TRANSLATE.stats[lan]}
                    <Row> <MetaKey/><OptionKey/>2 </Row>
                </Row>
            }>
                <IconButton
                    active={openedDrawer === DRAWER_STATS}
                    icon={<StatsIcon size={isMobile ? 14 : 16}/>}
                    onClick={onClick(DRAWER_STATS)}
                />
            </Tooltip>

            <Tooltip content={
                <Row className={"gap-1.5"}>
                    {TRANSLATE.library[lan]}
                    <Row> <MetaKey/><OptionKey/>3 </Row>
                </Row>
            }>
                <IconButton
                    active={openedDrawer === DRAWER_LIBRARY}
                    icon={<LibraryIcon size={isMobile ? 15 : 16}/>}
                    onClick={onClick(DRAWER_LIBRARY)}
                />
            </Tooltip>
        </>
    );
}
