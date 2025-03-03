import {useEffect, useState} from "react";
import MonacoEditor from "react-monaco-editor/lib/editor";
import * as monaco from "monaco-editor";

function editorDidMount(editor: monaco.editor.IStandaloneCodeEditor) {
    editor.focus();
}

export default function Component() {
    const [code, setcode] = useState("")
    const options: monaco.editor.IStandaloneEditorConstructionOptions = {
        selectOnLineNumbers: true
    };

    function onChange(newValue: string, e: monaco.editor.IModelContentChangedEvent) {
        setcode(newValue)
        console.log('onChange', newValue, e);
    }

    return (
        <>
            <MonacoEditor
                height="100vh"
                language="go"
                theme="vs-dark"
                value={code}
                options={options}
                onChange={onChange}
                editorDidMount={editorDidMount}
            />
        </>
    )
}
