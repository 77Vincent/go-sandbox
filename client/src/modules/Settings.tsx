import {DarkThemeToggle, Label, Modal, Select, useThemeMode} from "flowbite-react";
import {ChangeEventHandler, MouseEvent, ReactNode} from "react";

import {
    VscLayoutSidebarRight as LayoutHorizontalIcon,
    VscLayoutPanel as LayoutVerticalIcon,
} from "react-icons/vsc";
import {
    MdTextDecrease as TextSIcon,
    MdTextIncrease as TextLIcon,
} from "react-icons/md";
import {ImTextColor as TextMIcon} from "react-icons/im"

import {
    ACTIVE_COLOR,
    FONT_SIZE_L,
    FONT_SIZE_M,
    FONT_SIZE_S,
    LANGUAGES,
    TRANSLATE
} from "../constants.ts";
import {KeyBindings, languages} from "../types";
import {Divider, ToggleSwitch} from "./Common.tsx";

const activeClasses = "cursor-pointer hover:opacity-50";

function Grid(props: {
    children: ReactNode;
}) {
    return <div className={"grid grid-cols-2 gap-x-10 gap-y-4"}>
        {props.children}
    </div>
}

function Row(props: {
    children: ReactNode;
}) {
    return <div className={"flex items-center justify-between"}>
        {props.children}
    </div>
}

export default function Component(props: {
    show: boolean;
    setShow: (show: boolean) => void;

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
    const {mode} = useThemeMode()
    const {
        // for key bindings
        keyBindings, onKeyBindingsChange,

        // for language
        lan, onLanguageChange,

        // for layout
        isVerticalLayout, setIsVerticalLayout,

        // for font size
        fontSize, onFontL, onFontS, onFontM,

        // for lint
        isLintOn, onLint,

        // for auto run
        isAutoRun, onAutoRun,

        // for show invisible characters
        isShowInvisible, onShowInvisible,

        // for modal
        show, setShow,
    } = props;
    const handleSelectClick = (e: MouseEvent<HTMLSelectElement>) => {
        e.stopPropagation();
    };

    return (
        <>
            <Modal dismissible show={show} onClose={() => setShow(false)}>
                <Modal.Header>
                    {TRANSLATE.settings[lan]}
                </Modal.Header>

                <Modal.Body>
                    <Grid>
                        <Row>
                            <Label value={TRANSLATE.autoRun[lan]}/>
                            <ToggleSwitch checked={isAutoRun} onChange={onAutoRun}/>
                        </Row>

                        <Row>
                            <Label value={TRANSLATE.showInvisible[lan]}/>
                            <ToggleSwitch checked={isShowInvisible} onChange={onShowInvisible}/>
                        </Row>

                        <Row>
                            <Label value={TRANSLATE.lint[lan]}/>
                            <ToggleSwitch checked={isLintOn} onChange={onLint}/>
                        </Row>
                    </Grid>

                    <Divider horizontal={true} className={"my-4"}/>

                    <Grid>
                        <Row>
                            <Label value={TRANSLATE.fontSize[lan]}/>
                            <div className={"flex items-center gap-3"}>
                                <TextSIcon color={fontSize === FONT_SIZE_S ? ACTIVE_COLOR : ""}
                                           onClick={onFontS} className={`${activeClasses} text-lg`}/>
                                <TextMIcon color={fontSize === FONT_SIZE_M ? ACTIVE_COLOR : ""}
                                           onClick={onFontM} className={`${activeClasses} text-xl`}/>
                                <TextLIcon color={fontSize === FONT_SIZE_L ? ACTIVE_COLOR : ""}
                                           onClick={onFontL} className={`${activeClasses} text-2xl`}/>
                            </div>
                        </Row>

                        <Row>
                            <Label value={TRANSLATE.layout[lan]}/>
                            <div className={"flex items-center gap-3"}>
                                <LayoutHorizontalIcon color={!isVerticalLayout ? ACTIVE_COLOR : ""}
                                                      onClick={setIsVerticalLayout} className={activeClasses}/>
                                <LayoutVerticalIcon color={isVerticalLayout ? ACTIVE_COLOR : ""}
                                                    onClick={setIsVerticalLayout} className={activeClasses}/>
                            </div>
                        </Row>
                    </Grid>

                    <Divider horizontal={true} className={"my-4"}/>

                    <Grid>
                        <Row>
                            <Label htmlFor="keyBindings" value={TRANSLATE.keyBindings[lan]}/>
                            <Select defaultValue={keyBindings} onChange={onKeyBindingsChange}
                                    onClick={handleSelectClick}
                                    sizing={"sm"} id="keyBindings">
                                <option value={""}>None</option>
                                <option value={"vim"}>VIM</option>
                                <option value={"emacs"}>Emacs</option>
                            </Select>
                        </Row>

                        <Row>
                            <Label htmlFor="language" value={TRANSLATE.language[lan]}/>
                            <Select defaultValue={lan} onChange={onLanguageChange} onClick={handleSelectClick}
                                    sizing={"sm"} id="language">
                                {
                                    LANGUAGES.map(({value, label}) => {
                                        return <option key={value} value={value}>{label}</option>
                                    })
                                }
                            </Select>
                        </Row>
                    </Grid>

                    <Divider horizontal={true} className={"my-4"}/>

                    <Grid>
                        <div className={"flex items-center justify-between"}>
                            <Label value={`${TRANSLATE.theme[lan]} / ${mode}`}/>
                            <DarkThemeToggle/>
                        </div>
                    </Grid>
                </Modal.Body>
            </Modal>
        </>
    );
}
