import {Dropdown, Label, Select, ThemeMode} from "flowbite-react";
import {VscSettings as SettingsIcon} from "react-icons/vsc";
import {ChangeEventHandler, MouseEvent} from "react";
import {
    MdTextDecrease as TextSIcon,
    MdTextIncrease as TextLIcon,
} from "react-icons/md";
import {ImTextColor as TextMIcon} from "react-icons/im"

import {FONT_SIZE_L, FONT_SIZE_M, FONT_SIZE_S} from "../constants.ts";
import {getActiveColor} from "../utils.ts";
import {KeyBindings} from "../types";

export default function Component(props: {
    // for editor fontSize
    fontSize: number;
    themeMode: ThemeMode;
    onFontL: () => void;
    onFontS: () => void;
    onFontM: () => void;
    // for keyBindings
    keyBindings: KeyBindings;
    onKeyBindingsChange: ChangeEventHandler<HTMLSelectElement>;
}) {
    const {keyBindings, fontSize, themeMode, onFontL, onFontS, onFontM, onKeyBindingsChange} = props;
    const layoutClasses = "cursor-auto flex justify-between items-center gap-7";
    const handleSelectClick = (e: MouseEvent<HTMLSelectElement>) => {
        e.stopPropagation();
    };
    console.log("fontSize", keyBindings);

    return (
        <Dropdown size={"xs"} dismissOnClick={false} color={"auto"} arrowIcon={false} label={
            <SettingsIcon color={"gray"} className={"text-base cursor-pointer hover:opacity-50"}/>
        }>
            <Dropdown.Header className={"font-light text-neutral-700"}>
                Settings
            </Dropdown.Header>

            <Dropdown.Item as={"div"} className={layoutClasses}>
                <span className={"font-semibold"}>Font Size</span>

                <div className={"flex gap-3 items-center"}>
                    <TextSIcon color={fontSize === FONT_SIZE_S ? getActiveColor(themeMode) : ""}
                               onClick={onFontS} className={"cursor-pointer hover:opacity-50 text-lg"}/>
                    <TextMIcon color={fontSize === FONT_SIZE_M ? getActiveColor(themeMode) : ""}
                               onClick={onFontM} className={"cursor-pointer hover:opacity-50 text-xl"}/>
                    <TextLIcon color={fontSize === FONT_SIZE_L ? getActiveColor(themeMode) : ""}
                               onClick={onFontL} className={"cursor-pointer hover:opacity-50 text-2xl"}/>
                </div>
            </Dropdown.Item>

            <Dropdown.Item as={"div"} className={layoutClasses}>
                <Label htmlFor="countries" value="Key Bindings"/>

                <Select defaultValue={keyBindings} onChange={onKeyBindingsChange} onClick={handleSelectClick}
                        sizing={"sm"} id="countries">
                    <option value={""}>None</option>
                    <option value={"vim"}>VIM</option>
                    <option value={"emacs"}>Emacs</option>
                </Select>
            </Dropdown.Item>
        </Dropdown>
    );
}
