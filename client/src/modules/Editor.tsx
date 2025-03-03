import {Editor} from "@monaco-editor/react";
import {useRef, useState} from "react";
import {Button, DarkThemeToggle} from "flowbite-react";
import * as monaco from "monaco-editor";

const defaultCode = `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`

export default function Component() {
    const [code, setCode] = useState(defaultCode)

    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

    function onEditorMount(editor: monaco.editor.IStandaloneCodeEditor) {
        editorRef.current = editor;
    }

    function onChange(code: string = "") {
        setCode(code);
    }

    return (
        <>
            <div className="flex justify-between items-center py-2 px-3">
                <h1 className="text-2xl font-bold">Editor</h1>

                <div className="flex gap-2 justify-end">
                    <Button size={"sm"} color={"red"}>VIM</Button>
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
        </>
    );
}
