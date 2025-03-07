import {Dropdown, Label, Select, ThemeMode, Tooltip} from "flowbite-react";
import {ChangeEventHandler, MouseEvent} from "react";

import {VscSettingsGear as SettingsIcon} from "react-icons/vsc";
import {
    MdTextDecrease as TextSIcon,
    MdTextIncrease as TextLIcon,
} from "react-icons/md";
import {ImTextColor as TextMIcon} from "react-icons/im"

import {FONT_SIZE_L, FONT_SIZE_M, FONT_SIZE_S} from "../constants.ts";
import {getActiveColor} from "../utils.ts";
import {KeyBindings} from "../types";
import {ToggleSwitch} from "./Common.tsx";

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
    // for lint
    isLintOn: boolean;
    onLint: () => void;
    // for auto run
    isAutoRun: boolean;
    onAutoRun: () => void;
}) {
    const {
        // for key bindings
        keyBindings,
        themeMode,
        onKeyBindingsChange,

        // for font size
        fontSize,
        onFontL,
        onFontS,
        onFontM,

        // for lint
        isLintOn,
        onLint,

        // for auto run
        isAutoRun,
        onAutoRun,
    } = props;
    const layoutClasses = "cursor-auto flex justify-between items-center gap-7";
    const handleSelectClick = (e: MouseEvent<HTMLSelectElement>) => {
        e.stopPropagation();
    };

    return (
        <Dropdown size={"xs"} dismissOnClick={false} color={"auto"} arrowIcon={false} label={
            <SettingsIcon className={"text-neutral-600 dark:text-neutral-400 text-lg cursor-pointer hover:opacity-50"}/>
        }>
            <Dropdown.Item className={layoutClasses}>
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

            <Dropdown.Divider/>

            <Dropdown.Item className={layoutClasses}>
                <Label className={"font-semibold"} htmlFor="countries" value="Key Bindings"/>

                <Select defaultValue={keyBindings} onChange={onKeyBindingsChange} onClick={handleSelectClick}
                        sizing={"sm"} id="countries">
                    <option value={""}>None</option>
                    <option value={"vim"}>VIM</option>
                    <option value={"emacs"}>Emacs</option>
                </Select>
            </Dropdown.Item>

            <Dropdown.Divider/>

            <Dropdown.Item className={layoutClasses}>
                <Tooltip content={"Lint while typing"}>
                    <span className={"font-semibold"}>Lint</span>
                </Tooltip>

                <ToggleSwitch checked={isLintOn} onChange={onLint}/>
            </Dropdown.Item>

            <Dropdown.Divider/>

            <Dropdown.Item className={layoutClasses}>
                <Tooltip content={"Auto run code on change"}>
                    <span className={"font-semibold"}>Auto Run</span>
                </Tooltip>

                <ToggleSwitch checked={isAutoRun} onChange={onAutoRun}/>
            </Dropdown.Item>
        </Dropdown>
    );
}
