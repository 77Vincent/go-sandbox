import {Modal} from "flowbite-react";

import {languages} from "../types";
import {
    MetaKey,
    Row,
    Grid,
    Divider,
    ShiftKey,
    OptionKey,
    CtrlKey,
    EnterKey,
    RunICon,
} from "./Common.tsx";
import {ReactNode} from "react";
import {TRANSLATE} from "../lib/i18n.ts";
import {DEFAULT_LANGUAGE} from "../constants.ts";
import {FormatIcon, ManualIcon, SearchIcon, SettingsIcon, ShareIcon} from "./Icons.tsx";


function SubRow(props: {
    children: ReactNode,
}) {
    return <div className={"flex items-center gap-0.5 max-md:text-xs"}>
        {props.children}
    </div>
}

function Title(props: {
    children: ReactNode,
}) {
    return <div className={"flex items-center gap-1 text-sm max-md:text-xs"}>
        {props.children}
    </div>
}

const SUB_TEXT = "text-xs text-gray-400"

export default function Component(props: {
    show: boolean,
    lan: languages,
    setShow: (show: boolean) => void,
}) {
    const {lan = DEFAULT_LANGUAGE, show, setShow} = props

    return <Modal dismissible show={show} onClose={() => setShow(false)}>
        <Modal.Header>
            <div className={"flex items-center gap-2"}>
                {TRANSLATE.manual[lan]}
            </div>
        </Modal.Header>

        <Modal.Body className={"text-gray-900 dark:text-gray-100"}>
            <Grid>
                <Row>
                    <Title> <SettingsIcon color={"gray"}/>{TRANSLATE.settings[lan]} </Title>
                    <SubRow> <MetaKey/>, </SubRow>
                </Row>
                <Row>
                    <Title> <ManualIcon size={16} color={"gray"}/>{TRANSLATE.manual[lan]} </Title>
                    <SubRow> F12 </SubRow>
                </Row>
            </Grid>
            <Divider horizontal={true} className={"my-3"}/>
            <Grid>
                <Row>
                    <Title> {TRANSLATE.foldCode[lan]} </Title>
                    <SubRow> <MetaKey/>- </SubRow>
                </Row>
                <Row>
                    <SubRow> <Title> {TRANSLATE.unfoldCode[lan]} </Title> </SubRow>
                    <SubRow> <MetaKey/>+ </SubRow>
                </Row>
                <Row>
                    <Title> {TRANSLATE.foldAll[lan]} </Title>
                    <SubRow> <CtrlKey/><OptionKey/>[ </SubRow>
                </Row>
                <Row>
                    <Title> {TRANSLATE.unfoldAll[lan]} </Title>
                    <SubRow> <CtrlKey/><OptionKey/>] </SubRow>
                </Row>
            </Grid>
            <Divider horizontal={true} className={"my-3"}/>
            <Grid>
                <Row>
                    <Title> <RunICon color={"gray"}/>{TRANSLATE.run[lan]} </Title>
                    <SubRow> <MetaKey/><EnterKey/> </SubRow>
                </Row>
                <Row>
                    <Title> <FormatIcon color={"gray"}/>{TRANSLATE.format[lan]} </Title>
                    <SubRow>
                        <span className={`mr-2 flex items-center ${SUB_TEXT}`}><MetaKey/><OptionKey/>L</span>
                        <ShiftKey/><OptionKey/>F
                    </SubRow>
                </Row>
                <Row>
                    <Title> <ShareIcon color={"gray"}/>{TRANSLATE.share[lan]} </Title>
                    <SubRow> <MetaKey/>S </SubRow>
                </Row>
                <Row>
                    <Title> <SearchIcon color={"gray"}/>{TRANSLATE.search[lan]} </Title>
                    <SubRow> <MetaKey/>F </SubRow>
                </Row>
            </Grid>
            <Divider horizontal={true} className={"my-3"}/>
            <Grid>
                <Row>
                    <Title> {TRANSLATE.openLintPanel[lan]} </Title>
                    <SubRow> <MetaKey/><ShiftKey/>M </SubRow>
                </Row>
                <Row>
                    <Title> {TRANSLATE.nextDiagnostic[lan]} </Title>
                    <SubRow> F8 </SubRow>
                </Row>
            </Grid>
            <Divider horizontal={true} className={"my-3"}/>
            <Grid>
                <Row>
                    <Title> {TRANSLATE.prevFile[lan]} </Title>
                    <SubRow> <MetaKey/><OptionKey/>[ </SubRow>
                </Row>
                <Row>
                    <Title> {TRANSLATE.nextFile[lan]} </Title>
                    <SubRow> <MetaKey/><OptionKey/>] </SubRow>
                </Row>
            </Grid>
            <Divider horizontal={true} className={"my-3"}/>
            <Grid>
                <Row>
                    <Title> {TRANSLATE.definitions[lan]} </Title>
                    <SubRow> <MetaKey/>B </SubRow>
                </Row>
                <Row>
                    <Title> {TRANSLATE.implementations[lan]} </Title>
                    <SubRow> <MetaKey/><OptionKey/>B </SubRow>
                </Row>
            </Grid>
            <Grid>
                <Row>
                    <span className={"text-xs text-gray-400"}>Or hover & click</span>
                </Row>
            </Grid>

            <Divider horizontal={true} className={"my-3"}/>
            <Grid>
                <Row>
                    <Title> {TRANSLATE.usages[lan]} </Title>
                    <SubRow>
                        <span className={`mr-2 flex items-center ${SUB_TEXT}`}>
                            <MetaKey/><OptionKey/>F7
                        </span>
                        <ShiftKey/>F12
                    </SubRow>
                </Row>
                <Row>
                    <Title> {TRANSLATE.suggestCompletion[lan]} </Title>
                    <SubRow> <CtrlKey/>Space </SubRow>
                </Row>
            </Grid>
        </Modal.Body>
    </Modal>
}
