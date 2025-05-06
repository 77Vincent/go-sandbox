import {IoClose as CloseIcon} from "react-icons/io5";

import {languages, LSPDocumentSymbol, selectableDrawers} from "../types";
import {
    ACTIVE_ICON_BUTTON_CLASS_2,
    DEFAULT_LANGUAGE, DRAWER_DOCUMENT_SYMBOLS, DRAWER_STATS, INACTIVE_TEXT_CLASS,
    NO_OPENED_DRAWER,
    OPENED_DRAWER_KEY
} from "../constants.ts";
import {SYMBOL_KIND_MAP} from "../lib/lsp.ts";
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

interface statsInfo {
    file: number,
    module: number,
    namespace: number,
    package: number,
    class: number,
    method: number,
    property: number,
    field: number,
    constructor: number,
    enum: number,
    interface: number,
    function: number,
    variable: number,
    constant: number,
    string: number,
    number: number,
    boolean: number,
    array: number,
    object: number,
    key: number,
    null: number,
    enumMember: number,
    struct: number,
    event: number,
    operator: number,
    typeParameter: number,
}

function count(arr: LSPDocumentSymbol[]): statsInfo {
    const output: statsInfo = {
        file: 0,
        module: 0,
        namespace: 0,
        package: 0,
        class: 0,
        method: 0,
        property: 0,
        field: 0,
        constructor: 0,
        enum: 0,
        interface: 0,
        function: 0,
        variable: 0,
        constant: 0,
        string: 0,
        number: 0,
        boolean: 0,
        array: 0,
        object: 0,
        key: 0,
        null: 0,
        enumMember: 0,
        struct: 0,
        event: 0,
        operator: 0,
        typeParameter: 0
    }
    for (let i = 0; i < arr.length; i++) {
        const {kind} = arr[i];
        switch (kind) {
            case 1: // file
                output.file++;
                break;
            case 2: // module
                output.module++;
                break;
            case 3: // namespace
                output.namespace++;
                break;
            case 4: // package
                output.package++;
                break;
            case 5: // class
                output.class++;
                break;
            case 6: // method
                output.method++;
                break;
            case 7: // property
                output.property++;
                break;
            case 8: // field
                output.field++;
                break;
            case 9: // constructor
                output.constructor++;
                break;
            case 10: // enum
                output.enum++;
                break;
            case 11: // interface
                output.interface++;
                break;
            case 12: // function
                output.function++;
                break;
            case 13: // variable
                output.variable++;
                break;
            case 14: // constant
                output.constant++;
                break;
            case 15: // string
                output.string++;
                break;
            case 16: // number
                output.number++;
                break;
            case 17: // boolean
                output.boolean++;
                break;
            case 18: // array
                output.array++;
                break;
            case 19: // object
                output.object++;
                break;
            case 20: // key
                output.key++;
                break;
            case 21: // null
                output.null++;
                break;
            case 22: // enumMember
                output.enumMember++;
                break;
            case 23: // struct
                output.struct++;
                break;
            case 24: // event
                output.event++;
                break;
            case 25: // operator
                output.operator++;
                break;
            case 26: // typeParameter
                output.typeParameter++;
                break;
        }
    }
    return output;
}

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

            <div className={"flex flex-1 flex-col overflow-x-auto bg-neutral-50 dark:bg-neutral-900"}>
                {
                    type === DRAWER_DOCUMENT_SYMBOLS && documentSymbols.map(({name, kind}, index) => {
                        return (
                            <div key={name} onClick={onClick(type, index)}
                                 className={LINE_STYLE}
                            >
                                <div className={`flex items-center gap-1 truncate ${symbolStyle(kind)}`}>
                                    {name}{kind}
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
                                Object.entries(count(documentSymbols)).map(([key, value]) => {
                                    return (
                                        <div key={key} className={LINE_STYLE}>
                                            <div
                                                className={`${value ? "text-gray-800 dark:text-gray-300" : INACTIVE_TEXT_CLASS}`}>
                                                {key}
                                            </div>

                                            <div
                                                className={`${value ? "text-black dark:text-white" : INACTIVE_TEXT_CLASS}`}>{value}</div>
                                        </div>
                                    )
                                })
                            }

                            <Divider horizontal={true} className={"my-1"}/>
                            <div className={LINE_STYLE}>
                                <div className={"text-gray-800 dark:text-gray-300"}>Lines</div>
                                <div className={"text-black dark:text-white"}>{lines}</div>
                            </div>
                        </>
                    )
                }
            </div>
        </div>
    );
}
