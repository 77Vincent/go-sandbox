import {Dropdown} from "flowbite-react";
import {TEMPLATES} from "../constants.ts";
import {MouseEventHandler} from "react";

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
    isRunning: boolean,
    onSelect: (id: string) => void
}) {
    const {onSelect, isRunning} = props;

    function onClick(key: string): MouseEventHandler<HTMLDivElement> {
        return (e) => {
            e.stopPropagation();
            onSelect(key);
        }
    }

    return (
        <Dropdown className={"z-20"} disabled={isRunning} color={"light"} size={"xs"} label={buttonLabel}>
            <Dropdown.Header className={"flex items-center justify-between pb-0 font-bold"}>
                My Sandbox
                <span className={"text-xs font-light text-gray-500"}>Up to 4 local sandboxes</span>
            </Dropdown.Header>

            <Dropdown.Item disabled={isRunning} className={"mb-1 grid grid-cols-4 gap-1.5"}>
                {
                    Array.from({length: 4}).map((_, index) => {
                        const i = index + 1;
                        const subkey = `my-sandbox-${i}`;
                        return <Item key={index} id={subkey} value={`Sandbox ${i}`} onClick={onClick(subkey)}/>
                    })
                }
            </Dropdown.Item>

            {
                Object.keys(TEMPLATES).map(key => {
                    return (
                        <div key={key}>
                            <Dropdown.Header key={key}
                                             className={"pb-0 font-bold"}>{key}</Dropdown.Header>

                            <Dropdown.Item disabled={isRunning} className={"mb-1 grid grid-cols-4 gap-1.5"}>
                                {
                                    Object.entries(TEMPLATES[key]).map(([subkey, value]) => {
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
