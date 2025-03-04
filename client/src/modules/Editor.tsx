import {useRef, useState} from "react";
import {Button, DarkThemeToggle, Tooltip, useThemeMode} from "flowbite-react";
import AceEditor from "react-ace";
import {Ace} from "ace-builds";
import {Resizable, ResizeDirection, NumberSize} from "re-resizable";

import {
    AUTO_RUN_KEY,
    DEFAULT_AUTO_RUN,
    DEFAULT_CODE,
    DEFAULT_LINE, DEFAULT_SIZE, DEFAULT_VIM_MODE,
    EDITOR_SIZE_KEY,
    VIM_MODE_KEY
} from "../constants.ts";
import {Divider, Wrapper} from "./Common.tsx";

import "ace-builds/src-noconflict/mode-golang";
import "ace-builds/src-noconflict/theme-dawn";
import "ace-builds/src-noconflict/theme-one_dark";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/keybinding-vim"
import "ace-builds/src-noconflict/ext-statusbar";

export default function Component() {
    const {mode, toggleMode} = useThemeMode();
    const statusBarRef = useRef(null);

    const [result, setResult] = useState("");
    const [code, setCode] = useState(DEFAULT_CODE)
    const [line, setLine] = useState(DEFAULT_LINE)

    const [editorSize, setEditorSize] = useState(JSON.parse(localStorage.getItem(EDITOR_SIZE_KEY) || DEFAULT_SIZE))
    const [isVimMode, setIsVimMode] = useState(JSON.parse(localStorage.getItem(VIM_MODE_KEY) || DEFAULT_VIM_MODE))
    const [isAutoRun, setIsAutoRun] = useState(JSON.parse(localStorage.getItem(AUTO_RUN_KEY) || DEFAULT_AUTO_RUN))

    const editorDidMount = (editor: Ace.Editor) => {
        if (statusBarRef.current) {
            const StatusBar = window.ace.require("ace/ext/statusbar").StatusBar;
            new StatusBar(editor, statusBarRef.current);
        }
    };

    function onChange(code: string = "") {
        setCode(code);
    }

    function onCursorChange(cursor: any) {
        setLine(cursor.row);
    }

    function onVimMode() {
        localStorage.setItem(VIM_MODE_KEY, JSON.stringify(!isVimMode));
        setIsVimMode(!isVimMode);
    }

    function onAutoRun() {
        localStorage.setItem(AUTO_RUN_KEY, JSON.stringify(!isAutoRun));
        setIsAutoRun(!isAutoRun);
    }

    function onDarkThemeToggle() {
        toggleMode();
    }

    function onResizeStop(_event: MouseEvent | TouchEvent, _dir: ResizeDirection, refToElement: HTMLElement, _deltas: NumberSize) {
        const size = (refToElement.clientWidth / window.innerWidth) * 100
        localStorage.setItem(EDITOR_SIZE_KEY, JSON.stringify(size))
        setEditorSize(size)
    }

    return (
        <div className="h-screen flex flex-col dark:bg-gray-800 bg-stone-100">
            <div className="flex justify-between items-center py-2 px-3  dark:text-white">
                <h1 className="text-2xl font-bold">Golang Sandbox</h1>

                <div className="flex gap-2 justify-end items-center">
                    <Button disabled={isAutoRun} className={"shadow"} size={"xs"} gradientDuoTone={"purpleToBlue"}>
                        Run
                    </Button>


                    <Button className={"shadow"} size={"xs"} gradientDuoTone={"greenToBlue"}>Export</Button>

                    <Divider/>

                    <Tooltip content={"VIM mode"}>
                        <Button className={"shadow"} onClick={onVimMode} size={"xs"}
                                color={isVimMode ? "purple" : "gray"}>VIM</Button>
                    </Tooltip>


                    <Tooltip content={"Auto Run"}>
                        <Button className={"shadow"} onClick={onAutoRun} size={"xs"}
                                color={isAutoRun ? "purple" : "gray"}>Auto</Button>
                    </Tooltip>

                    <Divider/>

                    <Tooltip content={"Dark mode"}>
                        <DarkThemeToggle onClick={onDarkThemeToggle}/>
                    </Tooltip>
                </div>
            </div>

            <div className={"px-3 pb-3 py-1 gap-2 flex flex-1"}>
                <Resizable
                    minWidth={"20%"}
                    maxWidth={"80%"}
                    enable={{
                        right: true
                    }}
                    defaultSize={{
                        width: `${editorSize}%`,
                        height: "100%"
                    }}
                    grid={[10, 1]}
                    onResizeStop={onResizeStop}
                >
                    <Wrapper className={"h-full flex flex-col"}>
                        <AceEditor
                            className={"rounded-t-lg flex-1"}
                            mode="golang"
                            width={"100%"}
                            cursorStart={line}
                            theme={mode === "dark" ? "one_dark" : "dawn"}
                            value={code}
                            onChange={onChange}
                            onCursorChange={onCursorChange}
                            focus={true}
                            fontSize={14}
                            name="UNIQUE_ID_OF_DIV"
                            keyboardHandler={isVimMode ? "vim" : ""}
                            editorProps={{$blockScrolling: true}}
                            setOptions={{
                                enableBasicAutocompletion: true,
                                enableLiveAutocompletion: true,
                                enableSnippets: true
                            }}
                            onLoad={editorDidMount}
                        />

                        <div ref={statusBarRef}
                             className={"px-3 border-t border-t-stone-400 dark:border-t-stone-500 bg-stone-200 dark:text-white dark:bg-stone-700"}/>
                    </Wrapper>
                </Resizable>

                <Wrapper className={"py-2 px-2 bg-stone-200"}>
                    {result}
                </Wrapper>
            </div>
        </div>
    );
}
