import {Menu, Item, Separator} from 'react-contexify';
import 'react-contexify/ReactContexify.css';
import {EDITOR_MENU_ID} from "../constants.ts";
import {EditorView} from "@codemirror/view";
import {useThemeMode} from "flowbite-react";
import {
    Row,
    Typography
} from "./Common.tsx";

import {useCallback, useContext} from "react";

import {TRANSLATE} from "../lib/i18n.ts";
import {
    CopyIcon,
    CutIcon,
    EnterKey,
    FormatIcon,
    MetaKey,
    OptionKey,
    PasteIcon,
    RunICon,
    ShareIcon,
    ShiftKey
} from "./Icons.tsx";
import {AppCtx} from "../utils.ts";

function CopyItem(props: {
    view: EditorView;
    cut?: boolean;
}) {
    const {view, cut} = props;
    const {lan} = useContext(AppCtx)
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
                        <Row className={"w-full"}>
                            {

                                cut
                                    ? <Typography variant={"body2"} className={"flex items-center gap-1.5"}>
                                        <CutIcon/>{TRANSLATE.cut[lan]}
                                    </Typography>
                                    : <Typography variant={"body2"} className={"flex items-center gap-1.5"}>
                                        <CopyIcon/>{TRANSLATE.copy[lan]}
                                    </Typography>
                            }
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
}) {
    const {view} = props;
    const {lan} = useContext(AppCtx)
    return (
        navigator.clipboard && (
            <Item onClick={() => navigator.clipboard.readText().then(text => {
                view.dispatch({
                    changes: {from: view.state.selection.main.from, to: view.state.selection.main.to, insert: text}
                });
            })}>
                <Row className={"w-full"}>
                    <Typography variant={"body2"} className={"flex items-center gap-1.5"}>
                        <PasteIcon/>{TRANSLATE.paste[lan]}
                    </Typography>
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
    seeUsages: () => boolean;
}) {
    const {view, seeDefinition, seeImplementation, seeUsages} = props;
    const {lan} = useContext(AppCtx)
    const onSeeDefinition = useCallback(() => {
        seeDefinition();
        view.focus();
    }, [seeDefinition, view]);
    const onSeeImplementation = useCallback(() => {
        seeImplementation();
        view.focus();
    }, [seeImplementation, view]);
    const onSeeUsages = useCallback(() => {
        seeUsages();
        view.focus();
    }, [seeUsages, view]);

    return (
        view.state.wordAt(view.state.selection.main.head) && (
            <>
                <Item onClick={onSeeDefinition}>
                    <Row className={"w-full"}>
                        <Typography variant={"body2"}>{TRANSLATE.definitions[lan]}</Typography>
                        <Typography variant={"caption"} className={"flex items-center"}> <MetaKey/>B </Typography>
                    </Row>
                </Item>
                <Item onClick={onSeeImplementation}>
                    <Row className={"w-full"}>
                        <Typography variant={"body2"}>{TRANSLATE.implementations[lan]}</Typography>
                        <Typography variant={"caption"} className={"flex items-center"}>
                            <MetaKey/><OptionKey/>B
                        </Typography>
                    </Row>
                </Item>
                <Item onClick={onSeeUsages}>
                    <Row className={"w-full"}>
                        <Typography variant={"body2"}>{TRANSLATE.usages[lan]}</Typography>
                        <Typography variant={"caption"} className={"flex items-center"}>
                            <MetaKey/><OptionKey/>F7<span>&#160;</span><span>&#160;</span>or<span>&#160;</span><span>&#160;</span><ShiftKey/>F12
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
    seeUsages: () => boolean;
    run: () => void;
    format: () => void;
    share: () => void;
}) {
    const {mode} = useThemeMode()
    const {lan} = useContext(AppCtx)
    const {view, seeDefinition, seeImplementation, seeUsages, run, format, share} = props;

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
            <GotoItem view={view}
                      seeDefinition={seeDefinition}
                      seeImplementation={seeImplementation}
                      seeUsages={seeUsages}
            />

            <CopyItem view={view} cut={true}/>
            <CopyItem view={view}/>
            <PasteItem view={view}/>

            <Separator/>

            <Item onClick={onRun}>
                <Row className={"w-full"}>
                    <Typography variant={"body2"} className={"flex items-center gap-1.5"}>
                        <RunICon/>{TRANSLATE.run[lan]}
                    </Typography>
                    <Typography variant={"caption"} className={"flex items-center"}> <MetaKey/><EnterKey/> </Typography>
                </Row>
            </Item>
            <Item onClick={onFormat}>
                <Row className={"w-full"}>
                    <Typography variant={"body2"} className={"flex items-center gap-1.5"}>
                        <FormatIcon/>{TRANSLATE.format[lan]}
                    </Typography>
                    <Typography variant={"caption"} className={"flex items-center"}>
                        <MetaKey/><OptionKey/>L<span>&#160;</span><span>&#160;</span>or<span>&#160;</span><span>&#160;</span><ShiftKey/><OptionKey/>F
                    </Typography>
                </Row>
            </Item>
            <Item onClick={onShare}>
                <Row className={"w-full"}>
                    <Typography variant={"body2"} className={"flex items-center gap-1.5"}>
                        <ShareIcon/>{TRANSLATE.share[lan]}
                    </Typography>
                    <Typography variant={"caption"} className={"flex items-center"}> <MetaKey/>S </Typography>
                </Row>
            </Item>
        </Menu>
    )
}
