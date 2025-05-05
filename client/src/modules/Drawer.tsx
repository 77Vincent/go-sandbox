import {IoClose as CloseIcon} from "react-icons/io5";

import {languages, LSPDocumentSymbol, selectableDrawers} from "../types";
import {
    ACTIVE_ICON_BUTTON_CLASS_2,
    DEFAULT_LANGUAGE, DRAWER_DOCUMENT_SYMBOLS,
    NO_OPENED_DRAWER,
    OPENED_DRAWER_KEY
} from "../constants.ts";
import {SYMBOL_KIND_MAP} from "../lib/lsp.ts";
import {TRANSLATE} from "../lib/i18n.ts";

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

export default function Component(props: {
    type: selectableDrawers,
    lan: languages,
    documentSymbols: LSPDocumentSymbol[],
    setOpenedDrawer: (id: selectableDrawers) => void
    setSelectedSymbol: (symbol: LSPDocumentSymbol) => void
}) {
    const {type, lan = DEFAULT_LANGUAGE, documentSymbols, setOpenedDrawer, setSelectedSymbol} = props;

    const closeDrawer = () => {
        setOpenedDrawer(NO_OPENED_DRAWER);
        localStorage.setItem(OPENED_DRAWER_KEY, NO_OPENED_DRAWER);
    }

    const onClick = (i: number) => {
        return () => {
            if (documentSymbols[i]) {
                setSelectedSymbol(documentSymbols[i]);
            }
        }
    }

    return (
        <div
            className={"relative z-10 flex h-full flex-col overflow-y-auto border-r border-r-gray-200 dark:border-gray-700"}>

            <div
                className={"sticky top-0  border-b border-b-gray-200 bg-white py-2 shadow dark:border-b-gray-700 dark:bg-neutral-900"}>
                <div
                    className={"flex items-center justify-between px-2 text-xs font-semibold text-gray-900 dark:text-gray-100"}>
                    {type && TRANSLATE[type][lan]}
                    <CloseIcon size={14} className={ACTIVE_ICON_BUTTON_CLASS_2} onClick={closeDrawer}/>
                </div>
            </div>

            <div className={"flex flex-1 flex-col overflow-x-auto bg-neutral-50 px-2 dark:bg-neutral-900"}>
                {
                    type === DRAWER_DOCUMENT_SYMBOLS && documentSymbols.map(({name, kind}, index) => {
                        return (
                            <div key={name} onClick={onClick(index)}
                                 className={"flex cursor-pointer items-center justify-between gap-2 px-0.5 py-1 hover:bg-gray-200 dark:hover:bg-gray-700"}
                            >
                                <div className={`flex items-center gap-1 truncate text-xs ${symbolStyle(kind)}`}>
                                    {name}
                                </div>

                                <div className={"text-xs font-light text-gray-400 dark:text-gray-500"}>
                                    {SYMBOL_KIND_MAP[kind] ?? kind}
                                </div>
                            </div>
                        );
                    })
                }
            </div>
        </div>
    );
}
