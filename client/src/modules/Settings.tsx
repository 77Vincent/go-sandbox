import {DarkThemeToggle, Dropdown, Label, Modal, useThemeMode} from "flowbite-react";
import {ReactNode} from "react";

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
    FONT_SIZE_S, keyBindingsMap,
    LANGUAGES,
    TRANSLATE
} from "../constants.ts";
import {KeyBindingsType, languages} from "../types";
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
    onLanguageChange: (id: languages) => void;
    // for layout
    isVerticalLayout: boolean;
    setIsVerticalLayout: () => void;
    // for editor fontSize
    fontSize: number;
    onFontL: () => void;
    onFontS: () => void;
    onFontM: () => void;
    // for keyBindings
    keyBindings: KeyBindingsType;
    onKeyBindingsChange: (id: KeyBindingsType) => void;
    // for lint
    isLintOn: boolean;
    onLint: () => void;
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

        // for show invisible characters
        isShowInvisible, onShowInvisible,

        // for modal
        show, setShow,
    } = props;

    function onKeyBinding(id: KeyBindingsType) {
        return () => {
            if (id !== keyBindings) {
                onKeyBindingsChange(id);
            }
        }
    }

    function onLanguage(id: languages) {
        return () => {
            if (id !== lan) {
                onLanguageChange(id);
            }
        }
    }

    return (
        <>
            <Modal dismissible show={show} onClose={() => setShow(false)}>
                <Modal.Header>
                    {TRANSLATE.settings[lan]}
                </Modal.Header>

                <Modal.Body>
                    <Grid>
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
                            <Dropdown color={"light"} label={keyBindingsMap[keyBindings]} size={"xs"} id="keyBindings">
                                <Dropdown.Item value={""} onClick={onKeyBinding("")}>None</Dropdown.Item>
                                <Dropdown.Item value={"vim"} onClick={onKeyBinding("vim")}>VIM</Dropdown.Item>
                                <Dropdown.Item value={"emacs"} onClick={onKeyBinding("emacs")}>Emacs</Dropdown.Item>
                            </Dropdown>
                        </Row>

                        <Row>
                            <Label htmlFor="language" value={TRANSLATE.language[lan]}/>
                            <Dropdown color={"light"} label={LANGUAGES.filter((v) => v.value === lan)[0].label}
                                      size={"xs"} id="keyBindings">
                                {
                                    LANGUAGES.map(({value, label}) => {
                                        return <Dropdown.Item key={value} onClick={onLanguage(value)}>
                                            {label}
                                        </Dropdown.Item>
                                    })
                                }
                            </Dropdown>
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
