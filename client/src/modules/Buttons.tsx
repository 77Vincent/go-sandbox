import {Button, Tooltip} from "flowbite-react";
import {MdKeyboardCommandKey, MdKeyboardOptionKey} from "react-icons/md";

export function FormatButton(props: {
    format: () => Promise<void>
}) {
    const {format} = props;

    return <Tooltip content={
        <div className={"flex gap-1 items-center"}>
            Format code:
            <MdKeyboardOptionKey size={14} className={"inline"}/>
            <MdKeyboardCommandKey size={14} className={"inline"}/>
            <kbd>L</kbd>
        </div>
    }>
        <Button onClick={format} disabled={false} className={"shadow"} size={"xs"} gradientMonochrome={"lime"}>
            Format
        </Button>
    </Tooltip>
}
