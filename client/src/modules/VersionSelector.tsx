import {Dropdown} from "flowbite-react";
import {SELECTED_COLOR_CLASS, SANDBOX_VERSIONS} from "../constants.ts";

export default function Component(props: {
    isRunning: boolean,
    version: string,
    onSelect: (id: string) => void
}) {
    const {onSelect, isRunning, version} = props;

    function onClick(id: string) {
        return () => {
            if (id !== version) {
                onSelect(id);
            }
        }
    }

    return (
        <Dropdown disabled={isRunning} color={"light"} size={"xs"} label={SANDBOX_VERSIONS[version]}>
            {
                Object.keys(SANDBOX_VERSIONS).map((id) => (
                    <Dropdown.Item className={version === id ? SELECTED_COLOR_CLASS : ""} key={id} onClick={onClick(id)}>
                        {SANDBOX_VERSIONS[id]}
                    </Dropdown.Item>
                ))
            }
        </Dropdown>
    )
}
