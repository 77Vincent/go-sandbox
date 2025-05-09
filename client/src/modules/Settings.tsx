import {DarkThemeToggle, Dropdown, Label, Modal, useThemeMode} from "flowbite-react";

import {
    ACTIVE_COLOR,
    FONT_SIZE_L,
    FONT_SIZE_M,
    FONT_SIZE_S, GO_VERSION_KEY, GO_VERSION_MAP, INACTIVE_TEXT_CLASS,
    keyBindingsMap, LANGUAGE_KEY,
    SELECTED_COLOR_CLASS
} from "../constants.ts";
import {KeyBindingsType, languages} from "../types";
import {Divider, Grid, Row, ToggleSwitch} from "./Common.tsx";
import {LANGUAGES, TRANSLATE} from "../lib/i18n.ts";
import {LayoutHorizontalIcon, LayoutVerticalIcon, TextLIcon, TextMIcon, TextSIcon} from "./Icons.tsx";
import {useContext} from "react";
import {AppCtx} from "../utils.ts";

const activeClasses = "cursor-pointer hover:opacity-50";

export default function Component(props: {
    show: boolean;
    setShow: (show: boolean) => void;

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
    // for auto completion
    isAutoCompletionOn: boolean;
    onAutoCompletion: () => void;
}) {
    const {lan, setLan, goVersion} = useContext(AppCtx)
    const {mode} = useThemeMode()
    const {
        // for key bindings
        keyBindings, onKeyBindingsChange,

        // for layout
        isVerticalLayout, setIsVerticalLayout,

        // for font size
        fontSize, onFontL, onFontS, onFontM,

        // for lint
        isLintOn, onLint,

        // for auto completion
        isAutoCompletionOn, onAutoCompletion,

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
                localStorage.setItem(LANGUAGE_KEY, id);
                setLan(id)
            }
        }
    }

    function onGoVersion(id: string) {
        return () => {
            if (id !== goVersion) {
                localStorage.setItem(GO_VERSION_KEY, goVersion);
                location.reload()
            }
        }
    }

    return (
        <>
            <Modal size={"3xl"} dismissible show={show} onClose={() => setShow(false)}>
                <Modal.Header>
                    {TRANSLATE.settings[lan]}
                </Modal.Header>

                <Modal.Body>
                    <Grid>
                        <Row>
                            <Label value={TRANSLATE.lint[lan]}/>
                            <ToggleSwitch checked={isLintOn} onChange={onLint}/>
                        </Row>

                        <Row>
                            <Label value={TRANSLATE.autoCompletion[lan]}/>
                            <ToggleSwitch checked={isAutoCompletionOn} onChange={onAutoCompletion}/>
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
                            <Dropdown className={"max-h-72 overflow-auto"} color={"light"}
                                      label={LANGUAGES.filter((v) => v.value === lan)[0].label}
                                      size={"xs"} id="keyBindings">
                                {
                                    LANGUAGES
                                        .sort((a, b) => a.label.localeCompare(b.label))
                                        .map(({value, label}) => {
                                            return <Dropdown.Item key={value} onClick={onLanguage(value)}
                                                                  className={`${value === lan ? SELECTED_COLOR_CLASS : ""}`}>
                                                {label}
                                            </Dropdown.Item>
                                        })
                                }
                            </Dropdown>
                        </Row>
                    </Grid>

                    <Divider horizontal={true} className={"my-4"}/>

                    <Grid>
                        <Row>
                            <Label htmlFor="language" value={TRANSLATE.goVersion[lan]}/>
                            <span className={`text-xs ${INACTIVE_TEXT_CLASS}`}> {TRANSLATE.comingSoon[lan]} </span>
                            <Dropdown disabled={true} color={"light"} size={"xs"}
                                      label={<span className={"text-xs"}> {GO_VERSION_MAP[goVersion]} </span>}
                            >
                                {
                                    Object.keys(GO_VERSION_MAP).map((id) => (
                                        <Dropdown.Item className={goVersion === id ? SELECTED_COLOR_CLASS : ""}
                                                       key={id}
                                                       onClick={onGoVersion(id)}>
                                            {GO_VERSION_MAP[id]}
                                        </Dropdown.Item>
                                    ))
                                }
                            </Dropdown>
                        </Row>

                        <Row>
                            <Label value={`${TRANSLATE.theme[lan]} / ${mode}`}/>
                            <DarkThemeToggle/>
                        </Row>
                    </Grid>
                </Modal.Body>
            </Modal>
        </>
    );
}
