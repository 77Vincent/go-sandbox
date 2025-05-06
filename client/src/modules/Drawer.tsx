import {IoClose as CloseIcon} from "react-icons/io5";

import {languages, LSPDocumentSymbol, selectableDrawers} from "../types";
import {
    ACTIVE_ICON_BUTTON_CLASS_2,
    DEFAULT_LANGUAGE,
    DRAWER_DOCUMENT_SYMBOLS,
    DRAWER_STATS,
    INACTIVE_TEXT_CLASS,
    NO_OPENED_DRAWER,
    OPENED_DRAWER_KEY
} from "../constants.ts";
import {countSymbols, SYMBOL_KIND_MAP} from "../lib/lsp.ts";
import {TRANSLATE} from "../lib/i18n.ts";
import {Divider} from "./Common.tsx";

const symbolStyle = (kind: number): string => {
    switch (kind) {
        case 5: // class
            return "text-red-700 dark:text-red-400";
        case 6: // method
            return "text-orange-700 dark:text-orange-400";
        case 11: // interface
            return "text-purple-700 dark:text-purple-400";
        case 12: // function
            return "text-yellow-600 dark:text-yellow-200";
        case 13: // variable
            return "text-green-700 dark:text-green-400 italic";
        case 14: // constant
            return "text-blue-700 dark:text-blue-400 italic";
        case 23: // struct
            return "text-teal-700 dark:text-teal-300 underline";
        default:
            return "text-gray-500 dark:text-gray-400";
    }
}

const LINE_STYLE = "flex cursor-pointer items-center justify-between gap-2 px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs"

export default function Component(props: {
    type: selectableDrawers,
    lan: languages,
    documentSymbols: LSPDocumentSymbol[],
    setOpenedDrawer: (id: selectableDrawers) => void
    setSelectedSymbol: (symbol: LSPDocumentSymbol) => void
    lines: number
}) {
    const {
        type,
        lan = DEFAULT_LANGUAGE,
        documentSymbols,
        setOpenedDrawer,
        setSelectedSymbol,
        lines,
    } = props;

    const closeDrawer = () => {
        setOpenedDrawer(NO_OPENED_DRAWER);
        localStorage.setItem(OPENED_DRAWER_KEY, NO_OPENED_DRAWER);
    }

    const onClick = (type: selectableDrawers, i: number) => {
        return () => {
            switch (type) {
                case DRAWER_DOCUMENT_SYMBOLS:
                    if (documentSymbols[i]) {
                        setSelectedSymbol(documentSymbols[i]);
                    }
                    break;
            }
        }
    }

    return (
        <div
            className={"relative z-10 flex h-full flex-col overflow-y-auto border-r border-r-gray-400 dark:border-gray-600"}>

            <div
                className={"sticky top-0 border-b border-b-gray-200 bg-white py-2 shadow dark:border-b-gray-700 dark:bg-neutral-900"}>
                <div
                    className={"flex items-center justify-between px-2 text-xs font-semibold text-gray-900 dark:text-gray-100"}>
                    {type && TRANSLATE[type][lan]}
                    <CloseIcon size={14} className={ACTIVE_ICON_BUTTON_CLASS_2} onClick={closeDrawer}/>
                </div>
            </div>

            <div className={"flex flex-1 flex-col overflow-x-auto bg-neutral-50 pb-6 dark:bg-neutral-900"}>
                {
                    type === DRAWER_DOCUMENT_SYMBOLS && documentSymbols.map(({name, kind}, index) => {
                        return (
                            <div key={name} onClick={onClick(type, index)}
                                 className={LINE_STYLE}
                            >
                                <div className={`flex items-center gap-1 truncate ${symbolStyle(kind)}`}>
                                    {name}
                                </div>

                                <div className={"font-light text-gray-400 dark:text-gray-500"}>
                                    {SYMBOL_KIND_MAP[kind] ?? kind}
                                </div>
                            </div>
                        );
                    })
                }
                {
                    type === DRAWER_STATS && (
                        <>
                            {
                                Object.entries(countSymbols(documentSymbols)).map(([key, value]) => {
                                    return (
                                        <div key={key} className={LINE_STYLE}>
                                            <div
                                                className={`${value ? "font-semibold text-black dark:text-white" : INACTIVE_TEXT_CLASS} italic`}>
                                                {key}
                                            </div>

                                            <div
                                                className={`${value ? "font-semibold text-black dark:text-white" : INACTIVE_TEXT_CLASS}`}>{value}</div>
                                        </div>
                                    )
                                })
                            }

                            <Divider horizontal={true} className={"my-1"}/>
                            <div className={`${LINE_STYLE} font-semibold text-black dark:text-white`}>
                                <div>Lines</div>
                                <div>{lines}</div>
                            </div>
                        </>
                    )
                }
            </div>
        </div>
    );
}
