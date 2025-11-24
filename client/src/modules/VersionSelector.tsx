import {Dropdown} from "flowbite-react";
import {GO_VERSION_MAP, INACTIVE_TEXT_CLASS, SELECTED_COLOR_CLASS} from "../constants.ts";
import {useContext} from "react";
import {AppCtx} from "../utils.ts";

export default function Component() {
    const {isRunning, goVersion, updateGoVersion} = useContext(AppCtx)

    function onGoVersion(v: string) {
        return () => {
            if (v !== goVersion) {
                updateGoVersion(v);
            }
        }
    }

    return (
        <Dropdown
            inline={true} className={"z-20"} disabled={true} color={"light"} size={"xs"}
            label={
                <span className={`text-sm ${isRunning ? INACTIVE_TEXT_CLASS : ""}`}>
                    {GO_VERSION_MAP[goVersion]}
                </span>
            }
        >
            {
                Object.keys(GO_VERSION_MAP).map((id) => (
                    <Dropdown.Item className={goVersion === id ? SELECTED_COLOR_CLASS : ""}
                                   key={id}
                                   onClick={onGoVersion(id)}>
                        {GO_VERSION_MAP[id]}
                    </Dropdown.Item>
                ))
            }
        </Dropdown>
    )
}
