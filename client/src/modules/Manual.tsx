import {Modal} from "flowbite-react";

import {TRANSLATE} from "../constants.ts";
import {languages} from "../types";
import {MetaKey, Row, Grid, Divider} from "./Common.tsx";
import {ReactNode} from "react";
import {
    MdKeyboardControlKey as CtrlKey,
    MdKeyboardOptionKey as OptionKey,
    MdKeyboardAlt as ShiftKey,
} from "react-icons/md";

function SubRow(props: {
    children: ReactNode,
}) {
    return <div className={"flex items-center gap-0.5"}>
        {props.children}
    </div>
}

function Title(props: {
    children: ReactNode,
}) {
    return <div className={"text-sm"}>
        {props.children}
    </div>
}

export default function Component(props: {
    show: boolean,
    lan: languages,
    setShow: (show: boolean) => void,
}) {
    const {lan, show, setShow} = props

    return <Modal dismissible show={show} onClose={() => setShow(false)}>
        <Modal.Header>
            <div className={"flex items-center gap-2"}>
                {TRANSLATE.manual[lan]}
            </div>
        </Modal.Header>

        <Modal.Body className={"text-gray-900 dark:text-gray-100"}>
            <Grid>
                <Row>
                    <Title> {TRANSLATE.settings[lan]} </Title>
                    <SubRow>
                        <MetaKey/>,
                    </SubRow>
                </Row>
                <Row>
                    <Title> {TRANSLATE.manual[lan]} </Title>
                    <SubRow>
                        F12
                    </SubRow>
                </Row>
            </Grid>
            <Divider horizontal={true} className={"my-3"}/>
            <Grid>
                <Row>
                    <Title> {TRANSLATE.foldCode[lan]} </Title>
                    <SubRow>
                        <MetaKey/><OptionKey/>[
                    </SubRow>
                </Row>
                <Row>
                    <SubRow>
                        <Title> {TRANSLATE.unfoldCode[lan]} </Title>
                    </SubRow>
                    <SubRow>
                        <MetaKey/><OptionKey/>]
                    </SubRow>
                </Row>
                <Row>
                    <Title> {TRANSLATE.foldAll[lan]} </Title>
                    <SubRow>
                        <CtrlKey/><OptionKey/>[
                    </SubRow>
                </Row>
                <Row>
                    <Title> {TRANSLATE.unfoldAll[lan]} </Title>
                    <SubRow>
                        <CtrlKey/><OptionKey/>]
                    </SubRow>
                </Row>
            </Grid>
            <Divider horizontal={true} className={"my-3"}/>
            <Grid>
                <Row>
                    <Title> {TRANSLATE.run[lan]} </Title>
                    <SubRow>
                        <MetaKey/>r
                    </SubRow>
                </Row>
                <Row>
                    <Title> {TRANSLATE.format[lan]} </Title>
                    <SubRow>
                        <MetaKey/><OptionKey/>l
                    </SubRow>
                </Row>
                <Row>
                    <Title> {TRANSLATE.share[lan]} </Title>
                    <SubRow>
                        <MetaKey/>s
                    </SubRow>
                </Row>
                <Row>
                    <Title> {TRANSLATE.search[lan]} </Title>
                    <SubRow>
                        <MetaKey/>f
                    </SubRow>
                </Row>
            </Grid>
            <Divider horizontal={true} className={"my-3"}/>
            <Grid>
                <Row>
                    <Title> {TRANSLATE.openLintPanel[lan]} </Title>
                    <SubRow>
                        <MetaKey/><ShiftKey/>m
                    </SubRow>
                </Row>
                <Row>
                    <Title> {TRANSLATE.nextDiagnostic[lan]} </Title>
                    <SubRow>
                        F8
                    </SubRow>
                </Row>
                <Row>
                    <Title> {TRANSLATE.suggestCompletion[lan]} </Title>
                    <SubRow>
                        <CtrlKey/>Space
                    </SubRow>
                </Row>
            </Grid>
            <Divider horizontal={true} className={"my-3"}/>
            <Grid>
                <Row>
                    <Title> {TRANSLATE.definitions[lan]} </Title>
                    <SubRow>
                        <MetaKey/>b
                    </SubRow>
                </Row>
                <Row>
                    <Title> {TRANSLATE.usages[lan]} </Title>
                    <SubRow>
                        <MetaKey/><OptionKey/>F7
                    </SubRow>
                </Row>
            </Grid>
            <Grid>
                <Row>
                    <span className={"text-xs text-gray-400"}>Or hover & click</span>
                </Row>
            </Grid>
        </Modal.Body>
    </Modal>
}
