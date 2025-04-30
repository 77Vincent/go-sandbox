import {languages, mySandboxes} from "../types";
import {
    BUTTON_INACTIVE,
    DEFAULT_ACTIVE_SANDBOX,
    HELLO_WORLD,
    ICON_BUTTON_CLASS,
    MY_SANDBOXES, SANDBOX_NAMES_KEY,
    SELECTED_COLOR_CLASS, TRANSLATE
} from "../constants.ts";

import {MdOutlineAdd as AddIcon, MdOutlineEdit as EditButton} from "react-icons/md";
import {IoMdRemoveCircleOutline as RemoveIcon} from "react-icons/io";

import {Dropdown, Tooltip} from "flowbite-react";
import {MouseEventHandler, useEffect, useRef, useState} from "react";
import {getSandboxes, getSandboxesNames} from "../utils.ts";

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
    lan: languages,
    isRunning: boolean,
    active: mySandboxes,
    onSelect: (id: mySandboxes) => void
}) {
    const {isRunning, active, onSelect, lan} = props;
    const [sandboxes, setSandboxes] = useState(getSandboxes())
    const [sandboxNames, setSandboxNames] = useState(getSandboxesNames());
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
                // update state
                setSandboxes(next);
                setSandboxNames((prev) => ({
                    ...prev,
                    [id]: ""
                }))
                // update local storage
                // remove sandbox
                localStorage.removeItem(id);
                // remove name mappings
                localStorage.setItem(SANDBOX_NAMES_KEY, JSON.stringify({
                    ...sandboxNames,
                    [id]: ""
                }))
                // select next sandbox if available
                if (next.length > 0) {
                    onSelect(next[0]);
                }
            }
        }
    }

    const onRename = (id: mySandboxes): MouseEventHandler<SVGAElement> => {
        return (e) => {
            e.stopPropagation();
            const newName = prompt("Enter new name", sandboxNames[id]) || sandboxNames[id];
            localStorage.setItem(SANDBOX_NAMES_KEY, JSON.stringify({
                ...sandboxNames,
                [id]: newName
            }));
            setSandboxNames((prev) => ({
                ...prev,
                [id]: newName
            }))
        }
    }

    useEffect(() => {
        sandboxesRef.current = sandboxes;
    }, [sandboxes]);

    return (
        <Dropdown inline={true} className={"z-20"} disabled={isRunning} color={"light"} size={"xs"}
                  label={<span className={"text-xs"}>{sandboxNames[active] || MY_SANDBOXES[active] || active}</span>}
        >
            {
                sandboxes.map((key) => {
                    return (
                        <Dropdown.Item
                            className={`flex items-center justify-between gap-3 ${active === key ? SELECTED_COLOR_CLASS : ""}`}
                            key={key}
                            onClick={onClick(key)}>
                            {sandboxNames[key] || MY_SANDBOXES[key]}

                            <div className={"flex gap-1.5"}>
                                <Tooltip content={TRANSLATE.rename[lan]} className={"text-xs"}>
                                    <EditButton size={18}
                                                onClick={onRename(key)}
                                                className={`opacity-80 ${ICON_BUTTON_CLASS}`}/>
                                </Tooltip>

                                <Tooltip content={TRANSLATE.remove[lan]} className={"text-xs"}>
                                    <RemoveIcon size={18}
                                                onClick={onRemove(key)}
                                                className={`opacity-80 ${sandboxes.length === lowerLimit ? BUTTON_INACTIVE : ICON_BUTTON_CLASS}`}/>
                                </Tooltip>
                            </div>
                        </Dropdown.Item>
                    )
                })
            }
            <Dropdown.Divider/>

            <Dropdown.Item
                onClick={sandboxes.length >= upperLimit ? undefined : addSandbox}
                className={`flex justify-center ${sandboxes.length >= upperLimit ? BUTTON_INACTIVE : ""}`}>
                <Tooltip content={`${TRANSLATE.new[lan]} (${sandboxes.length}/${upperLimit})`} className={"text-xs"}
                         placement={"bottom"}>
                    <AddIcon size={20}/>
                </Tooltip>
            </Dropdown.Item>
        </Dropdown>
    )
}
