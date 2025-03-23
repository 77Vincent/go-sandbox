import {Dropdown} from "flowbite-react";
import {TEMPLATES} from "../constants.ts";
import {MouseEventHandler} from "react";

export default function Component(props: {
    onTemplateSelect: (template: string) => void
}) {
    const {onTemplateSelect} = props;

    function onClick(key: string): MouseEventHandler<HTMLDivElement> {
        return (e) => {
            e.stopPropagation();
            onTemplateSelect(key);
        }
    }

    return (
        <Dropdown color={"light"} size={"xs"} label={"Templates"}>
            {
                Object.keys(TEMPLATES).map(key => {
                    return (
                        <div key={key}>
                            <Dropdown.Header key={key}
                                             className={"font-bold"}>{key}</Dropdown.Header>

                            <Dropdown.Item className={"mb-2 grid grid-cols-4 gap-1.5"}>
                                {
                                    Object.entries(TEMPLATES[key]).map(([subkey, value]) => {
                                        return (
                                            <div
                                                className={"rounded-md border border-gray-300 px-1.5 py-1 hover:border-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-800"}
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
