package snippets

const FileIO = `package main

import (
    "fmt"
    "os"
)

func main() {
    filename := "sample.txt"
    content := []byte("Hello, File I/O in Go!")

    // Write content to a file.
    err := os.WriteFile(filename, content, 0644)
    if err != nil {
        fmt.Println("Error writing file:", err)
        return
    }

    // Read the file content.
    data, err := os.ReadFile(filename)
    if err != nil {
        fmt.Println("Error reading file:", err)
        return
    }
    fmt.Println("File content:", string(data))

    // Clean up: remove the file.
    os.Remove(filename)
}`
