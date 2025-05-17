import {LSPDocumentSymbol} from "../types";
import {
    DRAWER_DOCUMENT_SYMBOLS, DRAWER_LIBRARY,
    DRAWER_STATS,
    INACTIVE_TEXT_CLASS,
    NO_OPENED_DRAWER,
    SNIPPETS
} from "../constants.ts";
import {countSymbols, SYMBOL_KIND_MAP} from "../lib/lsp.ts";
import {TRANSLATE} from "../lib/i18n.ts";
import {Divider, Row} from "./Common.tsx";
import {CloseIcon, FoldIcon, SearchIcon, UnfoldIcon} from "./Icons.tsx";
import {ChangeEvent, useCallback, useContext, useState} from "react";
import {AppCtx, isUserCode} from "../utils.ts";
import {IconButton} from "./IconButton.tsx";
import {TextInput} from "flowbite-react";

function SearchIconWrapper() {
    return (
        <SearchIcon className={"opacity-50"}/>
    )
}

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
    documentSymbols: LSPDocumentSymbol[],
    setSelectedSymbol: (symbol: LSPDocumentSymbol) => void
    setSelectedSnippet: (id: string) => void
    lines: number
}) {
    const {
        documentSymbols,
        setSelectedSymbol,
        setSelectedSnippet,
        lines,
    } = props;
    const {lan, file, isRunning, openedDrawer, updateOpenedDrawer} = useContext(AppCtx)
    const [searchSymbol, setSearchSymbol] = useState("");
    const [searchSnippet, setSearchSnippet] = useState("");
    const [foldedSnippetSections, setFoldedSnippetSections] = useState<Record<string, boolean>>({})

    const closeDrawer = () => {
        updateOpenedDrawer(NO_OPENED_DRAWER);
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
            if (isRunning || !isUserCode(file)) {
                return;
            }
            setSelectedSnippet(id);
        }
    }, [file, isRunning, setSelectedSnippet]);

    const foldSection = useCallback((key: string) => {
        return () => {
            setFoldedSnippetSections((prev) => {
                return {
                    ...prev,
                    [key]: !prev[key]
                }
            })
        }
    }, []);

    const onSearchDocumentSymbols = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setSearchSymbol(e.target.value);
    }, [setSearchSymbol]);
    const onSearchSnippets = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setSearchSnippet(e.target.value);
    }, [setSearchSnippet]);

    const displaySymbols = Object.entries(countSymbols(documentSymbols))
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([_, value]) => {
            return value > 0;
        })

    return (
        <div
            className={"relative z-10 flex h-full flex-col overflow-y-auto border-r border-r-gray-400 dark:border-gray-600"}>

            <div
                className={"sticky top-0 border-b border-b-gray-300 bg-gray-100 py-2.5 shadow dark:border-b-gray-700 dark:bg-neutral-900"}>
                <div
                    className={"flex items-center justify-between px-2 text-xs font-semibold text-gray-900 dark:text-gray-100"}>
                    {openedDrawer && TRANSLATE[openedDrawer][lan]}
                    <IconButton icon={<CloseIcon size={14}/>} variant={"secondary"} onClick={closeDrawer}/>
                </div>

                {
                    (openedDrawer === DRAWER_DOCUMENT_SYMBOLS || openedDrawer === DRAWER_LIBRARY) && (
                        <div className={"mx-2 mt-2.5"}>
                            <TextInput value={searchSymbol}
                                       className={openedDrawer === DRAWER_DOCUMENT_SYMBOLS ? "" : "hidden"}
                                       onChange={onSearchDocumentSymbols} icon={SearchIconWrapper} sizing={"sm"}
                                       placeholder={"search"}/>
                            <TextInput value={searchSnippet} className={openedDrawer === DRAWER_LIBRARY ? "" : "hidden"}
                                       onChange={onSearchSnippets} icon={SearchIconWrapper} sizing={"sm"}
                                       placeholder={"search"}/>
                        </div>
                    )
                }
            </div>

            <div className={"flex flex-1 flex-col overflow-x-auto bg-neutral-50 pb-6 dark:bg-neutral-900"}>
                {
                    openedDrawer === DRAWER_DOCUMENT_SYMBOLS && documentSymbols
                        .filter(({name}) => name.toLowerCase().includes(searchSymbol.toLowerCase()))
                        .map(({name, kind}, index) => {
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
                    openedDrawer === DRAWER_STATS && (
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
                    openedDrawer == DRAWER_LIBRARY && (
                        <>
                            {
                                Object.keys(SNIPPETS)
                                    .map(key => {
                                        return (
                                            <div key={key}>
                                                <Row onClick={foldSection(key)}
                                                     className={"cursor-pointer border-b p-2 pr-1.5 dark:border-b-gray-700"}>
                                                    <div key={key}
                                                         className={"text-sm font-semibold text-black  dark:text-white"}>{key}</div>
                                                    <IconButton
                                                        icon={foldedSnippetSections[key] ? <UnfoldIcon/> : <FoldIcon/>}/>
                                                </Row>

                                                <div
                                                    className={`border-b text-gray-900 dark:border-b-gray-700 dark:text-gray-200 ${foldedSnippetSections[key] ? "hidden" : ""}`}>
                                                    {
                                                        Object.entries(SNIPPETS[key])
                                                            .filter(([subkey]) => subkey.toLowerCase().includes(searchSnippet.toLowerCase()))
                                                            .map(([subkey, value]) => {
                                                                return (
                                                                    <div
                                                                        key={subkey}
                                                                        className={`${LINE_STYLE} ${isRunning || !isUserCode(file) ? "opacity-50" : ""}`}
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
