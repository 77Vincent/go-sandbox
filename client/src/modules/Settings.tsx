import {DarkThemeToggle, Dropdown, Label, Select, useThemeMode} from "flowbite-react";
import {ChangeEventHandler, MouseEvent} from "react";

import {
    VscSettingsGear as SettingsIcon,
    VscLayoutSidebarRight as LayoutHorizontalIcon,
    VscLayoutPanel as LayoutVerticalIcon,
} from "react-icons/vsc";
import {
    MdTextDecrease as TextSIcon,
    MdTextIncrease as TextLIcon,
} from "react-icons/md";
import {ImTextColor as TextMIcon} from "react-icons/im"

import {ACTIVE_COLOR, FONT_SIZE_L, FONT_SIZE_M, FONT_SIZE_S, LANGUAGES, TRANSLATE} from "../constants.ts";
import {KeyBindings, languages} from "../types";
import {ToggleSwitch} from "./Common.tsx";

const activeClasses = "cursor-pointer hover:opacity-50";

export default function Component(props: {
    disabled?: boolean;
    lan: languages;
    onLanguageChange: ChangeEventHandler<HTMLSelectElement>;
    // for layout
    isVerticalLayout: boolean;
    setIsVerticalLayout: () => void;
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

        // for layout
        isVerticalLayout,
        setIsVerticalLayout,

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
    const {mode} = useThemeMode();

    return (
        <Dropdown disabled={disabled} className={"z-20"} size={"xs"} dismissOnClick={false} color={"auto"}
                  arrowIcon={false} label={
            <SettingsIcon
                className={"cursor-pointer text-lg text-gray-700 hover:opacity-50 dark:text-gray-300"}/>
        }>
            <Dropdown.Header>
                <p className={"font-semibold"}>{TRANSLATE.settings[lan]}</p>
            </Dropdown.Header>

            <Dropdown.Item className={layoutClasses}>
                <span>{TRANSLATE.autoRun[lan]}</span>

                <ToggleSwitch checked={isAutoRun} onChange={onAutoRun}/>
            </Dropdown.Item>

            <Dropdown.Item className={layoutClasses}>
                <span>{TRANSLATE.lint[lan]}</span>

                <ToggleSwitch checked={isLintOn} onChange={onLint}/>
            </Dropdown.Item>

            <Dropdown.Item className={layoutClasses}>
                <span>{TRANSLATE.showInvisible[lan]}</span>

                <ToggleSwitch checked={isShowInvisible} onChange={onShowInvisible}/>
            </Dropdown.Item>
            <Dropdown.Divider/>

            <Dropdown.Item className={layoutClasses}>
                <span>{TRANSLATE.fontSize[lan]}</span>

                <div className={"flex items-center gap-3"}>
                    <TextSIcon color={fontSize === FONT_SIZE_S ? ACTIVE_COLOR : ""}
                               onClick={onFontS} className={`${activeClasses} text-lg`}/>
                    <TextMIcon color={fontSize === FONT_SIZE_M ? ACTIVE_COLOR : ""}
                               onClick={onFontM} className={`${activeClasses} text-xl`}/>
                    <TextLIcon color={fontSize === FONT_SIZE_L ? ACTIVE_COLOR : ""}
                               onClick={onFontL} className={`${activeClasses} text-2xl`}/>
                </div>
            </Dropdown.Item>

            <Dropdown.Item className={layoutClasses}>
                <span>{TRANSLATE.layout[lan]}</span>

                <div className={"flex items-center gap-3"}>
                    <LayoutHorizontalIcon color={!isVerticalLayout ? ACTIVE_COLOR : ""}
                                          onClick={setIsVerticalLayout} className={activeClasses}/>
                    <LayoutVerticalIcon color={isVerticalLayout ? ACTIVE_COLOR : ""}
                                        onClick={setIsVerticalLayout} className={activeClasses}/>
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

            <Dropdown.Divider/>

            <Dropdown.Item className={layoutClasses}>
                <span>{TRANSLATE.theme[lan]} / {mode}</span>

                <DarkThemeToggle/>
            </Dropdown.Item>
        </Dropdown>
    );
}
