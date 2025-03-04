import {useRef, useState} from "react";
import {Button, DarkThemeToggle, useThemeMode} from "flowbite-react";
import {AUTO_RUN_KEY, DEFAULT_CODE, DEFAULT_LINE, VIM_MODE_KEY} from "../constants.ts";
import AceEditor from "react-ace";
import {Ace} from "ace-builds";

import "ace-builds/src-noconflict/mode-golang";
import "ace-builds/src-noconflict/theme-dawn";
import "ace-builds/src-noconflict/theme-one_dark";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/keybinding-vim"
import "ace-builds/src-noconflict/ext-statusbar";

export default function Component() {
    const {mode, toggleMode} = useThemeMode();
    const statusBarRef = useRef(null);

    const [code, setCode] = useState(DEFAULT_CODE)
    const [line, setLine] = useState(DEFAULT_LINE)

    const [isVimMode, setIsVimMode] = useState(JSON.parse(localStorage.getItem(VIM_MODE_KEY) || "false"))
    const [isAutoRun, setIsAutoRun] = useState(JSON.parse(localStorage.getItem(AUTO_RUN_KEY) || "false"))

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

    return (
        <div className="dark:bg-gray-800 bg-stone-100">
            <div className="flex justify-between items-center py-2 px-3  dark:text-white">
                <h1 className="text-2xl font-bold">Golang Sandbox</h1>

                <div className="flex gap-2 justify-end items-center">
                    <Button className={"shadow"} size={"xs"} gradientDuoTone={"purpleToBlue"}>
                        Run
                    </Button>

                    <Button className={"shadow"} onClick={onAutoRun} size={"xs"} color={isAutoRun ? "purple" : "gray"}>Auto
                        Run</Button>
                    <Button className={"shadow"} onClick={onVimMode} size={"xs"}
                            color={isVimMode ? "purple" : "gray"}>VIM</Button>
                    <Button className={"shadow"} size={"xs"} gradientDuoTone={"greenToBlue"}>Export</Button>

                    <DarkThemeToggle onClick={onDarkThemeToggle}/>
                </div>
            </div>

            <div className={"m-3 border rounded-lg border-gray-300 dark:border-gray-700"}>
                <AceEditor
                    mode="golang"
                    width={"100%"}
                    cursorStart={line}
                    height={"calc(100vh - 100px)"}
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
                <div ref={statusBarRef}></div>
            </div>
        </div>
    );
}
