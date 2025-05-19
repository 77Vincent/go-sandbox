import {Modal} from "flowbite-react";

import {
    Row,
    Grid,
    Divider, Typography,
} from "./Common.tsx";
import {ReactNode, useContext} from "react";
import {TRANSLATE} from "../lib/i18n.ts";
import {
    CtrlKey, EnterKey, FoldAllIcon, FoldIcon,
    FormatIcon,
    ManualIcon,
    MetaKey, NextIcon, OptionKey, PrevIcon,
    RunIcon,
    SearchIcon,
    SettingsIcon,
    ShareIcon,
    ShiftKey, UnfoldAllIcon, UnfoldIcon
} from "./Icons.tsx";
import {AppCtx} from "../utils.ts";

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
    return <Typography variant={"body1"} className={"flex items-center gap-2 max-md:text-xs"}>
        {props.children}
    </Typography>
}

const SUB_TEXT = "text-xs text-gray-400"

export default function Component(props: {
    show: boolean,
    setShow: (show: boolean) => void,
}) {
    const {show, setShow} = props
    const {lan} = useContext(AppCtx)

    return <Modal dismissible show={show} onClose={() => setShow(false)}>
        <Modal.Header>
            <div className={"flex items-center gap-2"}>
                {TRANSLATE.manual[lan]}
            </div>
        </Modal.Header>

        <Modal.Body className={"text-gray-900 dark:text-gray-100"}>
            <Grid>
                <Row>
                    <Title> <SettingsIcon size={16} opacity={0.8} color={"gray"}/>{TRANSLATE.settings[lan]} </Title>
                    <SubRow> <MetaKey/>, </SubRow>
                </Row>
                <Row>
                    <Title> <ManualIcon size={18} opacity={0.8} color={"gray"}/>{TRANSLATE.manual[lan]} </Title>
                    <SubRow> F12 </SubRow>
                </Row>
            </Grid>
            <Divider horizontal={true} className={"my-3"}/>
            <Grid>
                <Row>
                    <Title> <FoldIcon size={16} opacity={0.8} color={"gray"}/>{TRANSLATE.foldCode[lan]} </Title>
                    <SubRow> <MetaKey/>- </SubRow>
                </Row>
                <Row>
                    <Title> <UnfoldIcon size={16} opacity={0.8} color={"gray"}/>{TRANSLATE.unfoldCode[lan]} </Title>
                    <SubRow> <MetaKey/>+ </SubRow>
                </Row>
                <Row>
                    <Title> <FoldAllIcon size={16} opacity={0.8} color={"gray"}/>{TRANSLATE.foldAll[lan]} </Title>
                    <SubRow> <CtrlKey/><OptionKey/>[ </SubRow>
                </Row>
                <Row>
                    <Title> <UnfoldAllIcon opacity={0.8} color={"gray"}/>{TRANSLATE.unfoldAll[lan]} </Title>
                    <SubRow> <CtrlKey/><OptionKey/>] </SubRow>
                </Row>
            </Grid>
            <Divider horizontal={true} className={"my-3"}/>
            <Grid>
                <Row>
                    <Title> <RunIcon size={16} opacity={0.7} color={"gray"}/>{TRANSLATE.run[lan]} </Title>
                    <SubRow> <MetaKey/><EnterKey/> </SubRow>
                </Row>
                <Row>
                    <Title> <FormatIcon size={16} opacity={0.7} color={"gray"}/>{TRANSLATE.format[lan]} </Title>
                    <SubRow>
                        <span className={`mr-2 flex items-center ${SUB_TEXT}`}><MetaKey/><OptionKey/>L</span>
                        <ShiftKey/><OptionKey/>F
                    </SubRow>
                </Row>
                <Row>
                    <Title> <ShareIcon size={16} opacity={0.7} color={"gray"}/>{TRANSLATE.share[lan]} </Title>
                    <SubRow> <MetaKey/>S </SubRow>
                </Row>
                <Row>
                    <Title> <SearchIcon size={16} color={"gray"}/>{TRANSLATE.search[lan]} </Title>
                    <SubRow> <MetaKey/>F </SubRow>
                </Row>
            </Grid>
            <Divider horizontal={true} className={"my-3"}/>
            <Grid>
                <Row>
                    <Title> <PrevIcon size={15} color={"gray"}/>{TRANSLATE.prevFile[lan]} </Title>
                    <SubRow> <MetaKey/><OptionKey/>[ </SubRow>
                </Row>
                <Row>
                    <Title> <NextIcon size={15} color={"gray"}/>{TRANSLATE.nextFile[lan]} </Title>
                    <SubRow> <MetaKey/><OptionKey/>] </SubRow>
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
