import {Editor} from "@monaco-editor/react";
import {useEffect, useRef, useState} from "react";
import {Button} from "../Common.tsx";

const defaultCode = `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
`;

const vimModeKey = "vimMode";


export default function Component() {
    const statusBarRef = useRef(null);
    const [code, setCode] = useState(defaultCode);
    const [vimMode, setVimMode] = useState(JSON.parse(localStorage.getItem(vimModeKey) || "false"));

    useEffect(() => {
    }, []);

    // Called when the Monaco editor has mounted
    const handleEditorDidMount = async (editor, monaco) => {
        // Dynamically import monaco-vim
        const monacoVim = await import("monaco-vim");
        // Initialize Vim mode on the editor and attach the status bar element
        if (statusBarRef.current && vimMode) {
            monacoVim.initVimMode(editor, statusBarRef.current);
        }
    };

    function onVIMModeChange() {
        localStorage.setItem(vimModeKey, JSON.stringify(!vimMode));
        location.reload();
    }

    function onChange(value: string | undefined) {
        setCode(value || "")
    }

    return (
        <>
            <div>
                <Button onClick={onVIMModeChange} active={vimMode}>
                    VIM
                </Button>
            </div>
            <div style={{height: "100vh", display: "flex", flexDirection: "column"}}>
                <Editor
                    theme="vs-dark"
                    defaultLanguage="go"
                    onChange={onChange}
                    value={code}
                    options={{
                        fontSize: 14,
                        minimap: {enabled: false},
                    }}
                    onMount={handleEditorDidMount}
                />

                <div
                    ref={statusBarRef}
                    style={{
                        height: "30px",
                        backgroundColor: "#f0f0f0",
                        padding: "5px",
                        fontFamily: "monospace",
                    }}
                >
                    {/* Vim status will be shown here */}
                </div>
            </div>
        </>
    )
}
