import {Dropdown} from "flowbite-react";
import {TEMPLATES} from "../constants.ts";
import {MouseEventHandler} from "react";

const buttonLabel = "Snippets";

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
            {
                Object.keys(TEMPLATES).map(key => {
                    return (
                        <div key={key}>
                            <Dropdown.Header key={key}
                                             className={"font-bold"}>{key}</Dropdown.Header>

                            <Dropdown.Item disabled={isRunning} className={"mb-2 grid grid-cols-4 gap-1.5"}>
                                {
                                    Object.entries(TEMPLATES[key]).map(([subkey, value]) => {
                                        return (
                                            <div
                                                className={"rounded-md border border-gray-300 px-1.5 py-1 shadow-sm hover:border-cyan-300 hover:bg-cyan-100 dark:hover:border-cyan-200 dark:hover:bg-cyan-800"}
                                                onClick={onClick(subkey)} key={subkey}>
                                                {value}
                                            </div>
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
