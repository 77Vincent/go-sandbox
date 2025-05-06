import {Menu, Item, Separator} from 'react-contexify';
import 'react-contexify/ReactContexify.css';
import {EDITOR_MENU_ID} from "../constants.ts";
import {EditorView} from "@codemirror/view";
import {useThemeMode} from "flowbite-react";
import {MetaKey, Row, Typography} from "./Common.tsx";

import {useCallback} from "react";
import {
    MdKeyboardOptionKey as OptionKey,
} from "react-icons/md";

function CopyItem(props: {
    view: EditorView;
}) {
    const {view} = props;
    return (
        view.state.selection.ranges.map((range, index) => {
            const {from, to} = range;
            const text = view.state.sliceDoc(from, to);
            if (text.length > 0) {
                return (
                    <Item key={index} onClick={() => navigator.clipboard.writeText(text)}>
                        <Row>
                            <Typography variant={"body2"}> Copy </Typography>
                            <Typography variant={"caption"} className={"flex items-center"}> <MetaKey/>C </Typography>
                        </Row>
                    </Item>
                )
            }
        })
    )
}

function PasteItem(props: {
    view: EditorView;
}) {
    const {view} = props;
    return (
        navigator.clipboard && (
            <Item onClick={() => navigator.clipboard.readText().then(text => {
                view.dispatch({
                    changes: {from: view.state.selection.main.from, to: view.state.selection.main.to, insert: text}
                });
            })}>
                <Row>
                    <Typography variant={"body2"}> Paste </Typography>
                    <Typography variant={"caption"} className={"flex items-center"}> <MetaKey/>V </Typography>
                </Row>
            </Item>
        )
    )
}

function GotoItem(props: {
    view: EditorView;
    seeDefinition: () => boolean;
    seeImplementation: () => boolean;
}) {
    const {view, seeDefinition, seeImplementation} = props;
    const onSeeDefinition = useCallback(() => {
        seeDefinition();
        view.focus();
    }, [seeDefinition, view]);
    const onSeeImplementation = useCallback(() => {
        seeImplementation();
        view.focus();
    }, [seeImplementation, view]);

    return (
        view.state.wordAt(view.state.selection.main.head) && (
            <>
                <Item onClick={onSeeDefinition}>
                    <Row>
                        <Typography variant={"body2"}> Go to Definition </Typography>
                        <Typography variant={"caption"} className={"flex items-center"}> <MetaKey/>B </Typography>
                    </Row>
                </Item>
                <Item onClick={onSeeImplementation}>
                    <Row>
                        <Typography variant={"body2"}> Go to Implementation </Typography>
                        <Typography variant={"caption"} className={"flex items-center"}>
                            <MetaKey/><OptionKey/>B
                        </Typography>
                    </Row>
                </Item>
                <Separator/>
            </>
        )
    )
}

export default function Component(props: {
    view: EditorView | null;
    seeDefinition: () => boolean;
    seeImplementation: () => boolean;
}) {
    const {mode} = useThemeMode()
    const {view, seeDefinition, seeImplementation} = props;

    if (!view) {
        return null;
    }

    return (
        <Menu theme={mode} id={EDITOR_MENU_ID} className={"text-sm font-light dark:border dark:border-gray-700"}>
            <GotoItem view={view} seeDefinition={seeDefinition} seeImplementation={seeImplementation}/>
            <CopyItem view={view}/>
            <PasteItem view={view}/>
        </Menu>
    )
}
