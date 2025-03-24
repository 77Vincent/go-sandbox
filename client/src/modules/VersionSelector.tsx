import {Dropdown} from "flowbite-react";
import {SANDBOX_VERSIONS} from "../constants.ts";

export default function Component(props: {
    isRunning: boolean,
    version: string,
    onSelect: (id: string) => void
}) {
    const {onSelect, isRunning, version} = props;

    return (
        <Dropdown disabled={isRunning} color={"light"} size={"xs"} label={version}>
            {
                Object.keys(SANDBOX_VERSIONS).map((id) => (
                    <Dropdown.Item key={id} onClick={() => onSelect(id)}>
                        {SANDBOX_VERSIONS[id]}
                    </Dropdown.Item>
                ))
            }
        </Dropdown>
    )
}
