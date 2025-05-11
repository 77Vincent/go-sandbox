import {LSPDocumentSymbol, selectableDrawers} from "../types";
import {
    ACTIVE_ICON_BUTTON_CLASS_2,
    DRAWER_DOCUMENT_SYMBOLS, DRAWER_LIBRARY,
    DRAWER_STATS,
    INACTIVE_TEXT_CLASS,
    NO_OPENED_DRAWER,
    OPENED_DRAWER_KEY, SNIPPETS
} from "../constants.ts";
import {countSymbols, SYMBOL_KIND_MAP} from "../lib/lsp.ts";
import {TRANSLATE} from "../lib/i18n.ts";
import {Divider} from "./Common.tsx";
import {CloseIcon} from "./Icons.tsx";
import {useCallback, useContext} from "react";
import {AppCtx} from "../utils.ts";

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
    documentSymbols: LSPDocumentSymbol[],
    setOpenedDrawer: (id: selectableDrawers) => void
    setSelectedSymbol: (symbol: LSPDocumentSymbol) => void
    setSelectedSnippet: (id: string) => void
    lines: number
}) {
    const {
        type,
        documentSymbols,
        setOpenedDrawer,
        setSelectedSymbol,
        setSelectedSnippet,
        lines,
    } = props;
    const {lan, isRunning} = useContext(AppCtx)

    const closeDrawer = () => {
        setOpenedDrawer(NO_OPENED_DRAWER);
        localStorage.setItem(OPENED_DRAWER_KEY, NO_OPENED_DRAWER);
    }

    const onSymbolClick = (i: number) => {
        return () => {
            if (documentSymbols[i]) {
                setSelectedSymbol(documentSymbols[i]);
            }
        }
    }

    const onSnippetClick = useCallback((id: string) => {
        return () => {
            if (isRunning) {
                return;
            }
            setSelectedSnippet(id);
        }
    }, [isRunning, setSelectedSnippet]);

    const displaySymbols = Object.entries(countSymbols(documentSymbols))
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([_, value]) => {
            return value > 0;
        })

    return (
        <div
            className={"relative z-10 flex h-full flex-col overflow-y-auto border-r border-r-gray-400 dark:border-gray-600"}>

            <div
                className={"sticky top-0 border-b border-b-gray-300 bg-gray-100 py-2 shadow dark:border-b-gray-700 dark:bg-neutral-900"}>
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
                            <div key={name} onClick={onSymbolClick(index)}
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
                                displaySymbols.map(([key, value]) => {
                                    return (
                                        <div key={key} className={LINE_STYLE}>
                                            <div
                                                className={`${value ? "text-black dark:text-white" : INACTIVE_TEXT_CLASS} italic`}>
                                                {key}
                                            </div>

                                            <div
                                                className={`${value ? "font-semibold text-black dark:text-white" : INACTIVE_TEXT_CLASS}`}>{value}</div>
                                        </div>
                                    )
                                })
                            }

                            {
                                displaySymbols.length > 0 && <Divider horizontal={true} className={"my-1"}/>
                            }
                            <div className={`${LINE_STYLE} text-black dark:text-white`}>
                                <div>Lines</div>
                                <div className={"font-semibold"}>{lines}</div>
                            </div>
                        </>
                    )
                }
                {
                    type == DRAWER_LIBRARY && (
                        <>
                            {
                                Object.keys(SNIPPETS).map(key => {
                                    return (
                                        <div key={key}>
                                            <div key={key}
                                                 className={"border-b p-2 text-sm font-semibold text-black dark:border-b-gray-700 dark:text-white"}>{key}</div>

                                            <div className={"border-b text-gray-900 dark:border-b-gray-700 dark:text-gray-200"}>
                                                {
                                                    Object.entries(SNIPPETS[key]).map(([subkey, value]) => {
                                                        return (
                                                            <div
                                                                key={subkey}
                                                                className={`${LINE_STYLE} ${isRunning ? "opacity-50" : ""}`}
                                                                onClick={onSnippetClick(subkey)}
                                                            >

                                                                {value}
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </>
                    )
                }
            </div>
        </div>
    );
}
