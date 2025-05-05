import {IoClose as CloseIcon} from "react-icons/io5";

import {languages, LSPDocumentSymbol, selectableDrawers} from "../types";
import {
    ACTIVE_ICON_BUTTON_CLASS_2,
    DEFAULT_LANGUAGE,
    LSP_TO_CODEMIRROR_TYPE,
    NO_OPENED_DRAWER,
    OPENED_DRAWER_KEY
} from "../constants.ts";
import {LSP_KIND_LABELS} from "../lib/lsp.ts";
import {TRANSLATE} from "../lib/i18n.ts";

export default function Component(props: {
    title: string,
    lan: languages,
    documentSymbols: LSPDocumentSymbol[],
    setOpenedDrawer: (id: selectableDrawers) => void
    setSelectedSymbol: (symbol: LSPDocumentSymbol) => void
}) {
    const {title, lan = DEFAULT_LANGUAGE, documentSymbols, setOpenedDrawer, setSelectedSymbol} = props;

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
            className={"relative z-10 h-full overflow-y-auto border-r border-r-gray-200 shadow-sm dark:border-gray-700"}>

            <div
                className={"sticky top-0  border-b border-b-gray-200 bg-white py-2 shadow dark:border-b-gray-700 dark:bg-neutral-900"}>
                <div
                    className={"flex items-center justify-between px-2 text-xs font-semibold text-gray-900 dark:text-gray-100"}>
                    {title && TRANSLATE[title][lan]}
                    <CloseIcon size={14} className={ACTIVE_ICON_BUTTON_CLASS_2} onClick={closeDrawer}/>
                </div>
            </div>

            <div className={"flex flex-col overflow-x-auto px-2"}>
                {
                    documentSymbols.map(({name, kind}, index) => {
                        return (
                            <div key={name} onClick={onClick(index)}
                                 className={"flex cursor-pointer items-center justify-between gap-2 px-0.5 py-1 font-light hover:bg-gray-100 dark:hover:bg-gray-700"}
                            >
                                <div className={"truncate text-xs text-gray-700 dark:text-gray-200"}>
                                    {name}
                                </div>

                                <div className={"text-xs text-gray-500 dark:text-gray-500"}>
                                    {LSP_TO_CODEMIRROR_TYPE[LSP_KIND_LABELS[kind]] ?? kind}
                                </div>
                            </div>
                        );
                    })
                }
            </div>
        </div>
    );
}
