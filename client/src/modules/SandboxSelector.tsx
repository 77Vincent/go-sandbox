import {mySandboxes} from "../types";
import {Dropdown} from "flowbite-react";
import {MY_SANDBOXES, SELECTED_COLOR_CLASS} from "../constants.ts";

export default function Component(props: {
    isRunning: boolean,
    active: mySandboxes,
    onSelect: (id: mySandboxes) => void
}) {
    const {isRunning, active, onSelect} = props;

    function onClick(key: mySandboxes) {
        return () => {
            if (key !== active) {
                onSelect(key);
            }
        }
    }

    return (
        <Dropdown className={"z-20"} disabled={isRunning} color={"light"} size={"xs"} label={MY_SANDBOXES[active]}>
            {
                Object.entries(MY_SANDBOXES).map(([key, value]) => {
                    return (
                        <Dropdown.Item className={active === key ? SELECTED_COLOR_CLASS : ""} key={key} onClick={onClick(key as mySandboxes)}>
                            {value}
                        </Dropdown.Item>
                    )
                })
            }
        </Dropdown>
    )
}
