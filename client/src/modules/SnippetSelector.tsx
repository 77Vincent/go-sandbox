import {Dropdown} from "flowbite-react";
import {INACTIVE_TEXT_CLASS, SNIPPETS} from "../constants.ts";
import {MouseEventHandler, useContext} from "react";
import {AppCtx} from "../utils.ts";

const buttonLabel = "Snippets";

function Item(props: {
    id: string,
    value: string,
    onClick: MouseEventHandler<HTMLDivElement>
}) {
    const {id, value, onClick} = props;

    return (
        <div
            className={"rounded-md border border-gray-300 px-1.5 py-1 text-xs text-gray-900 shadow-sm hover:border-cyan-300 hover:bg-cyan-100 dark:text-gray-100 dark:hover:border-cyan-200 dark:hover:bg-cyan-900"}
            onClick={onClick} key={id}>
            {value}
        </div>
    )
}

export default function Component(props: {
    onSelect: (id: string) => void,
}) {
    const {onSelect} = props;
    const {isRunning} = useContext(AppCtx)

    function onClick(key: string): MouseEventHandler<HTMLDivElement> {
        return (e) => {
            e.stopPropagation();
            onSelect(key);
        }
    }

    return (
        <Dropdown inline={true} className={"z-20"} disabled={isRunning} color={"light"} size={"xs"}
                  label={<span className={`text-xs ${isRunning ? INACTIVE_TEXT_CLASS : ""}`}>{buttonLabel}</span>}
        >
            {
                Object.keys(SNIPPETS).map(key => {
                    return (
                        <div key={key}>
                            <Dropdown.Header key={key}
                                             className={"pb-0 font-bold"}>{key}</Dropdown.Header>

                            <Dropdown.Item disabled={isRunning}
                                           className={"mb-1 grid grid-cols-4 gap-1.5 max-md:grid-cols-3"}>
                                {
                                    Object.entries(SNIPPETS[key]).map(([subkey, value]) => {
                                        return (
                                            <Item key={subkey} id={subkey} value={value} onClick={onClick(subkey)}/>
                                        )
                                    })
                                }
                            </Dropdown.Item>
                        </div>
                    )
                })
            }
        </Dropdown>
    )
}
