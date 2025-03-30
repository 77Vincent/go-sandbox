import {mySandboxes} from "../types";
import {
    BUTTON_INACTIVE,
    DEFAULT_ACTIVE_SANDBOX,
    HELLO_WORLD,
    ICON_BUTTON_CLASS,
    MY_SANDBOXES,
    SELECTED_COLOR_CLASS
} from "../constants.ts";

import {MdOutlineAdd as AddIcon} from "react-icons/md";
import {IoMdRemoveCircleOutline as RemoveIcon} from "react-icons/io";

import {Dropdown, Tooltip} from "flowbite-react";
import {MouseEventHandler, useEffect, useRef, useState} from "react";
import {getSandboxes} from "../utils.ts";

const MY_SANDBOX_PREFIX = "my-sandbox-";

function getNextSandboxId(sandboxes: mySandboxes[]): mySandboxes {
    for (let i = 1; i < Object.keys(MY_SANDBOXES).length + 1; i++) {
        const id = `${MY_SANDBOX_PREFIX}${i}`;
        if (!sandboxes.includes(id as mySandboxes)) {
            return id as mySandboxes;
        }
    }
    return DEFAULT_ACTIVE_SANDBOX
}

export default function Component(props: {
    isRunning: boolean,
    active: mySandboxes,
    onSelect: (id: mySandboxes) => void
}) {
    const {isRunning, active, onSelect} = props;
    const [sandboxes, setSandboxes] = useState(getSandboxes())
    const sandboxesRef = useRef(sandboxes);
    const upperLimit = Object.keys(MY_SANDBOXES).length;
    const lowerLimit = 1;

    function onClick(key: mySandboxes) {
        return () => {
            if (key !== active) {
                onSelect(key);
            }
        }
    }

    function addSandbox() {
        const next = getNextSandboxId(sandboxesRef.current);
        setSandboxes((prev) => [...prev, next]);
        localStorage.setItem(next, HELLO_WORLD)
        onSelect(next);
    }

    const onRemove = (id: mySandboxes): MouseEventHandler<SVGAElement> => {
        return (e) => {
            e.stopPropagation();

            if (sandboxesRef.current.length > lowerLimit) {
                const next = sandboxesRef.current.filter((k) => k !== id);
                setSandboxes(next);
                localStorage.removeItem(id);
                if (next.length > 0) {
                    onSelect(next[0]);
                }
            }
        }
    }

    useEffect(() => {
        sandboxesRef.current = sandboxes;
    }, [sandboxes]);

    return (
        <Dropdown className={"z-20"} disabled={isRunning} color={"light"} size={"xs"} label={MY_SANDBOXES[active]}>
            {
                sandboxes.map((key) => {
                    return (
                        <Dropdown.Item
                            className={`flex items-center justify-between gap-3 ${active === key ? SELECTED_COLOR_CLASS : ""}`}
                            key={key}
                            onClick={onClick(key)}>
                            {MY_SANDBOXES[key]}

                            <Tooltip content={"remove"} className={"text-xs"}>
                                <RemoveIcon size={18}
                                            onClick={onRemove(key)}
                                            className={`opacity-80 ${sandboxes.length === lowerLimit ? BUTTON_INACTIVE : ICON_BUTTON_CLASS}`}/>
                            </Tooltip>
                        </Dropdown.Item>
                    )
                })
            }
            <Dropdown.Divider/>

            <Dropdown.Item
                onClick={sandboxes.length >= upperLimit ? undefined : addSandbox}
                className={`flex justify-center ${sandboxes.length >= upperLimit ? BUTTON_INACTIVE : ""}`}>
                <Tooltip content={`New (up to ${upperLimit})`} className={"text-xs"} placement={"bottom"}>
                    <AddIcon size={20}/>
                </Tooltip>
            </Dropdown.Item>
        </Dropdown>
    )
}
