import {mySandboxes} from "../types";
import {BUTTON_INACTIVE, HELLO_WORLD, MY_SANDBOXES, SELECTED_COLOR_CLASS} from "../constants.ts";

import {MdOutlineAdd as AddIcon} from "react-icons/md";
import {Dropdown, Tooltip} from "flowbite-react";
import {useEffect, useRef, useState} from "react";
import {getSandboxes} from "../utils.ts";

export default function Component(props: {
    isRunning: boolean,
    active: mySandboxes,
    onSelect: (id: mySandboxes) => void
}) {
    const {isRunning, active, onSelect} = props;
    const [sandboxes, setSandboxes] = useState(getSandboxes())
    const sandboxesRef = useRef(sandboxes);
    const limit = Object.keys(MY_SANDBOXES).length;

    function onClick(key: mySandboxes) {
        return () => {
            if (key !== active) {
                onSelect(key);
            }
        }
    }

    function addSandbox() {
        const next = `my-sandbox-${sandboxesRef.current.length + 1}`;
        setSandboxes((prev) => [...prev, next as mySandboxes]);
        localStorage.setItem(next, HELLO_WORLD)
        onSelect(next as mySandboxes);
    }

    useEffect(() => {
        sandboxesRef.current = sandboxes;
    }, [sandboxes]);

    return (
        <Dropdown className={"z-20"} disabled={isRunning} color={"light"} size={"xs"} label={MY_SANDBOXES[active]}>
            {
                sandboxes.map((key) => {
                    return (
                        <Dropdown.Item className={active === key ? SELECTED_COLOR_CLASS : ""} key={key}
                                       onClick={onClick(key as mySandboxes)}>
                            {MY_SANDBOXES[key]}
                        </Dropdown.Item>
                    )
                })
            }
            <Dropdown.Divider/>

            <Dropdown.Item
                onClick={sandboxes.length >= limit ? undefined : addSandbox}
                className={`flex justify-center ${sandboxes.length >= limit ? BUTTON_INACTIVE : ""}`}>
                <Tooltip content={`up to ${limit} sandboxes`} className={"text-xs"} placement={"bottom"}>
                    <AddIcon className={"text-lg"}/>
                </Tooltip>
            </Dropdown.Item>
        </Dropdown>
    )
}
