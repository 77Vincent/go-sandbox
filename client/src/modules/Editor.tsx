import {Editor} from "@monaco-editor/react";
import {useRef, useState} from "react";
import {Button} from "flowbite-react";

const defaultCode = `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`

export default function Component() {
    const [code, setCode] = useState(defaultCode)
    const editorRef = useRef(null);

    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
    }

    return (
        <>
            <div className="flex gap-2 mb-2 px-2 justify-end">
                <Button>VIM</Button>
                <Button>VIM</Button>
            </div>
            <Editor
                height="90vh"
                theme="vs-dark"
                defaultLanguage="go"
                defaultValue={code}
                options={{
                    fontSize: 14
            }}
                onMount={handleEditorDidMount}
            />
        </>
    );
}
