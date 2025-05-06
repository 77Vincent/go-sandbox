import {Menu, Item, Separator} from 'react-contexify';
import 'react-contexify/ReactContexify.css';
import {EDITOR_MENU_ID} from "../constants.ts";
import {EditorView} from "@codemirror/view";
import {useThemeMode} from "flowbite-react";
import {MetaKey, Row, Typography} from "./Common.tsx";

import {useCallback} from "react";
import {
    MdKeyboardOptionKey as AltKey,
    MdKeyboardOptionKey as OptionKey,
    MdKeyboardReturn as EnterKey,
} from "react-icons/md";
import {TRANSLATE} from "../lib/i18n.ts";
import {languages} from "../types";
import {BsShift as ShiftKey} from "react-icons/bs";

function CopyItem(props: {
    view: EditorView;
    lan: languages;
    cut?: boolean;
}) {
    const {view, lan, cut} = props;
    const onClick = useCallback((text: string) => {
        navigator.clipboard.writeText(text);

        if (cut) {
            view.dispatch({
                changes: {from: view.state.selection.main.from, to: view.state.selection.main.to, insert: ""}
            });
        }
    }, [cut, view]);

    return (
        view.state.selection.ranges.map((range, index) => {
            const {from, to} = range;
            const text = view.state.sliceDoc(from, to);
            if (text.length > 0) {
                return (
                    <Item key={index} onClick={() => onClick(text)}>
                        <Row>
                            <Typography variant={"body2"}>{
                                cut ? TRANSLATE.cut[lan] : TRANSLATE.copy[lan]
                            }</Typography>
                            {
                                cut ? <Typography variant={"caption"} className={"flex items-center"}> <MetaKey/>X
                                    </Typography>
                                    : <Typography variant={"caption"} className={"flex items-center"}> <MetaKey/>C
                                    </Typography>
                            }
                        </Row>
                    </Item>
                )
            }
        })
    )
}

function PasteItem(props: {
    view: EditorView;
    lan: languages;
}) {
    const {view, lan} = props;
    return (
        navigator.clipboard && (
            <Item onClick={() => navigator.clipboard.readText().then(text => {
                view.dispatch({
                    changes: {from: view.state.selection.main.from, to: view.state.selection.main.to, insert: text}
                });
            })}>
                <Row>
                    <Typography variant={"body2"}>{TRANSLATE.paste[lan]}</Typography>
                    <Typography variant={"caption"} className={"flex items-center"}> <MetaKey/>V </Typography>
                </Row>
            </Item>
        )
    )
}

function GotoItem(props: {
    view: EditorView;
    lan: languages;
    seeDefinition: () => boolean;
    seeImplementation: () => boolean;
}) {
    const {view, lan, seeDefinition, seeImplementation} = props;
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
                        <Typography variant={"body2"}>{TRANSLATE.definitions[lan]}</Typography>
                        <Typography variant={"caption"} className={"flex items-center"}> <MetaKey/>B </Typography>
                    </Row>
                </Item>
                <Item onClick={onSeeImplementation}>
                    <Row>
                        <Typography variant={"body2"}>{TRANSLATE.implementations[lan]}</Typography>
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
    lan: languages;
    view: EditorView | null;
    seeDefinition: () => boolean;
    seeImplementation: () => boolean;
    run: () => void;
    format: () => void;
    share: () => void;
}) {
    const {mode} = useThemeMode()
    const {lan, view, seeDefinition, seeImplementation, run, format, share} = props;

    const onRun = useCallback(() => {
        run();
        view?.focus();
    }, [run, view]);
    const onFormat = useCallback(() => {
        format();
        view?.focus();
    }, [format, view]);
    const onShare = useCallback(() => {
        share();
        view?.focus();
    }, [share, view]);


    if (!view) {
        return null;
    }

    return (
        <Menu theme={mode} id={EDITOR_MENU_ID} className={"text-sm font-light dark:border dark:border-gray-700"}>
            <GotoItem view={view} lan={lan} seeDefinition={seeDefinition} seeImplementation={seeImplementation}/>

            <CopyItem view={view} lan={lan} cut={true}/>
            <CopyItem view={view} lan={lan}/>
            <PasteItem view={view} lan={lan}/>

            <Separator/>

            <Item onClick={onRun}>
                <Row>
                    <Typography variant={"body2"}>{TRANSLATE.run[lan]}</Typography>
                    <Typography variant={"caption"} className={"flex items-center"}> <MetaKey/><EnterKey/> </Typography>
                </Row>
            </Item>
            <Item onClick={onFormat}>
                <Row>
                    <Typography variant={"body2"}>{TRANSLATE.format[lan]}</Typography>
                    <Typography variant={"caption"} className={"flex items-center"}>
                        <MetaKey/><AltKey/>L<span>&#160;</span><span>&#160;</span>or<span>&#160;</span><span>&#160;</span><ShiftKey/><AltKey/>F
                    </Typography>
                </Row>
            </Item>
            <Item onClick={onShare}>
                <Row>
                    <Typography variant={"body2"}>{TRANSLATE.share[lan]}</Typography>
                    <Typography variant={"caption"} className={"flex items-center"}> <MetaKey/>S </Typography>
                </Row>
            </Item>
        </Menu>
    )
}
