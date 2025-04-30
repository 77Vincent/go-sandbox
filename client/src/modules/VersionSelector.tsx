import {Dropdown} from "flowbite-react";
import {SELECTED_COLOR_CLASS, GO_VERSION_MAP} from "../constants.ts";

export default function Component(props: {
    isRunning: boolean,
    version: string,
    onSelect: (id: string) => void
}) {
    const {onSelect, version} = props;

    function onClick(id: string) {
        return () => {
            if (id !== version) {
                onSelect(id);
            }
        }
    }

    return (
        <Dropdown inline={true} arrowIcon={false} disabled={true} color={"light"} size={"xs"}
                  label={<span className={"text-xs"}> {GO_VERSION_MAP[version]} </span>}
        >
            {
                Object.keys(GO_VERSION_MAP).map((id) => (
                    <Dropdown.Item className={version === id ? SELECTED_COLOR_CLASS : ""} key={id}
                                   onClick={onClick(id)}>
                        {GO_VERSION_MAP[id]}
                    </Dropdown.Item>
                ))
            }
        </Dropdown>
    )
}
