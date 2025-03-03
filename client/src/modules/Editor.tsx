import {Editor} from "@monaco-editor/react";
import {useRef, useState} from "react";
import {Button, DarkThemeToggle, useThemeMode} from "flowbite-react";
import * as monaco from "monaco-editor";
import {AUTO_RUN_KEY, DEFAULT_CODE, VIM_MODE_KEY} from "../constants.ts";

export default function Component() {
    const {mode, toggleMode} = useThemeMode();
    const statusBarRef = useRef<HTMLDivElement | null>(null);
    const [code, setCode] = useState(DEFAULT_CODE)
    const [isVimMode, setIsVimMode] = useState(JSON.parse(localStorage.getItem(VIM_MODE_KEY) || "false"))
    const [isAutoRun, setIsAutoRun] = useState(JSON.parse(localStorage.getItem(AUTO_RUN_KEY) || "false"))

    async function onEditorMount(editor: monaco.editor.IStandaloneCodeEditor) {
        const monacoVim = await import("monaco-vim");

        if (isVimMode && statusBarRef.current) {
            monacoVim.initVimMode(editor, statusBarRef.current);
        }
    }

    function onChange(code: string = "") {
        setCode(code);
    }

    function onVimMode() {
        localStorage.setItem(VIM_MODE_KEY, JSON.stringify(!isVimMode));
        setIsVimMode(!isVimMode);
        location.reload();
    }

    function onAutoRun() {
        localStorage.setItem(AUTO_RUN_KEY, JSON.stringify(!isAutoRun));
        setIsAutoRun(!isAutoRun);
    }

    function onDarkThemeToggle() {
        toggleMode();
    }

    return (
        <div className="dark:bg-gray-800">
            <div className="flex justify-between items-center py-2 px-3  dark:text-white">
                <h1 className="text-2xl font-bold">Best Go Playground</h1>

                <div className="flex gap-2 justify-end items-center">
                    <Button className={"shadow"} size={"xs"} gradientDuoTone={"purpleToBlue"}>
                        Run
                    </Button>

                    <Button className={"shadow"} onClick={onVimMode} size={"xs"} color={isVimMode ? "purple" : "gray"}>VIM mode</Button>
                    <Button className={"shadow"} onClick={onAutoRun} size={"xs"} color={isAutoRun ? "purple" : "gray"}>Auto Run</Button>
                    <Button className={"shadow"} size={"xs"} gradientDuoTone={"greenToBlue"}>Export</Button>

                    <DarkThemeToggle onClick={onDarkThemeToggle}/>
                </div>
            </div>

            <Editor
                className={"border dark:border-gray-400 m-2 rounded"}
                theme={mode === "dark" ? "vs-dark" : "vs"}
                height="calc(100vh - 100px)"
                defaultLanguage="go"
                defaultValue={code}
                options={{
                    fontSize: 14,
                    minimap: {enabled: false}
                }}
                onChange={onChange}
                onMount={onEditorMount}
            />

            <div
                ref={statusBarRef}
                style={{
                    height: "30px",
                    backgroundColor: "#f0f0f0",
                    padding: "5px",
                    fontFamily: "monospace",
                }}
            />
        </div>
    );
}
