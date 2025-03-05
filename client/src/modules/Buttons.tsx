import {Button, Tooltip} from "flowbite-react";

export function FormatButton(props: {
    format: () => Promise<void>
    disabled?: boolean
}) {
    const {format, disabled} = props;

    return <Tooltip content={
        <div className={"flex gap-1 items-center"}> Format code </div>
    }>
        <Button onClick={format} disabled={disabled} className={"shadow"} size={"xs"} gradientMonochrome={"info"}>
            Format
        </Button>
    </Tooltip>
}
