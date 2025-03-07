import {Dropdown, Label, Select, ThemeMode} from "flowbite-react";
import {VscSettings as SettingsIcon} from "react-icons/vsc";
import {MdTextDecrease as TextDecreaseIcon, MdTextIncrease as TextIncreaseIcon} from "react-icons/md";
import {FONT_SIZE_L, FONT_SIZE_S} from "../constants.ts";
import {getActiveColor} from "../utils.ts";
import {ChangeEventHandler, MouseEvent} from "react";
import {KeyBindings} from "../types";

export default function Component(props: {
    // for editor fontSize
    fontSize: number;
    themeMode: ThemeMode;
    onFontSizeUp: () => void;
    onFontSizeDown: () => void;
    // for keyBindings
    keyBindings: KeyBindings;
    onKeyBindingsChange: ChangeEventHandler<HTMLSelectElement>;
}) {
    const {keyBindings, fontSize, themeMode, onFontSizeUp, onFontSizeDown, onKeyBindingsChange} = props;
    const layoutClasses = "cursor-auto flex justify-between items-center gap-6";
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

                <div className={"flex gap-4 items-center"}>
                    <TextDecreaseIcon color={fontSize === FONT_SIZE_S ? getActiveColor(themeMode) : ""}
                                      onClick={onFontSizeDown} className={"cursor-pointer hover:opacity-50 text-lg"}/>
                    <TextIncreaseIcon color={fontSize === FONT_SIZE_L ? getActiveColor(themeMode) : ""}
                                      onClick={onFontSizeUp} className={"cursor-pointer hover:opacity-50 text-xl"}/>
                </div>
            </Dropdown.Item>

            <Dropdown.Item as={"div"} className={layoutClasses}>
                <Label htmlFor="countries" value="Key Bindings"/>

                <Select defaultValue={keyBindings} onChange={onKeyBindingsChange} onClick={handleSelectClick} sizing={"sm"} id="countries">
                    <option value={""}>None</option>
                    <option value={"vim"}>VIM</option>
                    <option value={"emacs"}>Emacs</option>
                </Select>
            </Dropdown.Item>
        </Dropdown>
    );
}
