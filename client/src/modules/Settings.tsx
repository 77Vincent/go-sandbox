import {Dropdown, Label, Select, Tooltip} from "flowbite-react";
import {ChangeEventHandler, MouseEvent} from "react";

import {VscSettingsGear as SettingsIcon} from "react-icons/vsc";
import {
    MdTextDecrease as TextSIcon,
    MdTextIncrease as TextLIcon,
} from "react-icons/md";
import {ImTextColor as TextMIcon} from "react-icons/im"

import {FONT_SIZE_L, FONT_SIZE_M, FONT_SIZE_S, LANGUAGES, TRANSLATE} from "../constants.ts";
import {KeyBindings, languages} from "../types";
import {ToggleSwitch} from "./Common.tsx";

export default function Component(props: {
    disabled?: boolean;
    lan: languages;
    onLanguageChange: ChangeEventHandler<HTMLSelectElement>;
    // for editor fontSize
    fontSize: number;
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
    // for show invisible characters
    isShowInvisible: boolean;
    onShowInvisible: () => void;
}) {
    const {
        disabled,
        // for key bindings
        keyBindings,
        onKeyBindingsChange,

        // for language
        lan,
        onLanguageChange,

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

        // for show invisible characters
        isShowInvisible,
        onShowInvisible,
    } = props;
    const layoutClasses = "cursor-auto flex justify-between items-center gap-8";
    const handleSelectClick = (e: MouseEvent<HTMLSelectElement>) => {
        e.stopPropagation();
    };

    return (
        <Dropdown disabled={disabled} className={"z-20"} size={"xs"} dismissOnClick={false} color={"auto"}
                  arrowIcon={false} label={
            <SettingsIcon
                className={"text-gray-700 dark:text-gray-300 text-lg cursor-pointer hover:opacity-50"}/>
        }>
            <Dropdown.Header>
                <p className={"font-semibold"}> Settings </p>
            </Dropdown.Header>

            <Dropdown.Item className={layoutClasses}>
                <Tooltip content={"Auto run code on change"}>
                    <span>{TRANSLATE.autoRun[lan]}</span>
                </Tooltip>

                <ToggleSwitch checked={isAutoRun} onChange={onAutoRun}/>
            </Dropdown.Item>

            <Dropdown.Item className={layoutClasses}>
                <Tooltip content={"Lint while typing"}>
                    <span>{TRANSLATE.lint[lan]}</span>
                </Tooltip>

                <ToggleSwitch checked={isLintOn} onChange={onLint}/>
            </Dropdown.Item>

            <Dropdown.Item className={layoutClasses}>
                <Tooltip content={"Show invisible characters"}>
                    <span>{TRANSLATE.showInvisible[lan]}</span>
                </Tooltip>

                <ToggleSwitch checked={isShowInvisible} onChange={onShowInvisible}/>
            </Dropdown.Item>
            <Dropdown.Divider/>

            <Dropdown.Item className={layoutClasses}>
                <span>{TRANSLATE.fontSize[lan]}</span>

                <div className={"flex gap-3 items-center"}>
                    <TextSIcon color={fontSize === FONT_SIZE_S ? "cyan" : ""}
                               onClick={onFontS} className={"cursor-pointer hover:opacity-50 text-lg"}/>
                    <TextMIcon color={fontSize === FONT_SIZE_M ? "cyan" : ""}
                               onClick={onFontM} className={"cursor-pointer hover:opacity-50 text-xl"}/>
                    <TextLIcon color={fontSize === FONT_SIZE_L ? "cyan" : ""}
                               onClick={onFontL} className={"cursor-pointer hover:opacity-50 text-2xl"}/>
                </div>
            </Dropdown.Item>

            <Dropdown.Divider/>

            <Dropdown.Item className={layoutClasses}>
                <Label className={"font-normal"} htmlFor="keyBindings" value={TRANSLATE.keyBindings[lan]}/>

                <Select defaultValue={keyBindings} onChange={onKeyBindingsChange} onClick={handleSelectClick}
                        sizing={"sm"} id="keyBindings">
                    <option value={""}>None</option>
                    <option value={"vim"}>VIM</option>
                    <option value={"emacs"}>Emacs</option>
                </Select>
            </Dropdown.Item>

            <Dropdown.Item className={layoutClasses}>
                <Label className={"font-normal"} htmlFor="language" value={TRANSLATE.language[lan]}/>

                <Select defaultValue={lan} onChange={onLanguageChange} onClick={handleSelectClick}
                        sizing={"sm"} id="language">
                    {
                        LANGUAGES.map(({value, label}) => {
                            return <option key={value} value={value}>{label}</option>
                        })
                    }
                </Select>
            </Dropdown.Item>
        </Dropdown>
    );
}
