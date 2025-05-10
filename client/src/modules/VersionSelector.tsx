import {Dropdown} from "flowbite-react";
import {GO_VERSION_MAP} from "../constants.ts";
import {useContext} from "react";
import {AppCtx} from "../utils.ts";

export default function Component() {
    const {goVersion} = useContext(AppCtx)

    return (
        <Dropdown inline={true} arrowIcon={false} disabled={true} color={"light"} size={"xs"}
                  label={<span className={"text-xs"}> {GO_VERSION_MAP[goVersion]} </span>}
        >
        </Dropdown>
    )
}
