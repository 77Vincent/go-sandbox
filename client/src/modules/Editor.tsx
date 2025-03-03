import {Editor} from "@monaco-editor/react";
import {useState} from "react";

const defaultCode = `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
`;

export default function Component() {
    const [code, setCode] = useState(defaultCode);

    function onChange(value: string | undefined) {
        setCode(value || "")
    }

    return <Editor
        theme="vs-dark"
        defaultLanguage="go"
        onChange={onChange}
        value={code}
        options={{
            fontSize: 14,
        }}
    />;
}
