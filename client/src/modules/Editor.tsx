import {Editor} from "@monaco-editor/react";
import {useRef, useState} from "react";
import {Button, DarkThemeToggle} from "flowbite-react";
import * as monaco from "monaco-editor";

const VIM_MODE_KEY = "isVimMode";
const defaultCode = `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`

export default function Component() {
    const statusBarRef = useRef<HTMLDivElement | null>(null);
    const [code, setCode] = useState(defaultCode)
    const [isVimMode] = useState(JSON.parse(localStorage.getItem(VIM_MODE_KEY) || "false"))

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
        location.reload();
    }

    return (
        <>
            <div className="flex justify-between items-center py-2 px-3">
                <h1 className="text-2xl font-bold">Editor</h1>

                <div className="flex gap-2 justify-end">
                    <Button onClick={onVimMode} size={"sm"} color={"red"}>VIM mode</Button>
                    <Button size={"sm"} color={"red"}>Auto Run</Button>
                    <Button size={"sm"} gradientDuoTone={"greenToBlue"}>Export</Button>
                    <DarkThemeToggle/>
                </div>
            </div>

            <Editor
                theme="vs-dark"
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
        </>
    );
}
