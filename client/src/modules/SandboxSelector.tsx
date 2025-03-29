import {mySandboxes} from "../types";
import {Dropdown, Tooltip} from "flowbite-react";
import {MY_SANDBOXES} from "../constants.ts";

export default function Component(props: {
    isRunning: boolean,
    active: mySandboxes,
    onSelect: (id: mySandboxes) => void
}) {
    const {isRunning, active, onSelect} = props;

    return (
        <Tooltip className={"text-xs"} content={`up to ${Object.keys(MY_SANDBOXES).length} local sandboxes`} placement={"left"}>
            <Dropdown className={"z-20"} disabled={isRunning} color={"light"} size={"xs"} label={MY_SANDBOXES[active]}>
                {
                    Object.entries(MY_SANDBOXES).map(([key, value]) => {
                        return (
                            <Dropdown.Item key={key} onClick={() => onSelect(key as mySandboxes)}>
                                {value}
                            </Dropdown.Item>
                        )
                    })
                }
            </Dropdown>
        </Tooltip>
    )
}
